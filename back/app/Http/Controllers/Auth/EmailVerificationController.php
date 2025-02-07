<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendEmail;
use App\Models\PendingUser;
use App\Models\User;
use Illuminate\Http\Request;

class EmailVerificationController extends Controller
{
    public function resendOtp(Request $request)
    {
        $validated = $request->validate([
            'verification_id' => 'required|numeric'
        ]);

        $pendingUser = PendingUser::findOrFail($validated['verification_id']);

        // Check cooldown (30 seconds)
        $latestOtp = $pendingUser->otps()->latest()->first();
        if ($latestOtp && abs(now()->diffInSeconds($latestOtp->created_at)) < 30) {
            return response()->json(['error' => 'Please wait 30 seconds before requesting a new OTP.'], 429);
        }

        SendEmail::dispatch($pendingUser->generateNewOtp(), true);

        return response()->json(['message' => 'New OTP sent']);
    }

    public function verifyOtp(Request $request)
    {
        $validated = $request->validate([
            'verification_id' => 'required|numeric',
            'otp' => 'required|digits:6'
        ]);

        $pendingUser = PendingUser::findOrFail($validated['verification_id']);
        $otp = $pendingUser->otps()
            ->where('code', $validated['otp'])
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return response()->json(['error' => 'Invalid or expired OTP'], 422);
        }

        $user = User::create($pendingUser->user_data);

        $user->markEmailAsVerified();

        $pendingUser->delete();

        $token = $user->createToken($user->user_data['device_name'] ?? 'default')->plainTextToken;

        return response()->json([
            'message' => 'Account verified and created',
            'token' => $token
        ]);
    }
}
