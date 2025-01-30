<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\Pivot;

class UserGroup extends Pivot
{
    protected $fillable = ['user_id', 'group_id'];

    public static function boot(): void
    {
        parent::boot();

        // Increment `no_members` when a user joins a group
        static::created(function ($userGroup) {
            $userGroup->group->increment('no_members');
        });

        // Decrement `no_members` when a user leaves a group
        static::deleted(function ($userGroup) {
            $userGroup->group->decrement('no_members');
        });
    }

    // Relationships
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'group_id');
    }
}
