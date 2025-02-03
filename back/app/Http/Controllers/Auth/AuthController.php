<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendEmailVerification;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required',
                'confirmed'
            ],
            'age' => ['required', 'integer', 'min:13'],
            'gender' => ['required', 'string', 'max:255', 'in:male,female'],
            'phone_number' => ['required', 'string', 'max:255'],
            'device_name' => ['required', 'string', 'max:255'],
        ]);

        $user = User::create($validatedData);

        SendEmailVerification::dispatch($user);

        $user->tokens()->delete();

        $token = $user->createToken($validatedData['device_name'])->plainTextToken;

        return response()->json([
           'token' => $token,
        ]);
    }

    public function authenticate(Request $request)
    {
        $validatedData = $request->validate([
            'email' => 'required|email',
            'password' => 'required',
            'device_name' => 'required|string',
        ]);

        $user = User::where('email', $validatedData['email'])->first();

        if (!$user || !Hash::check($validatedData['password'], $user->password)) {
            return response()->json(['error' => 'Invalid credentials'], 401);
        }

        $user->tokens()->delete();

        $token = $user->createToken($validatedData['device_name'])->plainTextToken;

        return response()->json(['token' => $token]);
    }

    public function destroy(Request $request)
    {
        $request->validate(['device_name' => 'required|string']);

        $request->user()->tokens()->where('name', $request->device_name)->delete();

        return response()->json(['message' => 'Logged out successfully from the device.']);
    }
}
