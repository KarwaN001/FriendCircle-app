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
    ];

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

    public function otps(): morphMany
    {
        return $this->morphMany(Otp::class, 'otpable');
    }

    public function friends(): HasMany
    {
        return $this->hasMany(Friendship::class, 'sender_id')
            ->where('status', 'accepted')
            ->with('recipient')
            ->orWhere(function ($query) {
                $query->where('recipient_id', $this->id)
                    ->where('status', 'accepted')
                    ->with('sender');
            });
    }

    public function sentFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'sender_id');
    }

    public function receivedFriendRequests(): HasMany
    {
        return $this->hasMany(Friendship::class, 'recipient_id');
    }

    // Helper methods

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

    public function friendIds(): array
    {
        return $this->sentFriendRequests()
            ->where('status', 'accepted')
            ->pluck('recipient_id')
            ->orWhere(function ($query) {
                $query->where('recipient_id', $this->id)
                    ->where('status', 'accepted')
                    ->pluck('sender_id');
            });
    }
}
