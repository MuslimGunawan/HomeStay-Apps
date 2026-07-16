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
     * View Guest Shopping Cart.
     */
    public function index()
    {
        $guestId = Auth::id();
        $cartItems = CartItem::where('user_id', $guestId)
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
            });

        $paymentMethods = PaymentMethod::where('is_active', true)->get();

        return Inertia::render('guest/cart', [
            'cartItems' => $cartItems,
            'paymentMethods' => $paymentMethods,
        ]);
    }

    /**
     * Add Homestay to Shopping Cart.
     */
    public function store(Request $request)
    {
        $request->validate([
            'homestay_id' => 'required|exists:homestays,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'total_guests' => 'required|integer|min:1',
        ]);

        $guestId = Auth::id();
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

        // Check if already in cart (update dates instead of duplicating)
        CartItem::updateOrCreate([
            'user_id' => $guestId,
            'homestay_id' => $homestay->id,
        ], [
            'check_in' => $checkIn->format('Y-m-d'),
            'check_out' => $checkOut->format('Y-m-d'),
            'total_guests' => $request->total_guests,
        ]);

        return redirect()->route('guest.cart')->with('success', 'Kamar berhasil ditambahkan ke keranjang belanja Anda.');
    }

    /**
     * Remove Item from Cart.
     */
    public function destroy(string $id)
    {
        $cartItem = CartItem::findOrFail($id);

        if ($cartItem->user_id !== Auth::id()) {
            abort(403);
        }

        $cartItem->delete();

        return back()->with('success', 'Item berhasil dihapus dari keranjang.');
    }

    /**
     * Checkout Cart items simultaneously.
     */
    public function checkout(Request $request)
    {
        $request->validate([
            'payment_method_id' => 'required|exists:payment_methods,id',
            'name' => Auth::check() ? 'nullable' : 'required|string|max:255',
            'email' => Auth::check() ? 'nullable' : 'required|email|max:255',
            'phone' => Auth::check() ? 'nullable' : 'required|string|max:20',
        ]);

        $guestId = Auth::id();
        $cartItems = CartItem::where('user_id', $guestId)->get();

        if ($cartItems->isEmpty()) {
            return back()->withErrors(['cart' => 'Keranjang belanja Anda kosong.']);
        }

        $tempPassword = null;
        $newUserCreated = false;

        try {
            $createdBookings = DB::transaction(function () use ($request, $guestId, $cartItems, &$tempPassword, &$newUserCreated) {
                // 1. Resolve User
                $user = Auth::user();
                if (!$user) {
                    $user = User::where('email', $request->email)->first();

                    if (!$user) {
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

                $bookings = [];

                // 2. Loop through cart items and create individual booking rows with shared payment setup
                foreach ($cartItems as $item) {
                    $homestay = Homestay::findOrFail($item->homestay_id);
                    $checkIn = Carbon::parse($item->check_in);
                    $checkOut = Carbon::parse($item->check_out);
                    $days = $checkIn->diffInDays($checkOut);
                    $totalPrice = $homestay->price_per_night * $days;

                    // Pessimistic double checking overlapping dates
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

                // 3. Clear shopping cart
                CartItem::where('user_id', $guestId)->delete();

                return $bookings;
            });
        } catch (\Exception $e) {
            return back()->withErrors(['cart' => $e->getMessage()]);
        }

        // Redirect to booking history or a custom multi-receipt success page.
        // We'll redirect to Guest Bookings page with a unified success message!
        return redirect()->route('guest.bookings')->with([
            'success' => 'Berhasil checkout ' . count($createdBookings) . ' kamar. Silakan unggah bukti transfer pembayaran di masing-masing kamar.',
            'temp_password' => $tempPassword,
            'new_user' => $newUserCreated ? '1' : '0',
        ]);
    }
}
