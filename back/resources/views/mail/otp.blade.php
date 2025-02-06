<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f8fafc;
            color: #1a202c;
            line-height: 1.6;
            margin: 0;
            padding: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }

        .email-wrapper {
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 30px;
            margin: 20px 0;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo {
            max-height: 50px;
            margin-bottom: 20px;
        }

        .greeting {
            font-size: 24px;
            font-weight: bold;
            color: #2d3748;
            margin-bottom: 20px;
        }

        .content {
            margin-bottom: 30px;
        }

        .otp-code {
            background-color: #edf2f7;
            border-radius: 6px;
            padding: 20px;
            text-align: center;
            font-size: 32px;
            font-weight: bold;
            letter-spacing: 8px;
            margin: 20px 0;
            color: #2d3748;
        }

        .warning {
            font-size: 14px;
            color: #718096;
            margin-top: 20px;
        }

        .footer {
            text-align: center;
            font-size: 14px;
            color: #718096;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
        }

        .button {
            display: inline-block;
            background-color: #4f46e5;
            color: #ffffff;
            padding: 12px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: bold;
            margin: 20px 0;
        }
    </style>
    <title></title>
</head>
<body>
<div class="container">
    <div class="email-wrapper">
        <div class="header">
            @if($logo ?? false)
                <img src="{{ $logo }}" alt="{{ $appName }}" class="logo">
            @else
                <h1>{{ $appName }}</h1>
            @endif
        </div>

        <div class="greeting">
            {{ $greeting }}
        </div>

        <div class="content">
            <p>{{ $mainMessage }}</p>

            <div class="otp-code">
                {{ $otp }}
            </div>

            <p>This verification code will expire in {{ $validityPeriod }}.</p>

            @if($isEmailVerification)
                <p>By verifying your email, you'll be able to:</p>
                <ul>
                    <li>Access all features of your account</li>
                    <li>Receive important notifications</li>
                    <li>Keep your account secure</li>
                </ul>
            @else
                <p>For your security:</p>
                <ul>
                    <li>This code can only be used once</li>
                    <li>Never share this code with anyone</li>
                    <li>Our team will never ask for this code</li>
                </ul>
            @endif

            <p class="warning">
                If you didn't request this code, please ignore this email or contact support if you have concerns.
            </p>
        </div>

        <div class="footer">
            <p>&copy; {{ date('Y') }} {{ $appName }}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
        </div>
    </div>
</div>
</body>
</html>
