<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Group extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'group_photo', 'group_admin'];

    protected $appends = ['members_count'];

    protected $hidden = ['pivot'];

    // Relationships
    public function groupAdmin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'group_admin');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'user_groups', 'group_id', 'user_id')
            ->withTimestamps();
    }

    // Accessors
    public function getMembersCountAttribute(): int
    {
        return $this->members()->count();
    }
}
