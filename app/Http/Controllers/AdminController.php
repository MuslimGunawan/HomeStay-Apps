<?php

namespace App\Http\Controllers;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Homestay;
use App\Models\PaymentMethod;
use App\Models\Permission;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AdminController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (! Auth::user() || ! Auth::user()->isAdmin()) {
                abort(403, 'Akses khusus bagi administrator utama.');
            }

            return $next($request);
        });
    }

    /**
     * Admin Dashboard Overview.
     */
    public function dashboard()
    {
        $totalUsers = User::count();
        $totalHosts = User::where('role', 'host')->count();
        $totalGuests = User::where('role', 'guest')->count();
        $totalListings = Homestay::count();

        // Calculate platform-wide revenue (confirmed or completed bookings)
        $totalRevenue = Booking::whereIn('status', ['confirmed', 'completed'])->sum('total_price');

        // Recent 5 transactions
        $recentBookings = Booking::with(['guest', 'homestay'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return Inertia::render('admin/dashboard', [
            'totalUsers' => $totalUsers,
            'totalHosts' => $totalHosts,
            'totalGuests' => $totalGuests,
            'totalListings' => $totalListings,
            'totalRevenue' => (float) $totalRevenue,
            'recentBookings' => $recentBookings,
        ]);
    }

    /* -------------------------------------------------------------
     * User Management Panel (CRUD)
     * ------------------------------------------------------------- */

    public function users()
    {
        $users = User::with('permissions')->get();
        $permissions = Permission::all();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'allPermissions' => $permissions,
        ]);
    }

    public function storeUser(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|string|in:guest,host,admin',
            'phone' => 'nullable|string|max:20',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
            'phone' => $request->phone,
        ]);

        // If new host, attach standard permissions by default
        if ($user->isHost()) {
            $perms = Permission::whereIn('slug', ['view-revenue', 'edit-homestays'])->pluck('id');
            $user->permissions()->sync($perms);
        }

        return back()->with('success', 'Akun pengguna baru berhasil dibuat.');
    }

    public function updateUser(Request $request, string $id)
    {
        $user = User::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'phone' => 'nullable|string|max:20',
            'role' => 'required|string|in:guest,host,admin',
        ]);

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'role' => $request->role,
        ]);

        return back()->with('success', 'Data akun pengguna berhasil diperbarui.');
    }

    public function destroyUser(string $id)
    {
        $user = User::findOrFail($id);

        if ($user->id === Auth::id()) {
            abort(400, 'Anda tidak bisa menghapus akun Anda sendiri.');
        }

        $user->delete();

        return back()->with('success', 'Akun pengguna berhasil dihapus.');
    }

    /**
     * RBAC Manager - Toggle host permissions.
     */
    public function togglePermission(Request $request, string $userId)
    {
        $user = User::findOrFail($userId);

        if (! $user->isHost()) {
            abort(400, 'Izin hanya dapat diberikan kepada akun Host.');
        }

        $request->validate([
            'permission_id' => 'required|exists:permissions,id',
        ]);

        $user->permissions()->toggle($request->permission_id);

        return back()->with('success', 'Hak akses Host berhasil disesuaikan.');
    }

    /* -------------------------------------------------------------
     * Payment Methods Management
     * ------------------------------------------------------------- */

    public function paymentMethods()
    {
        $methods = PaymentMethod::all();

        return Inertia::render('admin/payments/index', [
            'paymentMethods' => $methods,
        ]);
    }

    public function storePaymentMethod(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:bank,ewallet,custom',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
            'qris_image' => 'nullable|image|max:10240', // 10MB
        ]);

        $qrisPath = null;
        if ($request->hasFile('qris_image')) {
            $path = $request->file('qris_image')->store('qris', 'public');
            $qrisPath = '/storage/'.$path;
        }

        PaymentMethod::create([
            'name' => $request->name,
            'type' => $request->type,
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
            'qris_image_path' => $qrisPath,
            'is_active' => true,
        ]);

        return back()->with('success', 'Metode pembayaran baru berhasil ditambahkan.');
    }

    public function updatePaymentMethod(Request $request, string $id)
    {
        $method = PaymentMethod::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|string|in:bank,ewallet,custom',
            'account_number' => 'required|string',
            'account_name' => 'required|string',
            'qris_image' => 'nullable|image|max:10240',
            'is_active' => 'boolean',
        ]);

        $data = [
            'name' => $request->name,
            'type' => $request->type,
            'account_number' => $request->account_number,
            'account_name' => $request->account_name,
            'is_active' => $request->input('is_active', true),
        ];

        if ($request->hasFile('qris_image')) {
            // Delete old
            if ($method->qris_image_path) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $method->qris_image_path));
            }
            $path = $request->file('qris_image')->store('qris', 'public');
            $data['qris_image_path'] = '/storage/'.$path;
        }

        $method->update($data);

        return back()->with('success', 'Metode pembayaran berhasil diperbarui.');
    }

    public function togglePaymentStatus(string $id)
    {
        $method = PaymentMethod::findOrFail($id);
        $method->update([
            'is_active' => ! $method->is_active,
        ]);

        return back()->with('success', 'Status keaktifan metode pembayaran diperbarui.');
    }

    public function destroyPaymentMethod(string $id)
    {
        $method = PaymentMethod::findOrFail($id);
        if ($method->qris_image_path) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $method->qris_image_path));
        }
        $method->delete();

        return back()->with('success', 'Metode pembayaran berhasil dihapus.');
    }

    /* -------------------------------------------------------------
     * Global Amenities CRUD
     * ------------------------------------------------------------- */

    public function amenities()
    {
        $amenities = Amenity::all();

        return Inertia::render('admin/amenities/index', [
            'amenities' => $amenities,
        ]);
    }

    public function storeAmenity(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:amenities,name',
            'icon' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        Amenity::create([
            'name' => $request->name,
            'icon' => $request->input('icon', 'Sparkles'),
            'description' => $request->description,
        ]);

        return back()->with('success', 'Fasilitas baru berhasil ditambahkan.');
    }

    public function updateAmenity(Request $request, string $id)
    {
        $amenity = Amenity::findOrFail($id);

        $request->validate([
            'name' => 'required|string|max:255|unique:amenities,name,'.$id,
            'icon' => 'nullable|string',
            'description' => 'nullable|string',
        ]);

        $amenity->update([
            'name' => $request->name,
            'icon' => $request->input('icon', 'Sparkles'),
            'description' => $request->description,
        ]);

        return back()->with('success', 'Fasilitas berhasil diperbarui.');
    }

    public function destroyAmenity(string $id)
    {
        $amenity = Amenity::findOrFail($id);
        $amenity->delete();

        return back()->with('success', 'Fasilitas berhasil dihapus.');
    }

    /* -------------------------------------------------------------
     * Public Support Tickets Management
     * ------------------------------------------------------------- */

    public function supportTickets()
    {
        $tickets = SupportTicket::orderBy('created_at', 'desc')->get();

        return Inertia::render('admin/support/index', [
            'tickets' => $tickets,
        ]);
    }

    public function resolveSupportTicket(string $id)
    {
        $ticket = SupportTicket::findOrFail($id);
        $ticket->update([
            'status' => 'resolved',
        ]);

        return back()->with('success', 'Tiket bantuan berhasil ditandai selesai (Resolved).');
    }

    /* -------------------------------------------------------------
     * Branding & Protection Settings
     * ------------------------------------------------------------- */

    public function brandingSettings()
    {
        // Settings are stored inside cache or JSON files or config
        $settings = [
            'homestay_name' => cache('branding_homestay_name', 'Yuri-HomeStay'),
            'logo' => cache('branding_logo', '/images/logo.png'),
            'favicon' => cache('branding_favicon', '/favicon.ico'),
            'watermark_text' => cache('branding_watermark_text', 'HOMESTAY-APPS'),
            'copy_watermark' => cache('branding_copy_watermark', 'Salinan dari HomeStay-Apps. Pelajari lebih lanjut: '),
        ];

        return Inertia::render('admin/settings/branding', [
            'settings' => $settings,
        ]);
    }

    public function updateBranding(Request $request)
    {
        $request->validate([
            'homestay_name' => 'required|string|max:100',
            'logo' => 'nullable|image|max:5120',
            'favicon' => 'nullable|image|max:1024',
            'watermark_text' => 'required|string|max:50',
            'copy_watermark' => 'required|string',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('branding', 'public');
            cache(['branding_logo' => '/storage/'.$path], now()->addYears(10));
        }

        if ($request->hasFile('favicon')) {
            $path = $request->file('favicon')->store('branding', 'public');
            cache(['branding_favicon' => '/storage/'.$path], now()->addYears(10));
        }

        cache(['branding_homestay_name' => $request->homestay_name], now()->addYears(10));
        cache(['branding_watermark_text' => $request->watermark_text], now()->addYears(10));
        cache(['branding_copy_watermark' => $request->copy_watermark], now()->addYears(10));

        return back()->with('success', 'Pengaturan branding & proteksi media berhasil diperbarui.');
    }
}
