<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        $user = $request->user()->loadCount(['groups'])->append('friends_count');

        return response()->json($user);
    }

    public function update(Request $request, User $user)
    {
        if ($request->user()->id !== $user->id) {
            return response()->json(['message' => 'You can only update your own profile.'], 403);
        }

        $validatedData = $request->validate([
            'name' => ['string', 'max:255'],
            'age' => ['integer', 'min:13'],
            'gender' => ['string', 'max:255', 'in:male,female'],
            'phone_number' => ['string', 'max:255'],
            'profile_photo' => ['sometimes', 'image', 'max:2048', 'mimes:jpeg,png,jpg'],
            'latitude' => ['numeric', 'between:-90,90'],
            'longitude' => ['numeric', 'between:-180,180']
        ]);

        if ($request->hasFile('profile_photo')) {
            if (!empty($user->profile_photo) && file_exists(public_path($user->profile_photo))) {
                unlink(public_path($user->profile_photo));
            }

            $profilePhoto = $request->file('profile_photo');
            $fileName = $profilePhoto->hashName();
            $profilePhoto->move(public_path('profile-photos'), $fileName);

            $validatedData['profile_photo'] = 'profile-photos/'.$fileName;
        }

        $user->update($validatedData);

        $user->loadCount(['groups']);

        return response()->json($user);
    }
}
