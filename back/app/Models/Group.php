<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'group_photo', 'group_admin'];

    protected $appends = ['members_count'];

    public function groupAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'group_admin');
    }

    public function members(): HasMany
    {
        return $this->hasMany(UserGroup::class, 'group_id');
    }

    // Helper methods
    public function getMembersCountAttribute(): int
    {
        return $this->members()->count();
    }
}
