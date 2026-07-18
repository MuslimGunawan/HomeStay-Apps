<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\CartItem;
use App\Models\Homestay;
use App\Models\PaymentMethod;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Determine if the current visitor is using a session-based (anonymous) cart.
     */
    private function isAnonymous(): bool
    {
        return ! Auth::check();
    }

    /**
     * Retrieve cart items, regardless of anonymous or authenticated.
     *
     * @return array<int, array<string, mixed>>
     */
    private function getCartItems(): array
    {
        if ($this->isAnonymous()) {
            return session('cart', []);
        }

        return CartItem::where('user_id', Auth::id())
            ->with(['homestay.media' => function ($q) {
                $q->where('is_primary', true);
            }])
            ->get()
            ->map(function ($item) {
                $checkIn = Carbon::parse($item->check_in);
                $checkOut = Carbon::parse($item->check_out);
                $days = $checkIn->diffInDays($checkOut);
                $item->days = $days;
                $item->price_subtotal = $item->homestay->price_per_night * $days;

                return $item;
            })
            ->toArray();
    }

    /**
     * View Guest Shopping Cart.
     */
    public function index()
    {
        if ($this->isAnonymous()) {
            $rawCart = session('cart', []);
            $cartItems = collect($rawCart)->map(function ($item) {
                $homestay = Homestay::with(['media' => function ($q) {
                    $q->where('is_primary', true);
                }])->find($item['homestay_id']);

                if (! $homestay) {
                    return null;
                }

                $checkIn = Carbon::parse($item['check_in']);
                $checkOut = Carbon::parse($item['check_out']);
                $days = $checkIn->diffInDays($checkOut);

                return [
                    'id' => $item['cart_key'],
                    'check_in' => $item['check_in'],
                    'check_out' => $item['check_out'],
                    'total_guests' => $item['total_guests'],
                    'days' => $days,
                    'price_subtotal' => $homestay->price_per_night * $days,
                    'homestay' => [
                        'id' => $homestay->id,
                        'name' => $homestay->name,
                        'city' => $homestay->city,
                        'address' => $homestay->address,
                        'price_per_night' => $homestay->price_per_night,
                        'media' => $homestay->media->toArray(),
                    ],
                ];
            })->filter()->values()->toArray();
        } else {
            $cartItems = CartItem::where('user_id', Auth::id())
                ->with(['homestay.media' => function ($q) {
                    $q->where('is_primary', true);
                }])
                ->get()
                ->map(function ($item) {
                    $checkIn = Carbon::parse($item->check_in);
                    $checkOut = Carbon::parse($item->check_out);
                    $days = $checkIn->diffInDays($checkOut);
                    $item->days = $days;
                    $item->price_subtotal = $item->homestay->price_per_night * $days;

                    return $item;
                })
                ->toArray();
        }

        $paymentMethods = PaymentMethod::where('is_active', true)->get();

        return Inertia::render('guest/cart', [
            'cartItems' => $cartItems,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Add Homestay to Shopping Cart (session for anonymous, DB for logged-in).
     */
    public function store(Request $request)
    {
        $request->validate([
            'homestay_id' => 'required|exists:homestays,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'total_guests' => 'required|integer|min:1',
        ]);

        $homestay = Homestay::findOrFail($request->homestay_id);

        if ($request->total_guests > $homestay->max_guests) {
            return back()->withErrors(['total_guests' => 'Jumlah tamu melebihi kapasitas maksimal kamar.']);
        }

        $checkIn = Carbon::parse($request->check_in);
        $checkOut = Carbon::parse($request->check_out);

        // Check if date overlaps with confirmed/pending bookings
        $overlapBooking = Booking::where('homestay_id', $homestay->id)
            ->whereIn('status', ['confirmed', 'pending_approval'])
            ->where(function ($q) use ($checkIn, $checkOut) {
                $q->whereBetween('check_in', [$checkIn, $checkOut->copy()->subDay()])
                    ->orWhereBetween('check_out', [$checkIn->copy()->addDay(), $checkOut])
                    ->orWhere(function ($sq) use ($checkIn, $checkOut) {
                        $sq->where('check_in', '<=', $checkIn)
                            ->where('check_out', '>=', $checkOut);
                    });
            })
            ->exists();

        if ($overlapBooking) {
            return back()->withErrors(['check_in' => 'Kamar ini sudah terbooking pada rentang tanggal tersebut.']);
        }

        if ($this->isAnonymous()) {
            // Session-based cart for anonymous visitors
            $cart = session('cart', []);
            $cartKey = 'homestay_'.$homestay->id;

            $cart[$cartKey] = [
                'cart_key' => $cartKey,
                'homestay_id' => $homestay->id,
                'check_in' => $checkIn->format('Y-m-d'),
                'check_out' => $checkOut->format('Y-m-d'),
                'total_guests' => $request->total_guests,
            ];

            session(['cart' => $cart]);
        } else {
            // DB-based cart for authenticated users
            CartItem::updateOrCreate([
                'user_id' => Auth::id(),
                'homestay_id' => $homestay->id,
            ], [
                'check_in' => $checkIn->format('Y-m-d'),
                'check_out' => $checkOut->format('Y-m-d'),
                'total_guests' => $request->total_guests,
            ]);
        }

        return redirect()->route('guest.cart')->with('success', 'Kamar berhasil ditambahkan ke keranjang belanja Anda.');
    }

    /**
     * Remove Item from Cart.
     */
    public function destroy(string $id)
    {
        if ($this->isAnonymous()) {
            $cart = session('cart', []);
            unset($cart[$id]);
            session(['cart' => $cart]);

            return back()->with('success', 'Item berhasil dihapus dari keranjang.');
        }

        $cartItem = CartItem::findOrFail($id);

        if ($cartItem->user_id !== Auth::id()) {
            abort(403);
        }

        $cartItem->delete();

        return back()->with('success', 'Item berhasil dihapus dari keranjang.');
    }

    /**
     * Checkout Cart items simultaneously (supports both anonymous & authenticated).
     */
    public function checkout(Request $request)
    {
        $isAnon = $this->isAnonymous();

        $request->validate([
            'payment_method_id' => 'required|exists:payment_methods,id',
            'name' => $isAnon ? 'required|string|max:255' : 'nullable',
            'email' => $isAnon ? 'required|email|max:255' : 'nullable',
            'phone' => $isAnon ? 'required|string|max:20' : 'nullable',
        ]);

        $tempPassword = null;
        $newUserCreated = false;

        // Build cart items list from the correct storage
        if ($isAnon) {
            $rawCart = session('cart', []);
            if (empty($rawCart)) {
                return back()->withErrors(['cart' => 'Keranjang belanja Anda kosong.']);
            }
        } else {
            $dbItems = CartItem::where('user_id', Auth::id())->get();
            if ($dbItems->isEmpty()) {
                return back()->withErrors(['cart' => 'Keranjang belanja Anda kosong.']);
            }
        }

        try {
            $createdBookings = DB::transaction(function () use ($request, $isAnon, &$tempPassword, &$newUserCreated) {
                // 1. Resolve / auto-register User
                $user = Auth::user();

                if (! $user) {
                    $user = User::where('email', $request->email)->first();

                    if (! $user) {
                        $tempPassword = 'Homestay@'.$request->phone;
                        $user = User::create([
                            'name' => $request->name,
                            'email' => $request->email,
                            'phone' => $request->phone,
                            'password' => Hash::make($tempPassword),
                            'role' => 'guest',
                        ]);
                        $newUserCreated = true;
                    }

                    Auth::login($user);
                }

                // 2. Collect cart items from session OR DB
                if ($isAnon) {
                    $rawCart = session('cart', []);
                    $cartItems = collect($rawCart)->map(function ($item) {
                        return (object) [
                            'homestay_id' => $item['homestay_id'],
                            'check_in' => $item['check_in'],
                            'check_out' => $item['check_out'],
                            'total_guests' => $item['total_guests'],
                        ];
                    });
                } else {
                    $cartItems = CartItem::where('user_id', $user->id)->get();
                }

                $bookings = [];

                foreach ($cartItems as $item) {
                    $homestay = Homestay::findOrFail($item->homestay_id);
                    $checkIn = Carbon::parse($item->check_in);
                    $checkOut = Carbon::parse($item->check_out);
                    $days = $checkIn->diffInDays($checkOut);
                    $totalPrice = $homestay->price_per_night * $days;

                    // Pessimistic double-check for overlapping bookings
                    $overlap = Booking::where('homestay_id', $homestay->id)
                        ->whereIn('status', ['confirmed', 'pending_approval'])
                        ->where(function ($q) use ($checkIn, $checkOut) {
                            $q->whereBetween('check_in', [$checkIn, $checkOut->copy()->subDay()])
                                ->orWhereBetween('check_out', [$checkIn->copy()->addDay(), $checkOut])
                                ->orWhere(function ($sq) use ($checkIn, $checkOut) {
                                    $sq->where('check_in', '<=', $checkIn)
                                        ->where('check_out', '>=', $checkOut);
                                });
                        })
                        ->lockForUpdate()
                        ->exists();

                    if ($overlap) {
                        throw new \Exception("Maaf, kamar '{$homestay->name}' sudah dipesan pada tanggal tersebut. Silakan periksa isi keranjang Anda.");
                    }

                    $bookings[] = Booking::create([
                        'user_id' => $user->id,
                        'homestay_id' => $homestay->id,
                        'payment_method_id' => $request->payment_method_id,
                        'check_in' => $checkIn->format('Y-m-d'),
                        'check_out' => $checkOut->format('Y-m-d'),
                        'total_guests' => $item->total_guests,
                        'total_price' => $totalPrice,
                        'status' => 'pending_payment',
                    ]);
                }

                // 3. Clear cart (session or DB)
                if ($isAnon) {
                    session()->forget('cart');
                } else {
                    CartItem::where('user_id', $user->id)->delete();
                }

                return $bookings;
            });
        } catch (\Exception $e) {
            return back()->withErrors(['cart' => $e->getMessage()]);
        }

        return redirect()->route('guest.bookings')->with([
            'success' => 'Berhasil checkout '.count($createdBookings).' kamar. Silakan unggah bukti transfer pembayaran di masing-masing kamar.',
            'temp_password' => $tempPassword,
            'new_user' => $newUserCreated ? '1' : '0',
        ]);
    }
}
