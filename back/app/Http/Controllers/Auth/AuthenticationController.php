<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthenticationController extends Controller
{
    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required|string',
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'The provided credentials are incorrect.',
            ], 401);
        }

        // creating a token which expires in 1 hour
        $token = $user->createToken($request->device_name, ['*'], now()->addHour())->plainTextToken;

        return response()->json([
            'token' => $token,
            'expires_at' => now()->addHour(),
        ], 201);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request)
    {
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Logged out',
        ]);
    }

    public function refresh(Request $request)
    {
        $request->validate([
            'device_name' => 'required',
        ]);

        $request->user()->tokens()->delete();

        $token = $request->user()->createToken($request->device_name, ['*'], now()->addHour())->plainTextToken;

        return response()->json([
            'token' => $token,
            'expires_at' => now()->addHour(),
        ], 201);
    }

}
