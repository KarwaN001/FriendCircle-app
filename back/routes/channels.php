<?php

use App\Models\Group;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('group.{groupId}', function ($user, $groupId) {
    \Log::info('Checking if user is a member of group ' . $groupId);
    $group = Group::find($groupId);
    return $group && $group->members()->where('user_id', $user->id)->exists();
});
