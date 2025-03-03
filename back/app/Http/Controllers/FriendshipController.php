<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;

class FriendshipController extends Controller
{
    // GET /api/friend-suggestions
    public function suggestions(Request $request)
    {
        $user = $request->user();

        $suggestions = User::whereNotIn('id', $user->friends()->pluck('id')->push($user->id))
            ->paginate(10);

        return response()->json($suggestions);
    }

    // GET /api/friends
    public function friends(Request $request)
    {
        $user = $request->user();

        $friends = $user->friends()
            ->select('users.*', 'f.id as friendship_id')
            ->paginate(10);

        return response()->json($friends);
    }

    // GET /api/friend-requests
    public function friendRequests (Request $request)
    {
        $user = $request->user();

        $incoming = $user->receivedFriendRequests()
            ->where('status', 'pending')
            ->with('sender')
            ->paginate(5);

        $outgoing = $user->sentFriendRequests()
            ->where('status', 'pending')
            ->with('recipient')
            ->paginate(5);

        return response()->json([
            'incoming' => $incoming,
            'outgoing' => $outgoing
        ]);
    }

    // POST /api/friend-requests
    public function store(Request $request)
    {
        $user = $request->user();

        $request->validate([
            'recipient_id' => 'required|numeric|exists:users,id|not_in:'.$user->id
        ]);

        // Check if a friendship already exists between the two users
        $exists = Friendship::where(function ($query) use ($user, $request) {
            $query->where('sender_id', $user->id)
                ->where('recipient_id', $request->recipient_id);
        })->orWhere(function ($query) use ($user, $request) {
            $query->where('sender_id', $request->recipient_id)
                ->where('recipient_id', $user->id);
        })->first();

        if ($exists) {
            return response()->json(['message' => 'Friend request already exists or you are already friends.'], 409);
        }

        $friendRequest = Friendship::create([
            'sender_id' => $user->id,
            'recipient_id' => $request->recipient_id,
            // Status is pending by default
        ])->load('recipient');

        return response()->json($friendRequest, 201);
    }

    // PUT /api/friend-requests/{friendship}/accept
    public function accept(Request $request, Friendship $friendship)
    {
        $user = $request->user();

        // Ensure the authenticated user is the recipient
        if ($friendship->recipient_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        // Only allow acceptance if status is pending
        if ($friendship->status !== 'pending') {
            return response()->json(['message' => 'Friend request is not pending.'], 422);
        }

        $friendship->status = 'accepted';
        $friendship->save();

        return response()->json($friendship);
    }

    // PUT /api/friend-requests/{friendship}/decline
    public function decline(Request $request, Friendship $friendship)
    {
        $user = $request->user();

        // Ensure the authenticated user is the recipient
        if ($friendship->recipient_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        if ($friendship->status !== 'pending') {
            return response()->json(['message' => 'Friend request is not pending.'], 422);
        }

        $friendship->delete();

        return response()->json(['message' => 'Friend request declined.']);
    }

    // DELETE /api/friend-requests/{friendship}
    // Cancel a sent friend request
    public function cancel(Request $request, Friendship $friendship)
    {
        $user = $request->user();

        // Check if the authenticated user is either the sender or recipient
        if ($friendship->sender_id !== $user->id && $friendship->recipient_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        // If the friendship is accepted, allow either user to remove it
        if ($friendship->status === 'accepted') {
            $friendship->delete();
            return response()->json(['message' => 'Friend removed successfully.']);
        }

        // For pending requests, only allow the sender to cancel
        if ($friendship->status === 'pending' && $friendship->sender_id === $user->id) {
            $friendship->delete();
            return response()->json(['message' => 'Friend request cancelled.']);
        }

        return response()->json(['message' => 'This action is not allowed.'], 422);
    }
}

