<?php

namespace App\Models;

    use Illuminate\Database\Eloquent\Model;
    use Illuminate\Database\Eloquent\Relations\BelongsTo;

    class Group extends Model {
        public function groupAdmin(): BelongsTo
        {
        return $this->belongsTo(User::class, 'group_admin');
        }
    }
