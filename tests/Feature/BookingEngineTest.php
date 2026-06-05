<?php

use App\Models\Booking;
use App\Models\Homestay;
use App\Models\PaymentMethod;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('auto registration works during checkout booking', function () {
    $host = User::factory()->create(['role' => 'host']);

    $homestay = Homestay::create([
        'user_id' => $host->id,
        'name' => 'Villa Canggu Test',
        'slug' => 'villa-canggu-test',
        'description' => 'A wonderful tropical villa for tests.',
        'address' => 'Jl. Canggu No. 1',
        'city' => 'Bali',
        'price_per_night' => 1000000.00,
        'max_guests' => 4,
        'status' => 'active',
    ]);

    $paymentMethod = PaymentMethod::create([
        'name' => 'BSI Test',
        'type' => 'bank',
        'account_number' => '1234567890',
        'account_name' => 'Host Owner',
    ]);

    $checkoutData = [
        'homestay_id' => $homestay->id,
        'payment_method_id' => $paymentMethod->id,
        'check_in' => now()->addDays(2)->format('Y-m-d'),
        'check_out' => now()->addDays(5)->format('Y-m-d'),
        'total_guests' => 2,
        'name' => 'Tamu Baru',
        'email' => 'tamubaru@gmail.com',
        'phone' => '08123456789',
    ];

    $response = $this->post(route('bookings.store'), $checkoutData);

    // Verify user is created in database
    $this->assertDatabaseHas('users', [
        'email' => 'tamubaru@gmail.com',
        'role' => 'guest',
        'phone' => '08123456789',
    ]);

    // Verify user is logged in
    $user = User::where('email', 'tamubaru@gmail.com')->first();
    $this->assertAuthenticatedAs($user);

    // Verify booking is created
    $this->assertDatabaseHas('bookings', [
        'user_id' => $user->id,
        'homestay_id' => $homestay->id,
        'payment_method_id' => $paymentMethod->id,
        'total_guests' => 2,
        'status' => 'pending_payment',
    ]);
});

test('prevent double booking on same dates', function () {
    $host = User::factory()->create(['role' => 'host']);
    $guest1 = User::factory()->create(['role' => 'guest']);
    $guest2 = User::factory()->create(['role' => 'guest']);

    $homestay = Homestay::create([
        'user_id' => $host->id,
        'name' => 'Villa Canggu Test 2',
        'slug' => 'villa-canggu-test-2',
        'description' => 'A wonderful tropical villa for tests.',
        'address' => 'Jl. Canggu No. 2',
        'city' => 'Bali',
        'price_per_night' => 1000000.00,
        'max_guests' => 4,
        'status' => 'active',
    ]);

    $paymentMethod = PaymentMethod::create([
        'name' => 'BSI Test',
        'type' => 'bank',
        'account_number' => '1234567890',
        'account_name' => 'Host Owner',
    ]);

    // Create an existing confirmed booking
    Booking::create([
        'user_id' => $guest1->id,
        'homestay_id' => $homestay->id,
        'payment_method_id' => $paymentMethod->id,
        'check_in' => now()->addDays(5)->format('Y-m-d'),
        'check_out' => now()->addDays(10)->format('Y-m-d'),
        'total_guests' => 2,
        'total_price' => 5000000.00,
        'status' => 'confirmed',
    ]);

    // Try booking overlapping dates (check_in between 5 and 10)
    $this->actingAs($guest2);

    $checkoutData = [
        'homestay_id' => $homestay->id,
        'payment_method_id' => $paymentMethod->id,
        'check_in' => now()->addDays(7)->format('Y-m-d'),
        'check_out' => now()->addDays(12)->format('Y-m-d'),
        'total_guests' => 2,
    ];

    $response = $this->post(route('bookings.store'), $checkoutData);

    // It should throw an validation exception or error in session
    $response->assertSessionHasErrors();
});
