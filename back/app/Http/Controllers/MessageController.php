<?php

namespace App\Http\Controllers;

use App\Events\MessageDeleted;
use App\Events\MessageSent;
use App\Events\MessageUpdated;
use App\Models\Group;
use App\Models\Message;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    public function index(Group $group)
    {
        $messages = $group->messages()->with('user:id,name,profile_photo')->latest()->paginate(20);
        return response()->json($messages);
    }

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

        // Load the user relationship for broadcasting
        $message->load('user:id,name,profile_photo');

        // Broadcast the new message
        broadcast(new MessageSent($message))->toOthers();

        return response()->json($message, 201);
    }

    public function update(Request $request, Group $group, Message $message)
    {
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
            'content' => $request->input('content'),
            'edited_at' => now(),
        ]);

        // Load the user relationship for broadcasting
        $message->load('user:id,name,profile_photo');

        // Broadcast the message update
        MessageUpdated::dispatch($message);

        return response()->json($message);
    }

    public function destroy(Request $request, Group $group, Message $message)
    {
        if ($message->group_id !== $group->id) {
            return response()->json(['message' => 'This message does not belong to the specified group.'], 403);
        }

        if ($request->user()->id !== $message->user_id) {
            return response()->json(['message' => 'You can only delete your own messages.'], 403);
        }

        $messageId = $message->id;
        $groupId = $message->group_id;

        $message->delete();

        // Broadcast the message deletion
        MessageDeleted::dispatch($messageId, $groupId);

        return response()->json(['message' => 'Message deleted.']);
    }
}
