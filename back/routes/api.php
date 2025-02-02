<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\{
    AuthenticationController,
    EmailVerificationNotificationController,
    NewPasswordController,
    PasswordResetLinkController,
    RegisteredUserController,
    VerifyEmailController
};


Route::post('/register', [RegisteredUserController::class, 'store'])->name('register');
Route::post('/login', [AuthenticationController::class, 'store'])
        ->middleware('throttle:5,1')
        ->name('login');
Route::post('/forgot-password', [PasswordResetLinkController::class, 'store'])->name('password.email');
Route::post('/reset-password', [NewPasswordController::class, 'store'])->name('password.store');

// Routes for authenticated users
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('throttle:6,1')->group(function () {
        Route::post('/email/verification-notification', [EmailVerificationNotificationController::class, 'store'])
            ->name('verification.send');
        Route::get('/verify-email/{id}/{hash}', VerifyEmailController::class)
            ->middleware('signed')
            ->name('verification.verify');
    });

    // Routes for verified users
    Route::middleware('verified')->group(function () {
        Route::post('/logout', [AuthenticationController::class, 'destroy'])->name('logout');
        Route::get('/user', function (Request $request) {
            return $request->user();
        })->name('user');
        Route::post('/refresh', [AuthenticationController::class, 'refresh'])->name('refresh');
    });
});
