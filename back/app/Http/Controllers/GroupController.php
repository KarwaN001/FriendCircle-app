<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class GroupController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'group_photo' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
            'initial_members' => 'sometimes|json',
        ]);

        $user = $request->user();

        if ($user->friends()->count() === 0) {
            return response()->json(['message' => 'You need to have friends to create a group.'], 400);
        }

        if ($user->groups()->where('name', $validated['name'])->exists()) {
            return response()->json(['message' => 'You already have a group with this name.'], 400);
        }

        if ($request->hasFile('group_photo')) {
            $groupPhoto = $request->file('group_photo');
            $groupPhoto->move(public_path('group-photos'));
            $validated['group_photo'] = $groupPhoto->hashName();
        }

        $group = $user->adminGroups()->create($validated);

        $group->members()->attach($user->id);

        if ($request->has('initial_members')) {
            $initialMembers = json_decode($request->initial_members, true);

            if ($user->friends()->whereIn('users.id', $initialMembers)->count() !== count($initialMembers)) {
                return response()->json(['message' => 'One or more of the initial members are not friends with you.'], 400);
            }

            $group->members()->attach($initialMembers);
        }

        return response()->json($group);
    }
}
