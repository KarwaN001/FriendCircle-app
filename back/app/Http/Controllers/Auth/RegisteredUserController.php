<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;

class RegisteredUserController extends Controller
{
    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        // Validate the incoming request data
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed'],
            'age' => ['required', 'integer'],
            'gender' => ['required', 'string', 'max:255', 'in:male,female'],
            'phone_number' => ['required', 'string', 'max:255'],
            'longitude' => ['nullable', 'numeric'],
            'latitude' => ['nullable', 'numeric'],
            'profile_photo' => ['nullable', 'image', 'max:2048'],
            'device_name' => ['required', 'string'],
        ]);

        // Create the new user in the database
        $user = User::create($data);

        // Fire the Registered event
         event(new Registered($user));

        // Generate Sanctum token for the newly registered user
        $token = $user->createToken($data['device_name'], ['*'], now()->addHour())->plainTextToken;

        return response()->json([
            'token' => $token,
            'expires_at' => now()->addHour(),
        ], 201);
    }
}
