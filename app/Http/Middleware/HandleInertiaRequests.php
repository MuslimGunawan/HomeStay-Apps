<?php

namespace App\Http\Middleware;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => cache('branding_homestay_name', 'Yuri-HomeStay'),
            'logo' => str_replace('/storage/', '/uploads/', cache('branding_logo', '/images/logo.png')),
            'favicon' => str_replace('/storage/', '/uploads/', cache('branding_favicon', '/favicon.ico')),
            'phone' => cache('branding_phone', '0852-6001-4053'),
            'email' => cache('branding_email', 'yurihomestay@gmail.com'),
            'address' => cache('branding_address', '54JC+JV2, Mns Mesjid, Kec. Muara Dua, Lhokseumawe, Aceh'),
            'instagram' => cache('branding_instagram', 'https://instagram.com/yurihomestay'),
            'github' => cache('branding_github', 'https://github.com/MuslimGunawan/HomeStay-Apps.git'),
            'auth' => [
                'user' => $request->user(),
            ],
            'cartCount' => (function () use ($request) {
                $user = $request->user();
                $dbCount = ($user && $user->isGuest()) ? CartItem::where('user_id', $user->id)->count() : 0;
                $sessionCount = count(session('cart', []));

                // If user is logged in, use DB count; otherwise use session count
                return $user ? $dbCount : $sessionCount;
            })(),
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
