<?php

namespace App\Traits;

use App\Models\RefreshToken;
use Illuminate\Support\Str;

trait TokenGenerationTrait
{
    private const ACCESS_TOKEN_LIFETIME = 15 * 60; // 15 minutes in seconds
    private const REFRESH_TOKEN_LIFETIME = 7 * 24 * 60 * 60; // 7 days in seconds

    protected function generateTokens($user, string $deviceName)
    {
        // Generate Access Token (Short-lived)
        $accessToken = $user->createToken($deviceName, ['*'], now()->addSeconds(self::ACCESS_TOKEN_LIFETIME))->plainTextToken;

        // Generate Refresh Token (Long-lived, stored in DB)
        $refreshToken = Str::random(64);

        // Store refresh token in database
        RefreshToken::updateOrCreate(
            ['user_id' => $user->id, 'device_name' => $deviceName], // Unique per device
            [
                'token' => hash('sha256', $refreshToken),
                'expires_at' => now()->addSeconds(self::REFRESH_TOKEN_LIFETIME)
            ]
        );

        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'expires_in' => self::ACCESS_TOKEN_LIFETIME,
        ];
    }

    protected function getAccessTokenLifetime()
    {
        return self::ACCESS_TOKEN_LIFETIME;
    }

    protected function getRefreshTokenLifetime()
    {
        return self::REFRESH_TOKEN_LIFETIME;
    }
}
