<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OtpNotification extends Notification
{
    use Queueable;

    protected bool $isEmailVerification;

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
        $subject = $this->isEmailVerification
            ? 'Verify Your Email Address'
            : 'Reset Your Password';

        $greeting = $this->isEmailVerification
            ? 'Hello! Welcome to '.config('app.name')
            : 'Hello! Need to reset your password?';

        $mainMessage = $this->isEmailVerification
            ? "Thanks for signing up! Please verify your email address to get started."
            : "We received a request to reset your password.";

        return (new MailMessage)
            ->subject(config('app.name').' - '.$subject)
            ->view('mail.otp', [
                'otp' => $this->otp,
                'greeting' => $greeting,
                'mainMessage' => $mainMessage,
                'isEmailVerification' => $this->isEmailVerification,
                'appName' => config('app.name'),
                'validityPeriod' => '10 minutes'
            ]);
    }

    public function toArray(object $notifiable): array
    {
        return [];
    }
}
