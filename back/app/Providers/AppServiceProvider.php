<?php

namespace App\Providers;

use App\Models\Otp;
use App\Models\PendingUser;
use Illuminate\Support\Carbon;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     * This method is called after all other service providers have been registered
     */
    public function boot(): void
    {
        PendingUser::where('expires_at', '<', Carbon::now())->delete();
        Otp::where('expires_at', '<', Carbon::now())->delete();
    }
}
