<?php

namespace Database\Seeders;

use App\Models\Amenity;
use App\Models\Booking;
use App\Models\Homestay;
use App\Models\HomestayMedia;
use App\Models\PaymentMethod;
use App\Models\Permission;
use App\Models\Review;
use App\Models\RoomMedia;
use App\Models\SupportTicket;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. Create Default Users
        $admin = User::factory()->create([
            'name' => 'Super Admin',
            'email' => 'admin@homestay.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'phone' => '08111111111',
            'avatar' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
        ]);

        $host = User::factory()->create([
            'name' => 'Ahmad Fauzi (Host)',
            'email' => 'host@homestay.com',
            'password' => bcrypt('password'),
            'role' => 'host',
            'phone' => '08222222222',
            'avatar' => 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        ]);

        $guest = User::factory()->create([
            'name' => 'Rian Kurniawan (Guest)',
            'email' => 'guest@homestay.com',
            'password' => bcrypt('password'),
            'role' => 'guest',
            'phone' => '08333333333',
            'avatar' => 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        ]);

        // Create some additional secondary hosts and guests
        $host2 = User::factory()->create([
            'name' => 'Ni Wayan Sukma',
            'email' => 'host2@homestay.com',
            'password' => bcrypt('password'),
            'role' => 'host',
            'phone' => '08444444444',
            'avatar' => 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
        ]);

        // 2. Create Permissions & Assign to Host
        $perms = [
            ['name' => 'Melihat Pendapatan', 'slug' => 'view-revenue'],
            ['name' => 'Menambah Homestay', 'slug' => 'edit-homestays'],
            ['name' => 'Menghapus Homestay', 'slug' => 'delete-homestays'],
        ];

        foreach ($perms as $p) {
            $permission = Permission::create($p);
            $host->permissions()->attach($permission->id);
            // host2 gets view-revenue and edit-homestays only
            if ($p['slug'] !== 'delete-homestays') {
                $host2->permissions()->attach($permission->id);
            }
        }

        // 3. Create Default Amenities
        $amenities = [
            ['name' => 'High-Speed WiFi', 'icon' => 'Wifi', 'description' => 'Akses internet nirkabel super cepat di seluruh area homestay.'],
            ['name' => 'Air Conditioning (AC)', 'icon' => 'AirVent', 'description' => 'Pendingin ruangan modern untuk kenyamanan tidur Anda.'],
            ['name' => 'Kolam Renang Pribadi', 'icon' => 'Waves', 'description' => 'Kolam renang pribadi luar ruangan yang bersih.'],
            ['name' => 'Dapur Lengkap', 'icon' => 'Utensils', 'description' => 'Peralatan memasak lengkap beserta kompor, kulkas, dan microwave.'],
            ['name' => 'Parkir Mobil Gratis', 'icon' => 'Car', 'description' => 'Area parkir kendaraan roda empat yang luas dan aman.'],
            ['name' => 'Smart TV with Netflix', 'icon' => 'Tv', 'description' => 'Televisi layar lebar pintar dengan langganan video gratis.'],
            ['name' => 'Water Heater', 'icon' => 'Flame', 'description' => 'Pemanas air otomatis untuk mandi air hangat yang menyegarkan.'],
            ['name' => 'Sarapan Gratis', 'icon' => 'Coffee', 'description' => 'Sarapan pagi lezat khas lokal disajikan setiap hari.'],
        ];

        $amenityModels = [];
        foreach ($amenities as $a) {
            $amenityModels[] = Amenity::create($a);
        }

        // 4. Create Payment Methods
        $paymentMethods = [
            [
                'name' => 'Bank Syariah Indonesia (BSI)',
                'type' => 'bank',
                'account_number' => '7148882991',
                'account_name' => 'Yuri Homestay',
                'is_active' => true,
            ],
            [
                'name' => 'Bank Aceh Syariah',
                'type' => 'bank',
                'account_number' => '90188277382',
                'account_name' => 'Yuri Homestay',
                'is_active' => true,
            ],
            [
                'name' => 'DANA E-Wallet',
                'type' => 'ewallet',
                'account_number' => '085260014053',
                'account_name' => 'Yuri Homestay (DANA)',
                'is_active' => true,
                'qris_image_path' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=DanaHomestayManualPaymentQRIS',
            ],
            [
                'name' => 'LinkAja E-Wallet',
                'type' => 'ewallet',
                'account_number' => '085260014053',
                'account_name' => 'Yuri Homestay (LinkAja)',
                'is_active' => true,
                'qris_image_path' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=LinkAjaHomestayManualPaymentQRIS',
            ],
        ];

        foreach ($paymentMethods as $pm) {
            PaymentMethod::create($pm);
        }

        // 5. Create Luxury Homestays (Rooms of Yuri-HomeStay in Lhokseumawe)
        $homestaysData = [
            [
                'host' => $host,
                'name' => 'Deluxe Premium Room',
                'category' => 'Deluxe',
                'description' => 'Manjakan diri Anda di kamar Deluxe Premium mewah dengan fasilitas bintang lima di Yuri Homestay Lhokseumawe. Dikonsep dengan sentuhan modern minimalis, kamar ini dilengkapi dengan Smart TV, kasur King Koil ultra nyaman, pemanas air otomatis, dan pemandangan area taman kami yang asri.',
                'address' => '54JC+JV2, Mns Mesjid, Kec. Muara Dua',
                'city' => 'Lhokseumawe',
                'price_per_night' => 450000.00,
                'max_guests' => 2,
                'latitude' => 5.17016,
                'longitude' => 97.1215276,
                'status' => 'active',
                'media' => [
                    ['url' => 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1000&q=80', 'category' => 'exterior_front', 'primary' => true],
                    ['url' => 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80', 'category' => 'pool', 'primary' => false],
                    ['url' => 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80', 'category' => 'garden', 'primary' => false],
                ],
                'rooms' => [
                    ['url' => 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', 'category' => 'bedroom_1'],
                    ['url' => 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80', 'category' => 'bedroom_2'],
                    ['url' => 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=800&q=80', 'category' => 'bathroom'],
                    ['url' => 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80', 'category' => 'living_room'],
                ],
                'amenities' => [0, 1, 3, 4, 5, 6, 7],
            ],
            [
                'host' => $host,
                'name' => 'Executive Glass Suite',
                'category' => 'Executive',
                'description' => 'Kamar Suite eksklusif dengan dinding kaca minimalis menyajikan pemandangan malam kota Lhokseumawe yang memukau. Sempurna untuk pelancong bisnis maupun liburan romantis dengan fasilitas ruang tamu pribadi, mesin pembuat kopi otomatis, dan kamar mandi marmer mewah.',
                'address' => '54JC+JV2, Mns Mesjid, Kec. Muara Dua',
                'city' => 'Lhokseumawe',
                'price_per_night' => 690000.00,
                'max_guests' => 3,
                'latitude' => 5.17016,
                'longitude' => 97.1215276,
                'status' => 'active',
                'media' => [
                    ['url' => 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1000&q=80', 'category' => 'exterior_front', 'primary' => true],
                    ['url' => 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'category' => 'lobby', 'primary' => false],
                ],
                'rooms' => [
                    ['url' => 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=800&q=80', 'category' => 'bedroom_1'],
                    ['url' => 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80', 'category' => 'bathroom'],
                    ['url' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', 'category' => 'living_room'],
                ],
                'amenities' => [0, 1, 3, 4, 5, 6],
            ],
            [
                'host' => $host2,
                'name' => 'Heritage Suite Joglo',
                'category' => 'Heritage',
                'description' => 'Ruang kamar eksklusif dengan arsitektur perpaduan budaya tradisional dan ornamen kayu ukir premium di Yuri Homestay Lhokseumawe. Menawarkan suasana damai dan tenang khas penginapan adat yang sejuk dengan fasilitas sarapan pagi lezat khas Lhokseumawe.',
                'address' => '54JC+JV2, Mns Mesjid, Kec. Muara Dua',
                'city' => 'Lhokseumawe',
                'price_per_night' => 550000.00,
                'max_guests' => 4,
                'latitude' => 5.17016,
                'longitude' => 97.1215276,
                'status' => 'active',
                'media' => [
                    ['url' => 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1000&q=80', 'category' => 'exterior_front', 'primary' => true],
                    ['url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80', 'category' => 'garden', 'primary' => false],
                ],
                'rooms' => [
                    ['url' => 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80', 'category' => 'bedroom_1'],
                    ['url' => 'https://images.unsplash.com/photo-1620626011761-996317b19a0a?auto=format&fit=crop&w=800&q=80', 'category' => 'bathroom'],
                    ['url' => 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80', 'category' => 'kitchen'],
                ],
                'amenities' => [0, 1, 3, 4, 7],
            ],
            [
                'host' => $host2,
                'name' => 'Family Suite Cabin',
                'category' => 'Family',
                'description' => 'Kamar keluarga tipe kabin luas dengan kapasitas hingga 8 orang di Yuri Homestay Lhokseumawe. Ideal untuk liburan keluarga besar, dilengkapi dengan dua tempat tidur King Size, area duduk bersantai yang lapang, kulkas mini, dan pemanas ruangan modern.',
                'address' => '54JC+JV2, Mns Mesjid, Kec. Muara Dua',
                'city' => 'Lhokseumawe',
                'price_per_night' => 890000.00,
                'max_guests' => 8,
                'latitude' => 5.17016,
                'longitude' => 97.1215276,
                'status' => 'active',
                'media' => [
                    ['url' => 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1000&q=80', 'category' => 'exterior_front', 'primary' => true],
                    ['url' => 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80', 'category' => 'garden', 'primary' => false],
                ],
                'rooms' => [
                    ['url' => 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', 'category' => 'bedroom_1'],
                    ['url' => 'https://images.unsplash.com/photo-1617325247661-675ab4d61273?auto=format&fit=crop&w=800&q=80', 'category' => 'bedroom_2'],
                    ['url' => 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=800&q=80', 'category' => 'bathroom'],
                    ['url' => 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=800&q=80', 'category' => 'living_room'],
                ],
                'amenities' => [0, 1, 3, 4, 5, 6, 7],
            ],
        ];

        foreach ($homestaysData as $hData) {
            $homestay = Homestay::create([
                'user_id' => $hData['host']->id,
                'name' => $hData['name'],
                'slug' => Str::slug($hData['name']),
                'description' => $hData['description'],
                'address' => $hData['address'],
                'city' => $hData['city'],
                'price_per_night' => $hData['price_per_night'],
                'max_guests' => $hData['max_guests'],
                'latitude' => $hData['latitude'],
                'longitude' => $hData['longitude'],
                'status' => $hData['status'],
                'category' => $hData['category'],
            ]);

            // Attach external media
            foreach ($hData['media'] as $med) {
                HomestayMedia::create([
                    'homestay_id' => $homestay->id,
                    'file_path' => $med['url'],
                    'type' => 'image',
                    'category' => $med['category'],
                    'is_primary' => $med['primary'],
                ]);
            }

            // Attach internal room media
            foreach ($hData['rooms'] as $roomMed) {
                RoomMedia::create([
                    'homestay_id' => $homestay->id,
                    'file_path' => $roomMed['url'],
                    'type' => 'image',
                    'category' => $roomMed['category'],
                    'is_primary' => false,
                ]);
            }

            // Attach amenities
            foreach ($hData['amenities'] as $idx) {
                $homestay->amenities()->attach($amenityModels[$idx]->id);
            }

            // 6. Create realistic past bookings & reviews for each homestay
            $booking1 = Booking::create([
                'user_id' => $guest->id,
                'homestay_id' => $homestay->id,
                'payment_method_id' => 1, // BSI
                'check_in' => now()->subDays(10)->format('Y-m-d'),
                'check_out' => now()->subDays(8)->format('Y-m-d'),
                'total_guests' => 2,
                'total_price' => $homestay->price_per_night * 2,
                'payment_receipt_path' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MockReceiptImage',
                'paid_at' => now()->subDays(10),
                'status' => 'completed',
            ]);

            Review::create([
                'booking_id' => $booking1->id,
                'user_id' => $guest->id,
                'homestay_id' => $homestay->id,
                'rating' => 5,
                'comment' => 'Tempat yang luar biasa bersih, host sangat ramah dan responsif. Semua fasilitas berfungsi dengan baik. Sangat recommended!',
            ]);

            // Add another booking in pending state
            Booking::create([
                'user_id' => $guest->id,
                'homestay_id' => $homestay->id,
                'payment_method_id' => 3, // DANA
                'check_in' => now()->addDays(5)->format('Y-m-d'),
                'check_out' => now()->addDays(7)->format('Y-m-d'),
                'total_guests' => 3,
                'total_price' => $homestay->price_per_night * 2,
                'payment_receipt_path' => 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MockReceiptImage',
                'paid_at' => now(),
                'status' => 'pending_approval',
            ]);
        }

        // 7. Seed support tickets
        SupportTicket::create([
            'name' => 'Budi Prasetyo',
            'email' => 'budi@gmail.com',
            'subject' => 'Tanya ketersediaan untuk rombongan besar',
            'message' => 'Halo Admin, apakah ada kamar di Yuri Homestay yang bisa menampung sekitar 10 orang sekaligus dalam satu lantai? Terima kasih.',
            'status' => 'pending',
        ]);

        SupportTicket::create([
            'name' => 'Sarah Wijaya',
            'email' => 'sarah@gmail.com',
            'subject' => 'Masalah refund pembatalan',
            'message' => 'Kemarin saya melakukan pembatalan untuk pesanan Deluxe Premium Room, namun dana refund belum masuk ke rekening saya. Mohon bantuannya.',
            'status' => 'resolved',
        ]);
    }
}
