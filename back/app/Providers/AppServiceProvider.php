<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\URL;
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
        // Customize the password reset link to point to your frontend application
        ResetPassword::createUrlUsing(function (object $notifiable, string $token) {
            $frontendUrl = config('app.frontend_url');

            // Get the user's email for the reset form
            $email = $notifiable->getEmailForPasswordReset();

            // Create the full reset URL that includes:
            // 1. Your frontend URL
            // 2. The path to your reset password page
            // 3. The reset token
            // 4. The user's email (as a query parameter)
            return "{$frontendUrl}/reset-password.html?token={$token}&email={$email}";
        });
    }
}
