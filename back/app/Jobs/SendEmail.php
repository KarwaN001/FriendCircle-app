<?php

namespace App\Jobs;

use App\Models\Otp;
use App\Notifications\OtpNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SendEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public Otp $otp)
    {
        //
    }

    public function handle(): void
    {
        $this->otp->otpable->notify(new OtpNotification($this->otp->code));
    }
}
