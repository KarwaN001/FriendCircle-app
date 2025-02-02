<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendEmailVerification;
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

        $user = User::create($data);

        SendEmailVerification::dispatch($user);

        $token = $user->createToken($data['device_name'], ['*'], now()->addHour())->plainTextToken;

        return response()->json([
            'token' => $token,
            'expires_at' => now()->addHour(),
        ], 201);
    }
}
