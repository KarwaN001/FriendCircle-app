<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request)
    {
        // Validate and authenticate the user
        $request->authenticate();

        // Create a Sanctum token for the authenticated user
        $user = Auth::user();
        $token = $user->createToken($user->email)->plainTextToken;

        // Return the token and user data as the response
        return response()->json([
            'token' => $token,
            'user' => $user,
        ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        Auth::user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out successfully',
        ], 200);
    }

    public function refreshToken(Request $request)
    {
        $user = $request->user();

        $user->tokens()->delete();

        // Issue a new token
        $newToken = $user->createToken($user->email)->plainTextToken;

        return response()->json([
            'access_token' => $newToken,
            'token_type' => 'Bearer',
        ]);
    }

}
