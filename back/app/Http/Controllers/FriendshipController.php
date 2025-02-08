<?php

namespace App\Http\Controllers;

use App\Models\Friendship;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class FriendshipController extends Controller
{
    // GET /api/friend-suggestions
    public function suggestions(Request $request)
    {
        $user = $request->user();

        $suggestions = User::whereNotIn('users.id', function($query) use ($user) {
            $query->select('users.id')
                ->from('users')
                ->join('friendships', function($join) use ($user) {
                    $join->on('users.id', '=', 'friendships.recipient_id')
                        ->where('friendships.sender_id', $user->id)
                        ->where('friendships.status', 'accepted')
                        ->orWhere(function($query) use ($user) {
                            $query->where('friendships.recipient_id', $user->id)
                                ->where('friendships.status', 'accepted');
                        });
                })
                ->union(User::select('users.id')->where('users.id', $user->id));
        })->paginate(10);

        return response()->json($suggestions);
    }

    // GET /api/friend-requests
    public function index(Request $request)
    {
        $user = $request->user();

        $incoming = $user->receivedFriendRequests()->where('status', 'pending')->with('sender')->paginate(5);

        $outgoing = $user->sentFriendRequests()->where('status', 'pending')->with('recipient')->paginate(5);

        return response()->json([
            'incoming' => $incoming,
            'outgoing' => $outgoing
        ]);
    }

    // POST /api/friend-requests
    // Send a friend request
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
        ]);

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

        $friendship->status = 'declined';
        $friendship->save();

        return response()->json($friendship);
    }

    // DELETE /api/friend-requests/{friendship}
    // Cancel a sent friend request
    public function cancel(Request $request, Friendship $friendship)
    {
        $user = $request->user();

        // Ensure the authenticated user is the sender
        if ($friendship->sender_id !== $user->id) {
            return response()->json(['message' => 'Unauthorized action.'], 403);
        }

        // Allow cancellation only if still pending
        if ($friendship->status !== 'pending') {
            return response()->json(['message' => 'Friend request cannot be cancelled.'], 422);
        }

        $friendship->delete();

        return response()->json(['message' => 'Friend request cancelled.']);
    }
}

