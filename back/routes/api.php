<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\{AuthController,
    EmailVerificationController,
    ForgotPasswordController,
};

Route::post('/register', [AuthController::class, 'store'])->name('register');
Route::post('/login', [AuthController::class, 'authenticate'])
    ->middleware('throttle:5,1')
    ->name('login');

Route::post('/forgot-password', [ForgotPasswordController::class, 'email'])->name('password.email');
Route::post('/reset-password', [ForgotPasswordController::class, 'reset'])->name('password.reset');

// Routes for authenticated users
Route::middleware('auth:sanctum')->group(function () {
    Route::middleware('throttle:6,1')->group(function () {
        Route::post('/email/verification-notification', [EmailVerificationController::class, 'send'])
            ->name('verification.send');
        Route::get('/verify-email/{id}/{hash}', [EmailVerificationController::class, 'verify'])
            ->middleware('signed')
            ->name('verification.verify');
    });

    // Routes for verified users
    Route::middleware('verified')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

        // Profile routes
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::put('/profile', [ProfileController::class, 'update']);

        // Friendship routes
        Route::get('/friend-suggestions', [FriendshipController::class, 'suggestions']);
        Route::get('/friend-requests',
            [FriendshipController::class, 'index']);  // List pending friend requests (incoming &/or outgoing as needed)
        Route::post('/friend-requests', [FriendshipController::class, 'store']);   // Send a friend request
        Route::put('/friend-requests/{friendship}/accept', [FriendshipController::class, 'accept']);
        Route::put('/friend-requests/{friendship}/decline', [FriendshipController::class, 'decline']);
        Route::delete('/friend-requests/{friendship}', [FriendshipController::class, 'cancel']);  // Cancel a sent friend request
    });
});
