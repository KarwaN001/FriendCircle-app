<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendEmail;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ForgotPasswordController extends Controller
{
    public function email(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        // Check cooldown (30 seconds)
        $latestOtp = $user->otps()->latest()->first();
        if ($latestOtp && now()->diffInSeconds($latestOtp->created_at) < 30) {
            return response()->json(['error' => 'Please wait 30 seconds before requesting a new OTP.'], 429);
        }

        $otp = $user->generateNewOtp();
        SendEmail::dispatch($otp);

        return response()->json(['message' => 'OTP sent to email.']);
    }

    public function reset(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
            'otp' => ['required', 'digits:6'],
            'password' => ['required', 'confirmed'],
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return response()->json(['error' => 'User not found.'], 404);
        }

        $otp = $user->otps()
            ->where('code', $request->otp)
            ->where('expires_at', '>', now())
            ->first();

        if (!$otp) {
            return response()->json(['error' => 'Invalid or expired OTP.'], 422);
        }

        $user->update(['password' => $request->password]);

        $user->tokens()->delete();
        $otp->delete();

        return response()->json(['message' => 'Password reset successfully.']);
    }
}
