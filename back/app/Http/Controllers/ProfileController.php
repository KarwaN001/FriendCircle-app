<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $validatedData = $request->validate([
            'name' => ['string', 'max:255'],
            'email' => ['string', 'email', 'max:255', 'unique:users'],
            'age' => ['integer', 'min:13'],
            'gender' => ['string', 'max:255', 'in:male,female'],
            'phone_number' => ['string', 'max:255'],
            'profile_photo' => ['sometimes', 'nullable', 'image', 'max:2048', 'mimes:jpeg,png,jpg'],
            'location' => ['sometimes', 'nullable', 'string', 'max:255']
        ]);

        $user = $request->user();

        if ($request->hasFile('profile_photo')) {
            if ($user->profile_photo) {
                unlink(public_path('profile-photos/' . $user->profile_photo));
            }

            $profilePhoto = $request->file('profile_photo');
            $profilePhoto->move(public_path('profile-photos'));
            $validatedData['profile_photo'] = $profilePhoto->hashName();
        }

        $user->update($validatedData);

        return response()->json($user);
    }
}
