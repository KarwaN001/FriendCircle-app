<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendEmailVerification;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class RegisteredUserController extends Controller
{
    private const ACCESS_TOKEN_LIFETIME = 3600; // 1 hour in seconds
    private const REFRESH_TOKEN_LIFETIME = 2592000; // 30 days in seconds

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required',
                'confirmed',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
            ],
            'age' => ['required', 'integer', 'min:13'], // Added minimum age requirement
            'gender' => ['required', 'string', 'max:255', 'in:male,female'],  // Added 'other' option
            'phone_number' => ['required', 'string', 'max:255', 'regex:/^([0-9\s\-\+\(\)]*)$/'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180'],
            'latitude' => ['nullable', 'numeric', 'between:-90,90'],
            'profile_photo' => ['nullable', 'image', 'max:2048', 'mimes:jpeg,png,jpg'],
            'device_name' => ['required', 'string', 'max:255'],
        ]);

        // Handle profile photo upload if present
        if ($request->hasFile('profile_photo')) {
            $path = $request->file('profile_photo')->store('profile-photos', 'public');
            $data['profile_photo'] = $path;
        }

        // Remove password confirmation from data array
        unset($data['password_confirmation']);

        // Hash password before creation
        $data['password'] = bcrypt($data['password']);

        $user = User::create($data);

        // Dispatch email verification job
        SendEmailVerification::dispatch($user);

        // Fire registered event
        event(new Registered($user));

        return $this->issueTokens($user, $data['device_name']);
    }

    /**
     * Issue new access and refresh tokens.
     */
    private function issueTokens(User $user, string $deviceName): \Illuminate\Http\JsonResponse
    {
        // Generate access token
        $accessToken = $user->createToken(
            $deviceName,
            ['*'],
            now()->addSeconds(self::ACCESS_TOKEN_LIFETIME)
        )->plainTextToken;

        // Generate refresh token
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
            'user' => $user->only(['id', 'name', 'email']),
            'access_token' => $accessToken,
            'expires_at' => $expiresAt->toIso8601String(),
            'refresh_token' => $refreshToken,
        ], 201);
    }
}
