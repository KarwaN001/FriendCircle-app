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
            'members' => 'required|array',
            'members.*' => 'exists:users,id'
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

        $group = $user->adminGroups()->create([
            'name' => $validated['name'],
            'group_photo' => $validated['group_photo'] ?? null
        ]);

        // Add the creator to the group
        $group->members()->attach($user->id);

        // Verify all members are friends of the creator
        $friends = $user->friends()->pluck('users.id');
        $invalidMembers = collect($validated['members'])->diff($friends);

        if ($invalidMembers->isNotEmpty()) {
            $group->delete();
            return response()->json(['message' => 'One or more members are not your friends.'], 400);
        }

        // Add all members to the group
        $group->members()->attach($validated['members']);

        // Load the members relationship for the response
        $group->load(['members:id,name,profile_photo', 'groupAdmin:id,name,profile_photo']);

        return response()->json($group, 201);
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
    public function addMembers(Request $request, Group $group)
    {
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

    // DELETE /api/groups/{group}/leave
    public function leaveGroup(Request $request, Group $group)
    {
        $user = $request->user();

        if ($user->id === $group->groupAdmin->id) {
            $group->delete();

            return response()->json(['message' => 'Group deleted.']);
        }

        if (!$group->members()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'You are not a member of this group.'], 400);
        } else {
            $group->members()->detach($user->id);

            if ($group->members()->count() === 0) {
                $group->delete();

                return response()->json(['message' => 'You have left the group. Group deleted.']);
            }

            return response()->json(['message' => 'You have left the group.']);
        }
    }

    // GET /api/groups/{group}/members
    public function listMembers(Request $request, Group $group)
    {
        $user = $request->user();

        if (!$group->members()->where('users.id', $user->id)->exists()) {
            return response()->json(['message' => 'You are not a member of this group.'], 400);
        }

        $members = $group->members()->paginate(10, ['users.id', 'users.name', 'users.profile_photo']);

        return response()->json($members);
    }
}
