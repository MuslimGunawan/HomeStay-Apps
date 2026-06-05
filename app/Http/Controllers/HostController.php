<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Homestay;
use App\Models\HomestayMedia;
use App\Models\RoomMedia;
use App\Models\StayComplaint;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Inertia;

class HostController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            $user = Auth::user();
            if (! $user || (! $user->isHost() && ! $user->isAdmin())) {
                abort(403, 'Akses khusus bagi pemilik Homestay (Host) atau Administrator.');
            }

            return $next($request);
        });
    }

    /**
     * Host Dashboard Overview.
     */
    public function dashboard()
    {
        $hostId = Auth::id();

        // 1. Listings Count
        $listingsCount = Homestay::where('user_id', $hostId)->count();

        // 2. Earnings Stats (Only Confirmed or Completed bookings)
        $earnings = Booking::whereHas('homestay', function ($q) use ($hostId) {
            $q->where('user_id', $hostId);
        })
            ->whereIn('status', ['confirmed', 'completed'])
            ->sum('total_price');

        // 3. Pending Approvals
        $pendingApprovals = Booking::whereHas('homestay', function ($q) use ($hostId) {
            $q->where('user_id', $hostId);
        })
            ->where('status', 'pending_approval')
            ->with(['guest', 'homestay', 'paymentMethod'])
            ->get();

        // 4. Stays Graph (Active guest list)
        $activeStays = Booking::whereHas('homestay', function ($q) use ($hostId) {
            $q->where('user_id', $hostId);
        })
            ->where('status', 'confirmed')
            ->where('check_in', '<=', now()->format('Y-m-d'))
            ->where('check_out', '>=', now()->format('Y-m-d'))
            ->with(['guest', 'homestay'])
            ->get();

        return Inertia::render('host/dashboard', [
            'listingsCount' => $listingsCount,
            'earnings' => (float) $earnings,
            'pendingApprovals' => $pendingApprovals,
            'activeStays' => $activeStays,
        ]);
    }

    /**
     * List Host's Homestays.
     */
    public function homestays()
    {
        $query = Homestay::query();
        if (! Auth::user()->isAdmin()) {
            $query->where('user_id', Auth::id());
        }

        $homestays = $query->with(['media' => function ($q) {
            $q->where('is_primary', true);
        }])
            ->get();

        return Inertia::render('host/homestays/index', [
            'homestays' => $homestays,
        ]);
    }

    /**
     * Show Create Homestay Form.
     */
    public function create()
    {
        // Enforce RBAC
        if (! Auth::user()->hasPermission('edit-homestays')) {
            abort(403, 'Anda tidak memiliki hak akses untuk menambahkan homestay.');
        }

        $amenities = Amenity::all();
        $categories = Homestay::select('category')->distinct()->pluck('category')->filter()->values();

        return Inertia::render('host/homestays/create', [
            'amenities' => $amenities,
            'categories' => $categories,
        ]);
    }

    /**
     * Store New Homestay.
     */
    public function store(Request $request)
    {
        if (! Auth::user()->hasPermission('edit-homestays')) {
            abort(403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'price_per_night' => 'required|numeric|min:0',
            'max_guests' => 'required|integer|min:1',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'amenities' => 'array',
            'primary_image' => 'required|image|max:15360', // 15MB
            'other_media.*' => 'nullable|file|max:102400', // 100MB for video/image
            'other_media_categories.*' => 'nullable|string',
            'other_media_customs.*' => 'nullable|string',
            'room_media.*' => 'nullable|file|max:102400',
            'room_media_categories.*' => 'nullable|string',
            'room_media_customs.*' => 'nullable|string',
            // Custom Amenities
            'custom_amenities' => 'nullable|array',
            'category' => 'required|string|max:255',
        ]);

        $homestay = DB::transaction(function () use ($request) {
            // Create homestay listing
            $homestay = Homestay::create([
                'user_id' => Auth::id(),
                'name' => $request->name,
                'slug' => Str::slug($request->name).'-'.uniqid(),
                'description' => $request->description,
                'address' => $request->address,
                'city' => $request->city,
                'price_per_night' => $request->price_per_night,
                'max_guests' => $request->max_guests,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'status' => 'active',
                'category' => $request->category,
            ]);

            // Sync Standard Amenities
            if ($request->has('amenities')) {
                $homestay->amenities()->sync($request->amenities);
            }

            // Create Custom Amenities
            if ($request->filled('custom_amenities')) {
                foreach ($request->custom_amenities as $customName) {
                    if (empty($customName)) {
                        continue;
                    }
                    $amenity = Amenity::firstOrCreate([
                        'name' => trim($customName),
                    ], [
                        'icon' => 'Sparkles',
                        'description' => 'Fasilitas kustom ditambahkan oleh pemilik.',
                    ]);
                    $homestay->amenities()->attach($amenity->id);
                }
            }

            // Process Primary Exterior Image
            if ($request->hasFile('primary_image')) {
                $path = $this->uploadAndWatermark($request->file('primary_image'));
                HomestayMedia::create([
                    'homestay_id' => $homestay->id,
                    'file_path' => $path,
                    'type' => 'image',
                    'category' => 'exterior_front',
                    'is_primary' => true,
                ]);
            }

            // Process other exterior media
            if ($request->hasFile('other_media')) {
                $files = $request->file('other_media');
                $categories = $request->input('other_media_categories', []);
                $customs = $request->input('other_media_customs', []);

                foreach ($files as $index => $file) {
                    $type = Str::startsWith($file->getMimeType(), 'video/') ? 'video' : 'image';
                    $path = $type === 'image' ? $this->uploadAndWatermark($file) : $this->uploadRaw($file);

                    $cat = $categories[$index] ?? 'custom';
                    $cust = $customs[$index] ?? null;

                    HomestayMedia::create([
                        'homestay_id' => $homestay->id,
                        'file_path' => $path,
                        'type' => $type,
                        'category' => $cat,
                        'custom_category' => $cust,
                        'is_primary' => false,
                    ]);
                }
            }

            // Process room media
            if ($request->hasFile('room_media')) {
                $files = $request->file('room_media');
                $categories = $request->input('room_media_categories', []);
                $customs = $request->input('room_media_customs', []);

                foreach ($files as $index => $file) {
                    $type = Str::startsWith($file->getMimeType(), 'video/') ? 'video' : 'image';
                    $path = $type === 'image' ? $this->uploadAndWatermark($file) : $this->uploadRaw($file);

                    $cat = $categories[$index] ?? 'custom';
                    $cust = $customs[$index] ?? null;

                    RoomMedia::create([
                        'homestay_id' => $homestay->id,
                        'file_path' => $path,
                        'type' => $type,
                        'category' => $cat,
                        'custom_category' => $cust,
                        'is_primary' => false,
                    ]);
                }
            }

            return $homestay;
        });

        $redirectRoute = Auth::user()->isAdmin() ? 'admin.homestays' : 'host.homestays';

        return redirect()->route($redirectRoute)->with('success', 'Homestay berhasil ditambahkan.');
    }

    /**
     * Show Edit Homestay Form.
     */
    public function edit(string $id)
    {
        if (! Auth::user()->hasPermission('edit-homestays')) {
            abort(403);
        }

        $query = Homestay::query();
        if (! Auth::user()->isAdmin()) {
            $query->where('user_id', Auth::id());
        }

        $homestay = $query->with(['media', 'roomMedia', 'amenities'])
            ->findOrFail($id);

        $amenities = Amenity::all();
        $categories = Homestay::select('category')->distinct()->pluck('category')->filter()->values();

        return Inertia::render('host/homestays/edit', [
            'homestay' => $homestay,
            'amenities' => $amenities,
            'categories' => $categories,
        ]);
    }

    /**
     * Update Homestay.
     */
    public function update(Request $request, string $id)
    {
        if (! Auth::user()->hasPermission('edit-homestays')) {
            abort(403);
        }

        $query = Homestay::query();
        if (! Auth::user()->isAdmin()) {
            $query->where('user_id', Auth::id());
        }
        $homestay = $query->findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'required|string',
            'address' => 'required|string',
            'city' => 'required|string',
            'price_per_night' => 'required|numeric|min:0',
            'max_guests' => 'required|integer|min:1',
            'latitude' => 'nullable|numeric',
            'longitude' => 'nullable|numeric',
            'amenities' => 'array',
            'custom_amenities' => 'nullable|array',
            'primary_image' => 'nullable|image|max:15360',
            'status' => 'required|string|in:active,inactive',
            'category' => 'required|string|max:255',
        ]);

        DB::transaction(function () use ($request, $homestay) {
            $homestay->update([
                'name' => $request->name,
                'slug' => Str::slug($request->name).'-'.uniqid(),
                'description' => $request->description,
                'address' => $request->address,
                'city' => $request->city,
                'price_per_night' => $request->price_per_night,
                'max_guests' => $request->max_guests,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'status' => $request->status,
                'category' => $request->category,
            ]);

            // Sync Amenities
            if ($request->has('amenities')) {
                $homestay->amenities()->sync($request->amenities);
            }

            // Create Custom Amenities
            if ($request->filled('custom_amenities')) {
                foreach ($request->custom_amenities as $customName) {
                    if (empty($customName)) {
                        continue;
                    }
                    $amenity = Amenity::firstOrCreate([
                        'name' => trim($customName),
                    ], [
                        'icon' => 'Sparkles',
                        'description' => 'Fasilitas kustom ditambahkan oleh pemilik.',
                    ]);
                    if (! $homestay->amenities()->where('amenities.id', $amenity->id)->exists()) {
                        $homestay->amenities()->attach($amenity->id);
                    }
                }
            }

            // Process Primary image replacement
            if ($request->hasFile('primary_image')) {
                // Delete old primary
                $oldPrimary = HomestayMedia::where('homestay_id', $homestay->id)->where('is_primary', true)->first();
                if ($oldPrimary) {
                    $this->deleteMediaFile($oldPrimary->file_path);
                    $oldPrimary->delete();
                }

                $path = $this->uploadAndWatermark($request->file('primary_image'));
                HomestayMedia::create([
                    'homestay_id' => $homestay->id,
                    'file_path' => $path,
                    'type' => 'image',
                    'category' => 'exterior_front',
                    'is_primary' => true,
                ]);
            }
        });

        $redirectRoute = Auth::user()->isAdmin() ? 'admin.homestays' : 'host.homestays';

        return redirect()->route($redirectRoute)->with('success', 'Detail Homestay berhasil diperbarui.');
    }

    /**
     * Delete Homestay.
     */
    public function destroy(string $id)
    {
        if (! Auth::user()->hasPermission('delete-homestays')) {
            abort(403, 'Anda tidak memiliki hak akses untuk menghapus homestay.');
        }

        $query = Homestay::query();
        if (! Auth::user()->isAdmin()) {
            $query->where('user_id', Auth::id());
        }
        $homestay = $query->findOrFail($id);

        DB::transaction(function () use ($homestay) {
            // Delete media files
            foreach ($homestay->media as $med) {
                $this->deleteMediaFile($med->file_path);
            }
            foreach ($homestay->roomMedia as $rm) {
                $this->deleteMediaFile($rm->file_path);
            }
            $homestay->delete();
        });

        $redirectRoute = Auth::user()->isAdmin() ? 'admin.homestays' : 'host.homestays';

        return redirect()->route($redirectRoute)->with('success', 'Homestay berhasil dihapus.');
    }

    /**
     * View Reservations List (Payments & Booking requests).
     */
    public function reservations()
    {
        $query = Booking::query();
        if (! Auth::user()->isAdmin()) {
            $hostId = Auth::id();
            $query->whereHas('homestay', function ($q) use ($hostId) {
                $q->where('user_id', $hostId);
            });
        }

        $bookings = $query->with(['guest', 'homestay', 'paymentMethod'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('host/reservations/index', [
            'bookings' => $bookings,
        ]);
    }

    /**
     * Approve Booking - Manual Payment verification.
     */
    public function approveReservation(string $id)
    {
        $booking = Booking::with('homestay')->findOrFail($id);

        if (! Auth::user()->isAdmin() && $booking->homestay->user_id !== Auth::id()) {
            abort(403);
        }

        $booking->update([
            'status' => 'confirmed',
        ]);

        return back()->with('success', 'Booking tamu berhasil disetujui. Reservasi kini terkonfirmasi.');
    }

    /**
     * Reject Booking - Manual Payment verification.
     */
    public function rejectReservation(Request $request, string $id)
    {
        $booking = Booking::with('homestay')->findOrFail($id);

        if (! Auth::user()->isAdmin() && $booking->homestay->user_id !== Auth::id()) {
            abort(403);
        }

        $booking->update([
            'status' => 'cancelled',
            'payment_receipt_path' => null, // reset receipt so they can try again
        ]);

        return back()->with('success', 'Booking berhasil ditolak. Tamu harus mengunggah bukti transfer yang valid.');
    }

    /**
     * Monitor Guests and Active Stays.
     */
    public function activeStays()
    {
        $query = Booking::query();
        if (! Auth::user()->isAdmin()) {
            $hostId = Auth::id();
            $query->whereHas('homestay', function ($q) use ($hostId) {
                $q->where('user_id', $hostId);
            });
        }

        $stays = $query->whereIn('status', ['confirmed', 'completed'])
            ->with(['guest', 'homestay'])
            ->orderBy('check_in', 'asc')
            ->get();

        return Inertia::render('host/active-stays', [
            'stays' => $stays,
        ]);
    }

    /**
     * Monitor Complaints from active guests.
     */
    public function complaints()
    {
        $query = StayComplaint::query();
        if (! Auth::user()->isAdmin()) {
            $hostId = Auth::id();
            $query->whereHas('homestay', function ($q) use ($hostId) {
                $q->where('user_id', $hostId);
            });
        }

        $complaints = $query->with(['booking', 'guest', 'homestay'])
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('host/complaints/index', [
            'complaints' => $complaints,
        ]);
    }

    /**
     * Resolve a stay complaint.
     */
    public function resolveComplaint(string $id)
    {
        $complaint = StayComplaint::with('homestay')->findOrFail($id);

        if (! Auth::user()->isAdmin() && $complaint->homestay->user_id !== Auth::id()) {
            abort(403);
        }

        $complaint->update([
            'status' => 'resolved',
        ]);

        return back()->with('success', 'Keluhan berhasil diselesaikan.');
    }

    /* -------------------------------------------------------------
     * Helper Methods for secure, high-quality uploading & watermarking
     * ------------------------------------------------------------- */

    private function uploadAndWatermark($file): string
    {
        $filename = Str::random(40).'.'.$file->getClientOriginalExtension();
        $tempPath = $file->getRealPath();

        // 1. Watermark settings
        $watermarkText = 'HOMESTAY-APPS';

        // 2. Load the source image
        $mime = $file->getMimeType();
        $img = null;

        if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
            $img = @imagecreatefromjpeg($tempPath);
        } elseif ($mime === 'image/png') {
            $img = @imagecreatefrompng($tempPath);
        } elseif ($mime === 'image/webp') {
            $img = @imagecreatefromwebp($tempPath);
        }

        if ($img) {
            // Keep maximum quality and append transparent watermark text in the bottom right corner
            $width = imagesx($img);
            $height = imagesy($img);

            // Watermark color (semi-transparent white)
            $color = imagecolorallocatealpha($img, 255, 255, 255, 60); // 60 alpha out of 127 (approx 50% opacity)

            // Draw standard font text watermarking
            $fontSize = max(3, (int) ($width / 300)); // Dynamic font size based on image width
            $textWidth = imagefontwidth($fontSize) * strlen($watermarkText);
            $textHeight = imagefontheight($fontSize);

            $x = $width - $textWidth - 20;
            $y = $height - $textHeight - 20;

            imagestring($img, $fontSize, $x, $y, $watermarkText, $color);

            // Save back to temporary path or direct storage stream
            ob_start();
            if ($mime === 'image/jpeg' || $mime === 'image/jpg') {
                imagejpeg($img, null, 95); // High quality 95%
            } elseif ($mime === 'image/png') {
                imagepng($img, null, 9); // Compression level 9 (lossless)
            } elseif ($mime === 'image/webp') {
                imagewebp($img, null, 90); // Webp quality 90
            }
            $imgContent = ob_get_clean();
            imagedestroy($img);

            // Store inside /storage/app/public/media/
            $storagePath = 'media/'.$filename;
            Storage::disk('public')->put($storagePath, $imgContent);

            return '/storage/'.$storagePath;
        }

        // Fallback if GD loading fails
        $path = $file->store('media', 'public');

        return '/storage/'.$path;
    }

    private function uploadRaw($file): string
    {
        $path = $file->store('media', 'public');

        return '/storage/'.$path;
    }

    private function deleteMediaFile(string $filePath): void
    {
        $relPath = str_replace('/storage/', '', $filePath);
        Storage::disk('public')->delete($relPath);
    }
}
