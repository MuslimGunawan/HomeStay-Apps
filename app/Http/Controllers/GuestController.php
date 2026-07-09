<?php

namespace App\Http\Controllers;

use App\Models\Booking;
use App\Models\Homestay;
use App\Models\Review;
use App\Models\StayComplaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class GuestController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth');
    }

    /**
     * Guest Dashboard Overview.
     */
    public function dashboard()
    {
        $guestId = Auth::id();

        $totalBookings = Booking::where('user_id', $guestId)->count();
        $activeStaysCount = Booking::where('user_id', $guestId)->where('status', 'confirmed')->count();
        $pendingPaymentsCount = Booking::where('user_id', $guestId)->where('status', 'pending_payment')->count();

        $latestStay = Booking::where('user_id', $guestId)
            ->whereIn('status', ['pending_payment', 'pending_approval', 'confirmed'])
            ->with(['homestay.media' => function ($q) {
                $q->where('is_primary', true);
            }, 'paymentMethod'])
            ->orderBy('created_at', 'desc')
            ->first();

        // Check if temporary password warning is needed
        $needsPasswordChange = false;
        $user = Auth::user();

        // Simple heuristic: if phone number is in cache or was recently set, or password contains the phone number
        if ($user->phone && Hash::check('Homestay@'.$user->phone, $user->password)) {
            $needsPasswordChange = true;
        }

        return Inertia::render('guest/dashboard', [
            'totalBookings' => $totalBookings,
            'activeStaysCount' => $activeStaysCount,
            'pendingPaymentsCount' => $pendingPaymentsCount,
            'latestStay' => $latestStay,
            'needsPasswordChange' => $needsPasswordChange,
        ]);
    }

    /**
     * Show guest full bookings history.
     */
    public function bookings()
    {
        $guestId = Auth::id();

        $bookings = Booking::where('user_id', $guestId)
            ->where('status', '!=', 'cancelled')
            ->with(['homestay.media' => function ($q) {
                $q->where('is_primary', true);
            }, 'paymentMethod'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('guest/bookings', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Wishlist / Favorites Page.
     */
    public function wishlist()
    {
        $wishlistIds = Cache::get('guest_wishlist_'.Auth::id(), []);

        $homestays = Homestay::whereIn('id', $wishlistIds)
            ->active()
            ->with(['media' => function ($q) {
                $q->where('is_primary', true);
            }])
            ->get()
            ->map(function ($h) {
                $h->average_rating = $h->average_rating;

                return $h;
            });

        return Inertia::render('guest/wishlist', [
            'wishlist' => $homestays,
        ]);
    }

    /**
     * Toggle Wishlist/Favorite status.
     */
    public function toggleWishlist(string $homestayId)
    {
        $userId = Auth::id();
        $key = 'guest_wishlist_'.$userId;
        $wishlist = Cache::get($key, []);

        if (in_array((int) $homestayId, $wishlist)) {
            $wishlist = array_values(array_diff($wishlist, [(int) $homestayId]));
            $msg = 'Homestay dihapus dari favorit Anda.';
        } else {
            $wishlist[] = (int) $homestayId;
            $msg = 'Homestay ditambahkan ke favorit Anda.';
        }

        Cache::forever($key, $wishlist);

        return back()->with('success', $msg);
    }

    /**
     * Submit Guest Review.
     */
    public function submitReview(Request $request, string $bookingId)
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->user_id !== Auth::id()) {
            abort(403);
        }

        if ($booking->status !== 'completed') {
            abort(400, 'Ulasan hanya dapat dikirimkan setelah status menginap selesai (Completed).');
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|max:1000',
        ]);

        Review::updateOrCreate([
            'booking_id' => $booking->id,
        ], [
            'user_id' => Auth::id(),
            'homestay_id' => $booking->homestay_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return back()->with('success', 'Terima kasih! Ulasan Anda berhasil dikirim.');
    }

    /**
     * Submit Guest stay complaint.
     */
    public function submitComplaint(Request $request, string $bookingId)
    {
        $booking = Booking::findOrFail($bookingId);

        if ($booking->user_id !== Auth::id()) {
            abort(403);
        }

        if ($booking->status !== 'confirmed') {
            abort(400, 'Aduan keluhan hanya dapat dikirim selama masa sewa aktif terkonfirmasi.');
        }

        $request->validate([
            'message' => 'required|string|max:1000',
        ]);

        StayComplaint::create([
            'booking_id' => $booking->id,
            'guest_id' => Auth::id(),
            'homestay_id' => $booking->homestay_id,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Keluhan Anda berhasil dikirim langsung ke pemilik Homestay. Mohon tunggu tanggapan.');
    }

    /**
     * Show guest complaints dashboard.
     */
    public function complaints()
    {
        $guestId = Auth::id();

        $complaints = StayComplaint::where('guest_id', $guestId)
            ->with(['homestay', 'booking'])
            ->orderBy('created_at', 'desc')
            ->get();

        $activeStays = Booking::where('user_id', $guestId)
            ->where('status', 'confirmed')
            ->with('homestay')
            ->get();

        return Inertia::render('guest/complaints', [
            'complaints' => $complaints,
            'activeStays' => $activeStays,
        ]);
    }

    /**
     * Submit complaint from complaints page.
     */
    public function submitComplaintFromPage(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
            'message' => 'required|string|max:1000',
        ]);

        $booking = Booking::findOrFail($request->booking_id);

        if ($booking->user_id !== Auth::id()) {
            abort(403);
        }

        if ($booking->status !== 'confirmed') {
            abort(400, 'Aduan keluhan hanya dapat dikirim selama masa sewa aktif terkonfirmasi.');
        }

        StayComplaint::create([
            'booking_id' => $booking->id,
            'guest_id' => Auth::id(),
            'homestay_id' => $booking->homestay_id,
            'message' => $request->message,
            'status' => 'pending',
        ]);

        return back()->with('success', 'Keluhan Anda berhasil dikirim langsung ke pemilik Homestay. Mohon tunggu tanggapan.');
    }
}
