@component('mail::layout')
    @slot('header')
        @component('mail::header', ['url' => config('app.url')])
            {{ $appName }}
        @endcomponent
    @endslot

    @component('mail::panel')
        Your Security Code
    @endcomponent

    <div style="text-align: center; margin: 32px 0;">
        <div style="font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #2563eb; margin: 20px 0;">
            {{ $otp }}
        </div>
        <p style="color: #6b7280; font-size: 14px;">
            This code will expire in 10 minutes
        </p>
    </div>

    <p style="color: #374151;">
        @if($isEmailVerification)
            Please use this code to verify your email address.
        @else
            Please use this code to reset your password.
        @endif
    </p>

    <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
        If you didn't request this, you can safely ignore this email. No changes will be made to your account.
    </p>

    @slot('footer')
        @component('mail::footer')
            © {{ date('Y') }} {{ $appName }}. All rights reserved.<br>
            Need help? Contact our support team at {{ config('mail.support_email') }}
        @endcomponent
    @endslot
@endcomponent
