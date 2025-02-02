<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Carbon\Carbon;
use Illuminate\Validation\ValidationException;
use App\Models\RefreshToken;

class AuthenticationController extends Controller
{
    private const ACCESS_TOKEN_LIFETIME = 3600; // 1 hour in seconds
    private const REFRESH_TOKEN_LIFETIME = 2592000; // 30 days in seconds

    /**
     * Handle an incoming authentication request.
     *
     * @throws ValidationException
     */
    public function store(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required|string|max:255',
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (!$user || !Hash::check($credentials['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        return $this->issueTokens($user, $credentials['device_name']);
    }

    /**
     * Refresh access token using refresh token.
     *
     * @throws ValidationException
     */
    public function refresh(Request $request)
    {
        $data = $request->validate([
            'refresh_token' => 'required|string|size:64',
            'device_name' => 'required|string|max:255',
        ]);

        $refreshToken = RefreshToken::where('refresh_token', hash('sha256', $data['refresh_token']))
            ->where('device_name', $data['device_name'])
            ->first();

        if (!$refreshToken || $refreshToken->isExpired()) {
            throw ValidationException::withMessages([
                'refresh_token' => ['The refresh token is invalid or has expired.'],
            ]);
        }

        // Revoke the old refresh token
        $refreshToken->delete();

        return $this->issueTokens($refreshToken->user, $data['device_name']);
    }

    /**
     * Issue new access and refresh tokens.
     */
    private function issueTokens(User $user, string $deviceName): JsonResponse
    {
        // Generate new access token
        $accessToken = $user->createToken(
            $deviceName,
            ['*'],
            now()->addSeconds(self::ACCESS_TOKEN_LIFETIME)
        )->plainTextToken;

        // Generate new refresh token
        $refreshToken = Str::random(64);

        // Store refresh token
        RefreshToken::create([
            'user_id' => $user->id,
            'device_name' => $deviceName,
            'refresh_token' => hash('sha256', $refreshToken),
            'expires_at' => now()->addSeconds(self::REFRESH_TOKEN_LIFETIME),
        ]);

        $expiresAt = now()->addSeconds(self::ACCESS_TOKEN_LIFETIME);

        return response()->json([
            'access_token' => $accessToken,
            'expires_at' => $expiresAt->toIso8601String(),
            'refresh_token' => $refreshToken,
        ], 201);
    }

    /**
     * Logout and revoke all tokens for the current device.
     */
    public function destroy(Request $request): JsonResponse
    {
        $deviceName = $request->validate([
            'device_name' => 'required|string|max:255',
        ])['device_name'];

        // Revoke all tokens for this device
        $request->user()->tokens()
            ->where('name', $deviceName)
            ->delete();

        RefreshToken::where('user_id', $request->user()->id)
            ->where('device_name', $deviceName)
            ->delete();

        return response()->json([
            'message' => 'Successfully logged out.',
        ]);
    }

    /**
     * Logout from all devices.
     */
    public function destroyAll(Request $request): JsonResponse
    {
        $request->user()->tokens()->delete();
        RefreshToken::where('user_id', $request->user()->id)->delete();

        return response()->json([
            'message' => 'Successfully logged out from all devices.',
        ]);
    }
}
