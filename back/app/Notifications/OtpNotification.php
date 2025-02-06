<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpNotification extends Notification
{
    use Queueable;

    protected string $isEmailVerification;

    public function __construct(public string $otp)
    {
        $this->isEmailVerification = request()->routeIs('verification.verify');
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(config('app.name').' - Your OTP Code')
            ->markdown('mail.otp-notification', [
                'otp' => $this->otp,
                'isEmailVerification' => $this->isEmailVerification,
                'appName' => config('app.name')
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
