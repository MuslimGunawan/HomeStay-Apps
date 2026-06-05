<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\BookingController;
use App\Http\Controllers\GuestController;
use App\Http\Controllers\HostController;
use App\Http\Controllers\PublicSupportController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public Routes
|--------------------------------------------------------------------------
*/
Route::get('/', [BookingController::class, 'index'])->name('home');
Route::get('/explore', [BookingController::class, 'explore'])->name('explore');
Route::get('/homestays/{slug}', [BookingController::class, 'show'])->name('homestays.show');
Route::get('/homestays/{slug}/checkout', [BookingController::class, 'checkout'])->name('bookings.checkout');
Route::post('/checkout/store', [BookingController::class, 'storeCheckout'])->name('bookings.store');
Route::get('/bookings/{id}/success', [BookingController::class, 'success'])->name('bookings.success');
Route::post('/bookings/{id}/receipt', [BookingController::class, 'uploadReceipt'])->name('bookings.receipt');

Route::get('/help', [PublicSupportController::class, 'showHelpCenter'])->name('support.help');
Route::post('/help/submit', [PublicSupportController::class, 'submitSupport'])->name('support.submit');

/*
|--------------------------------------------------------------------------
| Authenticated Routes
|--------------------------------------------------------------------------
*/
Route::middleware(['auth'])->group(function () {

    // Global redirect dashboard based on user role
    Route::get('/dashboard', function () {
        $user = auth()->user();
        if ($user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        } elseif ($user->isHost()) {
            return redirect()->route('host.dashboard');
        } else {
            return redirect()->route('guest.dashboard');
        }
    })->name('dashboard');

    /* -------------------------------------------------------------
     * Guest (Tamu) Dashboard Routes
     * ------------------------------------------------------------- */
    Route::prefix('guest')->group(function () {
        Route::get('/dashboard', [GuestController::class, 'dashboard'])->name('guest.dashboard');
        Route::get('/wishlist', [GuestController::class, 'wishlist'])->name('guest.wishlist');
        Route::post('/wishlist/toggle/{homestayId}', [GuestController::class, 'toggleWishlist'])->name('guest.wishlist.toggle');
        Route::post('/bookings/{bookingId}/review', [GuestController::class, 'submitReview'])->name('guest.review.submit');
        Route::post('/bookings/{bookingId}/complaint', [GuestController::class, 'submitComplaint'])->name('guest.complaint.submit');
    });

    /* -------------------------------------------------------------
     * Host (Pemilik) Dashboard Routes
     * ------------------------------------------------------------- */
    Route::prefix('host')->group(function () {
        Route::get('/dashboard', [HostController::class, 'dashboard'])->name('host.dashboard');
        Route::get('/homestays', [HostController::class, 'homestays'])->name('host.homestays');
        Route::get('/homestays/create', [HostController::class, 'create'])->name('host.homestays.create');
        Route::post('/homestays/store', [HostController::class, 'store'])->name('host.homestays.store');
        Route::get('/homestays/{id}/edit', [HostController::class, 'edit'])->name('host.homestays.edit');
        Route::post('/homestays/{id}/update', [HostController::class, 'update'])->name('host.homestays.update');
        Route::post('/homestays/{id}/delete', [HostController::class, 'destroy'])->name('host.homestays.delete');

        Route::get('/reservations', [HostController::class, 'reservations'])->name('host.reservations');
        Route::post('/reservations/{id}/approve', [HostController::class, 'approveReservation'])->name('host.reservations.approve');
        Route::post('/reservations/{id}/reject', [HostController::class, 'rejectReservation'])->name('host.reservations.reject');

        Route::get('/active-stays', [HostController::class, 'activeStays'])->name('host.active-stays');
        Route::get('/complaints', [HostController::class, 'complaints'])->name('host.complaints');
        Route::post('/complaints/{id}/resolve', [HostController::class, 'resolveComplaint'])->name('host.complaints.resolve');
    });

    /* -------------------------------------------------------------
     * Super Admin Dashboard Routes
     * ------------------------------------------------------------- */
    Route::prefix('admin')->group(function () {
        Route::get('/dashboard', [AdminController::class, 'dashboard'])->name('admin.dashboard');

        // Users CRUD & RBAC
        Route::get('/users', [AdminController::class, 'users'])->name('admin.users');
        Route::post('/users/store', [AdminController::class, 'storeUser'])->name('admin.users.store');
        Route::post('/users/{id}/update', [AdminController::class, 'updateUser'])->name('admin.users.update');
        Route::post('/users/{id}/delete', [AdminController::class, 'destroyUser'])->name('admin.users.delete');
        Route::post('/users/{id}/toggle-permission', [AdminController::class, 'togglePermission'])->name('admin.users.toggle-permission');

        // Payments CRUD
        Route::get('/payments', [AdminController::class, 'paymentMethods'])->name('admin.payments');
        Route::post('/payments/store', [AdminController::class, 'storePaymentMethod'])->name('admin.payments.store');
        Route::post('/payments/{id}/update', [AdminController::class, 'updatePaymentMethod'])->name('admin.payments.update');
        Route::post('/payments/{id}/toggle', [AdminController::class, 'togglePaymentStatus'])->name('admin.payments.toggle');
        Route::post('/payments/{id}/delete', [AdminController::class, 'destroyPaymentMethod'])->name('admin.payments.delete');

        // Global Amenities CRUD
        Route::get('/amenities', [AdminController::class, 'amenities'])->name('admin.amenities');
        Route::post('/amenities/store', [AdminController::class, 'storeAmenity'])->name('admin.amenities.store');
        Route::post('/amenities/{id}/update', [AdminController::class, 'updateAmenity'])->name('admin.amenities.update');
        Route::post('/amenities/{id}/delete', [AdminController::class, 'destroyAmenity'])->name('admin.amenities.delete');

        // Public Support tickets
        Route::get('/support', [AdminController::class, 'supportTickets'])->name('admin.support');
        Route::post('/support/{id}/resolve', [AdminController::class, 'resolveSupportTicket'])->name('admin.support.resolve');

        // Branding Configuration
        Route::get('/settings/branding', [AdminController::class, 'brandingSettings'])->name('admin.settings.branding');
        Route::post('/settings/branding/update', [AdminController::class, 'updateBranding'])->name('admin.settings.branding.update');

        // Rooms CRUD (shared from HostController)
        Route::get('/homestays', [HostController::class, 'homestays'])->name('admin.homestays');
        Route::get('/homestays/create', [HostController::class, 'create'])->name('admin.homestays.create');
        Route::post('/homestays/store', [HostController::class, 'store'])->name('admin.homestays.store');
        Route::get('/homestays/{id}/edit', [HostController::class, 'edit'])->name('admin.homestays.edit');
        Route::post('/homestays/{id}/update', [HostController::class, 'update'])->name('admin.homestays.update');
        Route::post('/homestays/{id}/delete', [HostController::class, 'destroy'])->name('admin.homestays.delete');

        // Reservations (shared from HostController)
        Route::get('/reservations', [HostController::class, 'reservations'])->name('admin.reservations');
        Route::post('/reservations/{id}/approve', [HostController::class, 'approveReservation'])->name('admin.reservations.approve');
        Route::post('/reservations/{id}/reject', [HostController::class, 'rejectReservation'])->name('admin.reservations.reject');

        // Active Stays & Complaints (shared from HostController)
        Route::get('/active-stays', [HostController::class, 'activeStays'])->name('admin.active-stays');
        Route::get('/complaints', [HostController::class, 'complaints'])->name('admin.complaints');
        Route::post('/complaints/{id}/resolve', [HostController::class, 'resolveComplaint'])->name('admin.complaints.resolve');
    });

});

require __DIR__.'/settings.php';
