<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\User;
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
            'initial_members' => 'sometimes|array|exists:users,id',
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
            $initialMembers = $validated['initial_members'];

            $friends = $user->friends()->pluck('users.id');

            if ($friends->intersect($validated['members'])->count() !== count($validated['members'])) {
                $group->delete();

                return response()->json(['message' => 'One or more members are not your friends.'], 400);
            }

            $group->members()->attach($initialMembers);
        }

        return response()->json($group);
    }

    // PUT /api/groups/{group}
    public function update(Request $request, Group $group)
    {
        $user = $request->user();

        if ($user->id !== $group->groupAdmin->id) {
            return response()->json(['message' => 'You are not the admin of this group.'], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string',
            'group_photo' => 'sometimes|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($request->hasFile('group_photo')) {
            if ($group->group_photo && file_exists(public_path('group-photos/'.$group->group_photo))) {
                unlink(public_path('group-photos/'.$group->group_photo));
            }

            $groupPhoto = $request->file('group_photo');
            $groupPhoto->move(public_path('group-photos'));
            $validated['group_photo'] = $groupPhoto->hashName();
        }

        $group->update($validated);

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

    // Group members management
    // POST /api/groups/{group}/members
    public function addMembers(Request $request, Group $group) {
        $user = $request->user();

        if ($user->id !== $group->groupAdmin->id) {
            return response()->json(['message' => 'Only the group admin can add members.'], 403);
        }

        $validated = $request->validate([
            'members' => 'required|array',
            'members.*' => 'exists:users,id',
        ]);

        $friends = $user->friends()->pluck('users.id');

        if ($friends->intersect($validated['members'])->count() !== count($validated['members'])) {
            return response()->json(['message' => 'One or more members are not your friends.'], 400);
        }

        $group->members()->syncWithoutDetaching($validated['members']);

        return response()->json(['message' => 'Members added successfully.']);
    }

    // DELETE /api/groups/{group}/members/{member}
    public function removeMember(Request $request, Group $group, User $member)
    {
        $user = $request->user();

        if ($user->id !== $group->groupAdmin->id) {
            return response()->json(['message' => 'Only the group admin can remove members.'], 403);
        }

        if ($user->id === $member->id) {
            return response()->json(['message' => 'Admins cannot remove themselves.'], 400);
        }

        if (!$group->members()->where('users.id', $member->id)->exists()) {
            return response()->json(['message' => 'User is not in this group.'], 400);
        }

        $group->members()->detach($member->id);

        return response()->json(['message' => 'Member removed successfully.']);
    }
}
