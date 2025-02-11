<?php

namespace App\Http\Controllers;

use App\Models\Group;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    // GET /api/groups/{group}/messages
    public function index(Group $group)
    {
        $messages = $group->messages()->with('user:id,name,profile_photo')->latest()->paginate(20);
        return response()->json($messages);
    }

    // POST /api/groups/{group}/messages
    public function store(Request $request, Group $group)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $user = $request->user();

        if (!$group->members()->where('user_id', $user->id)->exists()) {
            return response()->json(['message' => 'You are not a member of this group.'], 403);
        }

        $message = $group->messages()->create([
            'user_id' => $user->id,
            'content' => $request->input('content'),
        ]);

        return response()->json($message, 201);
    }

    // PUT /api/groups/{group}/messages/{message}
    public function update(Request $request, Group $group, Message $message)
    {
        // Ensure the message belongs to the group
        if ($message->group_id !== $group->id) {
            return response()->json(['message' => 'This message does not belong to the specified group.'], 403);
        }

        $request->validate([
            'content' => 'required|string',
        ]);

        if ($request->user()->id !== $message->user_id) {
            return response()->json(['message' => 'You can only edit your own messages.'], 403);
        }

        $message->update([
            'content' => $request->content,
            'edited_at' => now(),
        ]);

        return response()->json($message);
    }

    // DELETE /api/groups/{group}/messages/{message}
    public function destroy(Request $request, Group $group, Message $message)
    {
        // Ensure the message belongs to the group
        if ($message->group_id !== $group->id) {
            return response()->json(['message' => 'This message does not belong to the specified group.'], 403);
        }

        if ($request->user()->id !== $message->user_id) {
            return response()->json(['message' => 'You can only delete your own messages.'], 403);
        }

        $message->delete();

        return response()->json(['message' => 'Message deleted.']);
    }

}

