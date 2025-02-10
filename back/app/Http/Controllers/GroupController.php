<?php

namespace App\Http\Controllers;

use App\Models\Group;
use Illuminate\Http\Request;

class GroupController extends Controller
{
    // GET /api/groups
    public function index(Request $request)
    {
        $user = $request->user();

        $groups = $user->groups()->with([
            'members:id,name,profile_photo',
            'groupAdmin:id,name,profile_photo'
        ])->paginate(10);

        return response()->json($groups);
    }

    // POST /api/groups
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
                $group->delete();
                return response()->json(['message' => 'One or more of the initial members are not friends with you.'],
                    400);
            }

            $group->members()->attach($initialMembers);
        }

        return response()->json($group);
    }

    // DELETE /api/groups/{group}
    public function destroy(Request $request, Group $group)
    {
        $user = $request->user();

        if ($user->id !== $group->groupAdmin->id) {
            return response()->json(['message' => 'You are not the admin of this group.'], 403);
        }

        $group->delete();

        return response()->json(['message' => 'Group deleted.']);
    }
}
