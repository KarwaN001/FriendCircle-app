<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\MorphMany;
use Illuminate\Notifications\Notifiable;
use Exception;
use RuntimeException;

class PendingUser extends Model
{
    use Notifiable;

    protected $fillable = ['user_data', 'email', 'expires_at'];

    protected $casts = ['user_data' => 'array'];

    // Helper methods
    public function generateNewOtp()
    {
        $this->otps()->delete();

        try {
            // OTP code expires in one minute
            $otp = $this->otps()->create([
                'code' => str_pad(random_int(0, 999999), 6, '0', STR_PAD_LEFT),
                'expires_at' => now()->addMinutes(10)
            ]);
        } catch (Exception $e) {
            throw new RuntimeException($e->getMessage());
        }

        return $otp;
    }

    // Relationships
    public function otps(): morphMany
    {
        return $this->morphMany(Otp::class, 'otpable');
    }
}
