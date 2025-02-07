<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background-color: #f4f7fa;
            color: #2d3748;
            line-height: 1.8;
            margin: 0;
            padding: 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        .email-wrapper {
            background-color: #ffffff;
            border-radius: 16px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
            padding: 40px;
            margin: 20px 0;
            border: 1px solid #e2e8f0;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 30px;
            border-bottom: 2px solid #f7fafc;
        }
        .logo {
            max-height: 60px;
            margin-bottom: 20px;
        }
        .greeting {
            font-size: 28px;
            font-weight: 700;
            color: #1a202c;
            margin-bottom: 24px;
            letter-spacing: -0.5px;
        }
        .content {
            margin-bottom: 35px;
        }
        .content p {
            margin-bottom: 16px;
            font-size: 16px;
        }
        .otp-code {
            background: linear-gradient(145deg, #f7fafc 0%, #edf2f7 100%);
            border-radius: 12px;
            padding: 25px;
            text-align: center;
            font-size: 36px;
            font-weight: 700;
            letter-spacing: 12px;
            margin: 30px 0;
            color: #2d3748;
            border: 2px solid #edf2f7;
        }
        .warning {
            font-size: 14px;
            color: #718096;
            margin-top: 24px;
            padding: 16px;
            background-color: #fff5f5;
            border-radius: 8px;
            border-left: 4px solid #fc8181;
        }
        .footer {
            text-align: center;
            font-size: 14px;
            color: #718096;
            margin-top: 40px;
            padding-top: 24px;
            border-top: 2px solid #f7fafc;
        }
        ul {
            padding-left: 24px;
            margin: 20px 0;
        }
        li {
            margin-bottom: 12px;
            color: #4a5568;
        }
        .validity-period {
            display: inline-block;
            background-color: #ebf4ff;
            color: #4299e1;
            padding: 8px 16px;
            border-radius: 6px;
            font-weight: 600;
            margin: 8px 0;
        }
        .security-list {
            background-color: #f7fafc;
            padding: 20px 40px;
            border-radius: 8px;
            margin: 24px 0;
        }
        .security-list li {
            position: relative;
        }
        .security-list li::before {
            content: "•";
            color: #4299e1;
            font-weight: bold;
            position: absolute;
            left: -20px;
        }
        @media only screen and (max-width: 600px) {
            .container {
                padding: 20px 10px;
            }
            .email-wrapper {
                padding: 30px 20px;
            }
            .otp-code {
                font-size: 32px;
                letter-spacing: 8px;
                padding: 20px;
            }
        }
    </style>
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

            <p>This verification code will expire in <span class="validity-period">{{ $validityPeriod }}</span></p>

            @if($isEmailVerification)
                <p>By verifying your email, you'll be able to:</p>
                <div class="security-list">
                    <ul>
                        <li>Access all features of your account</li>
                        <li>Receive important notifications</li>
                        <li>Keep your account secure</li>
                    </ul>
                </div>
            @else
                <p>For your security:</p>
                <div class="security-list">
                    <ul>
                        <li>This code can only be used once</li>
                        <li>Never share this code with anyone</li>
                        <li>Our team will never ask for this code</li>
                    </ul>
                </div>
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
