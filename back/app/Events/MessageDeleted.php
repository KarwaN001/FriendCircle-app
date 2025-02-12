<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageDeleted implements ShouldBroadcast
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
            new Channel('group.'.$this->groupId)
        ];
    }

    public function broadcastAs(): string
    {
        return 'message.deleted';
    }
}
