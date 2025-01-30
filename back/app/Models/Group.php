<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    protected $fillable = ['name', 'group_photo', 'no_members', 'group_admin'];

    public function groupAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'group_admin');
    }

    public function members(): HasMany
    {
        return $this->hasMany(UserGroup::class, 'group_id');
    }
}
