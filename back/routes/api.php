<?php

use App\Http\Controllers\FriendshipController;
use App\Http\Controllers\GroupController;
use App\Http\Controllers\MessageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Auth\{AuthController,
    EmailVerificationController,
    ForgotPasswordController,
};

Route::post('/register', [AuthController::class, 'store'])->name('register');

Route::middleware('throttle:5,1')->group(function () {
    Route::post('/login', [AuthController::class, 'authenticate'])
        ->name('login');

    Route::post('/email/resend-otp', [EmailVerificationController::class, 'resendOtp'])
        ->name('verification.resend');

    Route::post('/email/verify', [EmailVerificationController::class, 'verifyOtp'])
        ->name('verification.verify');

    Route::post('/forgot-password', [ForgotPasswordController::class, 'email'])
        ->name('password.email');
});

Route::post('/reset-password', [ForgotPasswordController::class, 'reset'])
    ->name('password.reset');

Route::middleware('auth:sanctum')->group(function () {

    Route::middleware('verified')->group(function () {
        Route::post('/logout', [AuthController::class, 'destroy'])->name('logout');

        // Profile routes
        Route::get('/profile', [ProfileController::class, 'show']);
        Route::patch('/profile/{user}', [ProfileController::class, 'update']);

        // Friendship routes
        Route::get('/friend-suggestions', [FriendshipController::class, 'suggestions']);
        Route::get('/friend-requests',
            [
                FriendshipController::class, 'friendRequests'
            ]);  // List pending friend requests (incoming &/or outgoing as needed)
        Route::post('/friend-requests', [FriendshipController::class, 'store']);   // Send a friend request
        Route::put('/friend-requests/{friendship}/accept', [FriendshipController::class, 'accept']);
        Route::put('/friend-requests/{friendship}/decline', [FriendshipController::class, 'decline']);
        Route::delete('/friend-requests/{friendship}',
            [FriendshipController::class, 'cancel']);  // Cancel a sent friend request
        Route::get('/friends', [FriendshipController::class, 'friends']);  // List all friends

        // Group routes
        Route::get('/groups', [GroupController::class, 'index'])->name('groups.index');
        Route::post('/groups', [GroupController::class, 'store'])->name('groups.store');
        Route::patch('/groups/{group}', [GroupController::class, 'update'])->name('groups.update');
        Route::delete('/groups/{group}', [GroupController::class, 'destroy'])->name('groups.destroy');
        Route::post('/groups/{group}/members', [GroupController::class, 'addMembers']);
        Route::delete('/groups/{group}/members/{member}', [GroupController::class, 'removeMember']);
        Route::delete('/groups/{group}/leave', [GroupController::class, 'leaveGroup']);
        Route::get('/groups/{group}/members', [GroupController::class, 'listMembers']);

        // Group chat routes
        Route::get('/groups/{group}/messages', [MessageController::class, 'index']);
        Route::post('/groups/{group}/messages', [MessageController::class, 'store']);
        Route::put('/groups/{group}/messages/{message}', [MessageController::class, 'update']);
        Route::delete('/groups/{group}/messages/{message}', [MessageController::class, 'destroy']);
    });
});
