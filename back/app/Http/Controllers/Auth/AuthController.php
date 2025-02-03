<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Jobs\SendEmailVerification;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Traits\TokenGenerationTrait;

class AuthController extends Controller
{
    use TokenGenerationTrait;

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

        return response()->json($this->generateTokens($user, $validatedData['device_name']));
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

        // Generate tokens using the trait method
        return response()->json($this->generateTokens($user, $validatedData['device_name']));
    }

    public function destroy(Request $request)
    {
        $request->validate(['device_name' => 'required|string']);

        $user = $request->user();

        $refreshToken = RefreshToken::where('user_id', $user->id)
            ->where('device_name', $request->device_name)
            ->first();

        if (!$refreshToken) {
            return response()->json(['error' => 'Device not found'], 404);
        }

        $refreshToken->delete();

        $user->tokens()->where('name', $request->device_name)->delete();

        return response()->json(['message' => 'Logged out successfully from the device.']);
    }
}
