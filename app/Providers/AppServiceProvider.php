<?php

namespace App\Providers;

use App\Models\Booking;
use App\Models\Homestay;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        $this->app->usePublicPath(base_path(env('PUBLIC_PATH', 'public')));
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureDefaults();

        // Auto check-out confirmed bookings whose check_out date has passed
        try {
            if (Schema::hasTable('bookings')) {
                Booking::where('status', 'confirmed')
                    ->where('check_out', '<', now()->format('Y-m-d'))
                    ->update(['status' => 'completed']);
            }
        } catch (\Throwable $e) {
            // Silence if database is not fully migrated yet
        }

        // Core Gates for IDOR Protection
        Gate::define('manage-homestay', function (User $user, Homestay $homestay) {
            return $user->id === $homestay->user_id || $user->isAdmin();
        });

        Gate::define('view-booking', function (User $user, Booking $booking) {
            return $user->id === $booking->user_id || $user->id === $booking->homestay->user_id || $user->isAdmin();
        });

        Gate::define('submit-review', function (User $user, Booking $booking) {
            return $user->id === $booking->user_id && $booking->status === 'completed';
        });
    }

    /**
     * Configure default behaviors for production-ready applications.
     */
    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }
}
