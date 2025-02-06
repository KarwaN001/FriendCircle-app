<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserGroup extends Model
{
    protected $fillable = ['user_id', 'group_id'];

    // Relationships
    public function group(): BelongsTo
    {
        return $this->belongsTo(Group::class, 'group_id');
    }
}
