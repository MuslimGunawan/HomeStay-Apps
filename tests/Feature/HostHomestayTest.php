<?php

use App\Models\Amenity;
use App\Models\Homestay;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('host can update homestay with custom category and custom amenities', function () {
    // 1. Create a host user
    $host = User::factory()->create(['role' => 'host']);

    // 2. Create the edit-homestays permission and attach to host
    $permission = Permission::create([
        'name' => 'Menambah Homestay',
        'slug' => 'edit-homestays',
    ]);
    $host->permissions()->attach($permission->id);

    // 3. Create a homestay belonging to the host
    $homestay = Homestay::create([
        'user_id' => $host->id,
        'name' => 'Kamar Standard',
        'slug' => 'kamar-standard',
        'description' => 'Kamar standard yang nyaman.',
        'address' => 'Jl. Merdeka No. 1',
        'city' => 'Lhokseumawe',
        'price_per_night' => 300000.00,
        'max_guests' => 2,
        'status' => 'active',
        'category' => 'Standard',
    ]);

    // 4. Create an existing amenity
    $existingAmenity = Amenity::create([
        'name' => 'WiFi',
        'icon' => 'Wifi',
        'description' => 'Akses internet nirkabel.',
    ]);

    // 5. Submit update request acting as the host
    $this->actingAs($host);

    $updateData = [
        'name' => 'Kamar Suite Mewah Baru',
        'description' => 'Kamar suite dengan pemandangan alam yang indah.',
        'address' => 'Jl. Merdeka No. 10',
        'city' => 'Lhokseumawe',
        'price_per_night' => 850000.00,
        'max_guests' => 4,
        'status' => 'active',
        'category' => 'Suite Luxury', // Custom category
        'amenities' => [$existingAmenity->id],
        'custom_amenities' => ['Private Pool', 'Free Mini Bar'], // Custom amenities
    ];

    $response = $this->post(route('host.homestays.update', ['id' => $homestay->id]), $updateData);

    // Assert redirect back or to homestays index
    $response->assertRedirect(route('host.homestays'));

    // Assert database contains the updated data
    $this->assertDatabaseHas('homestays', [
        'id' => $homestay->id,
        'name' => 'Kamar Suite Mewah Baru',
        'category' => 'Suite Luxury',
        'price_per_night' => 850000.00,
    ]);

    // Assert custom amenities were created and attached
    $this->assertDatabaseHas('amenities', [
        'name' => 'Private Pool',
    ]);
    $this->assertDatabaseHas('amenities', [
        'name' => 'Free Mini Bar',
    ]);

    // Verify pivot records exist
    $privatePool = Amenity::where('name', 'Private Pool')->first();
    $freeMiniBar = Amenity::where('name', 'Free Mini Bar')->first();

    $this->assertDatabaseHas('amenity_homestay', [
        'homestay_id' => $homestay->id,
        'amenity_id' => $privatePool->id,
    ]);
    $this->assertDatabaseHas('amenity_homestay', [
        'homestay_id' => $homestay->id,
        'amenity_id' => $freeMiniBar->id,
    ]);
});
