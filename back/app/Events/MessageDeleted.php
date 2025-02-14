<?php

namespace App\Events;

use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDeleted implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public int $messageId,
        public int $groupId
    ) {
    }

    public function broadcastOn(): array
    {
        return [
            new PresenceChannel('group.'.$this->groupId)
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.deleted';
    }
}
