<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Homestay;
use App\Models\PaymentMethod;
use App\Models\Review;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class BookingController extends Controller
{
    /**
     * Show Landing Page with featured homestays.
     */
    public function index()
    {
        $featured = Homestay::active()
            ->with(['media' => function ($q) {
                $q->where('is_primary', true);
            }])
            ->withCount('reviews')
            ->get()
            ->map(function ($h) {
                $h->average_rating = $h->average_rating; // trigger attribute
                $h->display_status = $h->display_status;

                return $h;
            });

        $reviews = Review::with(['guest', 'homestay'])
            ->latest()
            ->take(3)
            ->get()
            ->map(function ($r) {
                // Safely format name and review attributes
                return [
                    'id' => $r->id,
                    'rating' => $r->rating,
                    'comment' => $r->comment,
                    'created_at' => $r->created_at->format('Y-m-d'),
                    'guest' => [
                        'name' => $r->guest->name,
                        'avatar' => $r->guest->avatar,
                    ],
                    'homestay' => [
                        'name' => $r->homestay->name,
                    ],
                ];
            });

        return Inertia::render('welcome', [
            'featuredHomestays' => $featured,
            'reviews' => $reviews,
        ]);
    }

    /**
     * Explore & Search Homestays.
     */
    public function explore(Request $request)
    {
        $query = Homestay::active()->with(['media' => function ($q) {
            $q->where('is_primary', true);
        }]);

        if ($request->filled('city')) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'like', '%'.$request->city.'%')
                    ->orWhere('category', 'like', '%'.$request->city.'%')
                    ->orWhere('description', 'like', '%'.$request->city.'%')
                    ->orWhere('city', 'like', '%'.$request->city.'%');
            });
        }

        if ($request->filled('price_min')) {
            $query->where('price_per_night', '>=', $request->price_min);
        }

        if ($request->filled('price_max')) {
            $query->where('price_per_night', '<=', $request->price_max);
        }

        if ($request->filled('guests')) {
            $query->where('max_guests', '>=', $request->guests);
        }

        if ($request->filled('amenities')) {
            $amenityIds = is_array($request->amenities) ? $request->amenities : explode(',', $request->amenities);
            $query->whereHas('amenities', function ($q) use ($amenityIds) {
                $q->whereIn('amenity_id', $amenityIds);
            });
        }

        $results = $query->get()->map(function ($h) {
            $h->average_rating = $h->average_rating;
            $h->display_status = $h->display_status;

            return $h;
        });

        $allAmenities = Amenity::all();
        $categories = Homestay::active()->select('category')->distinct()->pluck('category')->filter()->values();

        return Inertia::render('explore', [
            'results' => $results,
            'filters' => $request->all(),
            'allAmenities' => $allAmenities,
            'categories' => $categories,
        ]);
    }

    /**
     * Show Homestay details.
     */
    public function show(string $slug)
    {
        $homestay = Homestay::where('slug', $slug)
            ->active()
            ->with(['host', 'media', 'roomMedia', 'amenities', 'reviews.guest'])
            ->firstOrFail();

        $homestay->average_rating = $homestay->average_rating;

        // Fetch overlapping bookings for date blocking calendar in UI
        $bookedDates = Booking::where('homestay_id', $homestay->id)
            ->whereIn('status', ['confirmed', 'pending_approval'])
            ->get(['check_in', 'check_out'])
            ->flatMap(function ($booking) {
                $dates = [];
                $current = clone $booking->check_in;
                while ($current <= $booking->check_out) {
                    $dates[] = $current->format('Y-m-d');
                    $current = $current->addDay();
                }

                return $dates;
            })
            ->unique()
            ->values();

        return Inertia::render('homestays/show', [
            'homestay' => $homestay,
            'bookedDates' => $bookedDates,
        ]);
    }

    /**
     * Show Checkout Page.
     */
    public function checkout(Request $request, string $slug)
    {
        $homestay = Homestay::where('slug', $slug)->active()->firstOrFail();
        $paymentMethods = PaymentMethod::where('is_active', true)->get();

        $request->validate([
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'total_guests' => 'required|integer|min:1|max:'.$homestay->max_guests,
        ]);

        $checkIn = new Carbon($request->check_in);
        $checkOut = new Carbon($request->check_out);
        $days = $checkIn->diffInDays($checkOut);
        $totalPrice = $homestay->price_per_night * $days;

        return Inertia::render('bookings/checkout', [
            'homestay' => $homestay,
            'paymentMethods' => $paymentMethods,
            'checkIn' => $request->check_in,
            'checkOut' => $request->check_out,
            'totalGuests' => (int) $request->total_guests,
            'totalPrice' => $totalPrice,
            'days' => $days,
        ]);
    }

    /**
     * Confirm Booking Process - Engine.
     */
    public function storeCheckout(Request $request)
    {
        $request->validate([
            'homestay_id' => 'required|exists:homestays,id',
            'payment_method_id' => 'required|exists:payment_methods,id',
            'check_in' => 'required|date|after_or_equal:today',
            'check_out' => 'required|date|after:check_in',
            'total_guests' => 'required|integer|min:1',
            // Guest detail form (for registration)
            'name' => Auth::check() ? 'nullable' : 'required|string|max:255',
            'email' => Auth::check() ? 'nullable' : 'required|email|max:255',
            'phone' => Auth::check() ? 'nullable' : 'required|string|max:20',
        ]);

        $homestay = Homestay::findOrFail($request->homestay_id);
        $checkIn = new Carbon($request->check_in);
        $checkOut = new Carbon($request->check_out);
        $days = $checkIn->diffInDays($checkOut);
        $totalPrice = $homestay->price_per_night * $days;

        $tempPassword = null;
        $newUserCreated = false;

        try {
            // Perform transactional operations with pessimistic locking
            $booking = DB::transaction(function () use ($request, $homestay, $checkIn, $checkOut, $totalPrice, &$tempPassword, &$newUserCreated) {

                // 1. Pessimistic Locking to prevent double bookings
                // We lock the overlapping bookings in database levels
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
                    throw new \Exception('Maaf, tanggal yang Anda pilih sudah terpesan oleh tamu lain. Silakan pilih tanggal ketersediaan lainnya.');
                }

                // 2. User Authentication / Auto-registration
                $user = Auth::user();
                if (! $user) {
                    // Check if user email already exists
                    $user = User::where('email', $request->email)->first();

                    if (! $user) {
                        // Create new user automatically
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

                    // Log the guest in automatically
                    Auth::login($user);
                }

                // 3. Create Booking Record
                $booking = Booking::create([
                    'user_id' => $user->id,
                    'homestay_id' => $homestay->id,
                    'payment_method_id' => $request->payment_method_id,
                    'check_in' => $checkIn->format('Y-m-d'),
                    'check_out' => $checkOut->format('Y-m-d'),
                    'total_guests' => $request->total_guests,
                    'total_price' => $totalPrice,
                    'status' => 'pending_payment',
                ]);

                return $booking;
            });
        } catch (\Exception $e) {
            return back()->withErrors(['check_in' => $e->getMessage()]);
        }

        // Redirect to success e-receipt page
        return redirect()->route('bookings.success', [
            'id' => $booking->id,
            'temp_password' => $tempPassword,
            'new_user' => $newUserCreated ? '1' : '0',
        ]);
    }

    /**
     * Show Booking Success E-Receipt Page.
     */
    public function success(Request $request, string $id)
    {
        $booking = Booking::with(['homestay.media' => function ($q) {
            $q->where('is_primary', true);
        }, 'paymentMethod'])->findOrFail($id);

        // Security check: Only owner of the booking (or admin/host) can see it
        if (Auth::id() !== $booking->user_id && ! Auth::user()->isAdmin() && Auth::id() !== $booking->homestay->user_id) {
            abort(403);
        }

        return Inertia::render('bookings/success', [
            'booking' => $booking,
            'tempPassword' => $request->temp_password,
            'newUser' => $request->new_user === '1',
        ]);
    }

    /**
     * Upload Payment Receipt.
     */
    public function uploadReceipt(Request $request, string $id)
    {
        $request->validate([
            'payment_receipt' => 'required|image|max:15360', // 15MB limit
        ]);

        $booking = Booking::findOrFail($id);

        if (Auth::id() !== $booking->user_id) {
            abort(403);
        }

        if ($request->hasFile('payment_receipt')) {
            $path = $request->file('payment_receipt')->store('receipts', 'public');
            $booking->update([
                'payment_receipt_path' => '/storage/'.$path,
                'status' => 'pending_approval',
                'paid_at' => now(),
            ]);
        }

        return back()->with('success', 'Bukti pembayaran berhasil diunggah. Menunggu verifikasi pemilik Homestay.');
    }
}
