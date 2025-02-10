<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Exception;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use RuntimeException;

class User extends Authenticatable implements MustVerifyEmail
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $guarded = [
        'id',
        'email_verified_at',
        'created_at',
        'updated_at',
        'remember_token',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'pivot',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    // Relationships
    public function adminGroups(): HasMany
    {
        return $this->hasMany(Group::class, 'group_admin');
    }

    public function groups(): BelongsToMany
    {
        return $this->belongsToMany(Group::class, 'user_groups', 'user_id', 'group_id')
            ->withTimestamps();
    }

    public function otps(): morphMany
    {
        return $this->morphMany(Otp::class, 'otpable');
    }

    public function friends()
    {
        return User::select('users.*')
            ->join('friendships as f', function($join) {
                $join->on('users.id', '=', 'f.recipient_id')
                    ->where('f.sender_id', $this->id)
                    ->where('f.status', 'accepted')
                    ->orOn('users.id', '=', 'f.sender_id')
                    ->where('f.recipient_id', $this->id)
                    ->where('f.status', 'accepted');
            })
            ->where('users.id', '!=', $this->id)
            ->distinct();
    }

    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'recipient_id');
    }

    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'sender_id');
    }

    // Helper methods
    public function generateNewOtp()
    {
        $this->otps()->delete();

        try {
            $otp = $this->otps()->create([
                'code' => str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT),
                'expires_at' => now()->addMinutes(10)
            ]);
        } catch (Exception $e) {
            throw new RuntimeException($e->getMessage());
        }

        return $otp;
    }

    public function isFriendWith(User $user)
    {
        return $this->friends()->where('users.id', $user->id)->exists();
    }
}
