<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\RefreshToken;
use Illuminate\Http\Request;
use App\Traits\TokenGenerationTrait;
use Illuminate\Support\Str;

class RefreshTokenController extends Controller
{
    use TokenGenerationTrait;

    public function __invoke(Request $request)
    {
        $request->validate([
            'refresh_token' => 'required',
            'device_name' => 'required|string',
        ]);

        // Find refresh token
        $refreshToken = RefreshToken::where('token', hash('sha256', $request->refresh_token))
            ->where('device_name', $request->device_name)
            ->where('expires_at', '>', now())
            ->first();

        if (!$refreshToken) {
            return response()->json(['error' => 'Invalid or expired refresh token'], 401);
        }

        $user = $refreshToken->user;

        $newRefreshToken = Str::random(64);
        $refreshToken->update([
            'token' => hash('sha256', $newRefreshToken),
            'expires_at' => now()->addSeconds($this->getRefreshTokenLifetime())
        ]);

        // Generate new access token
        $accessToken = $user->createToken($request->device_name, ['*'], now()->addSeconds($this->getAccessTokenLifetime()))->plainTextToken;

        return response()->json([
            'access_token' => $accessToken,
            'refresh_token' => $newRefreshToken,
            'expires_in' => $this->getAccessTokenLifetime(),
        ]);
    }
}
