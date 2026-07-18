// Pictura AI Email Templates - Clean, Vercel-inspired design
// Brand color: #C87941 (Primary - terracotta orange)

export const emailTemplates = {
  otp: (name: string, otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 32px; height: 32px; background-color: #C87941; border-radius: 6px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                    </td>
                                    <td style="padding-left: 10px;">
                                        <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3;">Verify your email address</h1>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Hi ${name},</p>
                                        
                                        <p style="margin: 0 0 32px 0; font-size: 14px; color: #666; line-height: 1.6;">Enter this verification code to complete your signup:</p>
                                        
                                        <!-- OTP Code -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td style="background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px; padding: 24px; text-align: center;">
                                                    <span style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #000; font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Mono', 'Droid Sans Mono', monospace;">${otp}</span>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 13px; color: #999; line-height: 1.5;">This code expires in 10 minutes.</p>
                                        
                                        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 32px 0;" />
                                        
                                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">If you didn't request this code, you can safely ignore this email. Someone may have entered your email by mistake.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  welcomeCredits: (name: string, credits: number, currency: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Pictura</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 32px; height: 32px; background-color: #C87941; border-radius: 6px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                    </td>
                                    <td style="padding-left: 10px;">
                                        <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3;">Welcome to Pictura</h1>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Hi ${name},</p>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Your developer account is ready. We've added <strong style="color: #000;">${credits} ${currency}</strong> in free credits to help you get started.</p>
                                        
                                        <!-- Credits Box -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td style="background-color: #C87941; border-radius: 6px; padding: 24px; text-align: center;">
                                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 0.5px;">Your Balance</p>
                                                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: #fff;">${credits} ${currency}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Here's what you can do next:</p>
                                        
                                        <!-- Steps -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td style="padding: 16px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px; margin-bottom: 8px;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 24px; height: 24px; background-color: #C87941; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 12px; font-weight: 600; color: #fff;">1</td>
                                                            <td style="padding-left: 12px; font-size: 14px; color: #000;">Create your first API key in the dashboard</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr><td style="height: 8px;"></td></tr>
                                            <tr>
                                                <td style="padding: 16px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 24px; height: 24px; background-color: #C87941; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 12px; font-weight: 600; color: #fff;">2</td>
                                                            <td style="padding-left: 12px; font-size: 14px; color: #000;">Read the API documentation</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr><td style="height: 8px;"></td></tr>
                                            <tr>
                                                <td style="padding: 16px; background-color: #fafafa; border: 1px solid #eaeaea; border-radius: 6px;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 24px; height: 24px; background-color: #C87941; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 12px; font-weight: 600; color: #fff;">3</td>
                                                            <td style="padding-left: 12px; font-size: 14px; color: #000;">Start generating images with your app</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- CTA Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <a href="https://picturaai.sbs/developers/dashboard" style="display: block; background-color: #000; color: #fff; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; text-align: center;">Go to Dashboard</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  lowCreditsAlert: (name: string, creditsRemaining: number, currency: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Low Credits Alert</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 32px; height: 32px; background-color: #C87941; border-radius: 6px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                    </td>
                                    <td style="padding-left: 10px;">
                                        <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3;">Your credits are running low</h1>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Hi ${name},</p>
                                        
                                        <p style="margin: 0 0 32px 0; font-size: 14px; color: #666; line-height: 1.6;">Your Pictura account balance is getting low. Add more credits to continue generating images without interruption.</p>
                                        
                                        <!-- Balance Box -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 24px; text-align: center;">
                                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Remaining Balance</p>
                                                    <p style="margin: 0; font-size: 32px; font-weight: 700; color: #dc2626;">${creditsRemaining} ${currency}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- CTA Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <a href="https://picturaai.sbs/developers/dashboard/billing" style="display: block; background-color: #000; color: #fff; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; text-align: center;">Add Credits</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  invoice: (name: string, invoiceId: string, amount: number, currency: string, items: Array<{description: string, amount: number}>, date: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Invoice ${invoiceId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td>
                                        <table cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="width: 32px; height: 32px; background-color: #C87941; border-radius: 6px; text-align: center; vertical-align: middle;">
                                                    <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                                </td>
                                                <td style="padding-left: 10px;">
                                                    <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                    <td style="text-align: right;">
                                        <span style="font-size: 14px; font-weight: 600; color: #000;">INVOICE</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <!-- Invoice Details -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 32px 0;">
                                            <tr>
                                                <td width="50%">
                                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Billed to</p>
                                                    <p style="margin: 0; font-size: 14px; font-weight: 500; color: #000;">${name}</p>
                                                </td>
                                                <td style="text-align: right;">
                                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #999;">Invoice #${invoiceId}</p>
                                                    <p style="margin: 0; font-size: 12px; color: #999;">${date}</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 0 0 24px 0;" />
                                        
                                        <!-- Items -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                                            <tr>
                                                <td style="padding: 8px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #eaeaea;">Description</td>
                                                <td style="padding: 8px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; border-bottom: 1px solid #eaeaea;">Amount</td>
                                            </tr>
                                            ${items.map(item => `
                                            <tr>
                                                <td style="padding: 16px 0; font-size: 14px; color: #000; border-bottom: 1px solid #eaeaea;">${item.description}</td>
                                                <td style="padding: 16px 0; font-size: 14px; color: #000; text-align: right; border-bottom: 1px solid #eaeaea;">${item.amount} ${currency}</td>
                                            </tr>
                                            `).join('')}
                                        </table>
                                        
                                        <!-- Total -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 16px 0; font-size: 16px; font-weight: 600; color: #000;">Total</td>
                                                <td style="padding: 16px 0; font-size: 16px; font-weight: 600; color: #000; text-align: right;">${amount} ${currency}</td>
                                            </tr>
                                        </table>
                                        
                                        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
                                        
                                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.5;">Thank you for using Pictura AI.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  captchaWelcome: (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to PicturaCAPTCHA</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding: 0 20px 32px 20px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 32px; height: 32px; background-color: #C87941; border-radius: 6px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 18px; font-weight: 600;">P</span>
                                    </td>
                                    <td style="padding-left: 10px;">
                                        <span style="font-size: 20px; font-weight: 600; color: #000;">Pictura</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td style="padding: 0 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 8px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <h1 style="margin: 0 0 24px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3;">Welcome to PicturaCAPTCHA</h1>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Hi ${name},</p>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Your PicturaCAPTCHA account is ready. You can now protect your forms and applications with our AI-powered CAPTCHA solution.</p>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #666; line-height: 1.6;">Get started by adding the CAPTCHA widget to your website. Check out our documentation for integration guides.</p>
                                        
                                        <!-- CTA Button -->
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td>
                                                    <a href="https://picturaai.sbs/captcha/docs" style="display: block; background-color: #000; color: #fff; padding: 14px 24px; border-radius: 6px; text-decoration: none; font-weight: 500; font-size: 14px; text-align: center;">View Documentation</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 20px; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  jobApplicationAdmin: (data: {
    jobTitle: string
    department: string
    fullName: string
    email: string
    phone: string
    location: string
    linkedin: string
    portfolio: string
    experience: string
    startDate: string
    coverLetter: string
    heardFrom: string
    resumeUrl: string
    portfolioUrl: string
    applicationDate: string
  }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Job Application</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" style="max-width: 640px;" cellpadding="0" cellspacing="0">
                    <!-- Logo Header -->
                    <tr>
                        <td style="padding-bottom: 32px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 40px; height: 40px; background: linear-gradient(135deg, #C87941 0%, #A85D2E 100%); border-radius: 10px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 16px; font-weight: 700;">P</span>
                                    </td>
                                    <td style="padding-left: 12px;">
                                        <span style="font-size: 22px; font-weight: 700; color: #000;">Pictura</span>
                                        <span style="font-size: 22px; font-weight: 300; color: #666;"> Careers</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #e5e5e5; border-radius: 12px; overflow: hidden;">
                                <!-- Header Banner -->
                                <tr>
                                    <td style="background: linear-gradient(135deg, #C87941 0%, #A85D2E 100%); padding: 24px 32px;">
                                        <p style="margin: 0 0 4px 0; font-size: 12px; color: rgba(255,255,255,0.8); text-transform: uppercase; letter-spacing: 1px;">New Application</p>
                                        <h1 style="margin: 0; font-size: 24px; font-weight: 700; color: #fff;">${data.jobTitle}</h1>
                                        <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.9);">${data.department} Team</p>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="padding: 32px;">
                                        <!-- Applicant Info -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                            <tr>
                                                <td style="padding: 20px; background-color: #f9f9f9; border-radius: 8px;">
                                                    <table width="100%" cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="vertical-align: top; width: 56px;">
                                                                <div style="width: 48px; height: 48px; background: linear-gradient(135deg, #C87941 0%, #A85D2E 100%); border-radius: 50%; text-align: center; line-height: 48px; font-size: 20px; font-weight: 600; color: #fff;">
                                                                    ${data.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                                </div>
                                                            </td>
                                                            <td style="vertical-align: top; padding-left: 12px;">
                                                                <p style="margin: 0 0 4px 0; font-size: 18px; font-weight: 600; color: #000;">${data.fullName}</p>
                                                                <p style="margin: 0; font-size: 14px; color: #666;">${data.location}</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <!-- Contact Details -->
                                        <h2 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">Contact Information</h2>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                                    <span style="display: inline-block; width: 100px; font-size: 13px; color: #666;">Email</span>
                                                    <a href="mailto:${data.email}" style="font-size: 14px; color: #C87941; text-decoration: none; font-weight: 500;">${data.email}</a>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                                    <span style="display: inline-block; width: 100px; font-size: 13px; color: #666;">Phone</span>
                                                    <a href="tel:${data.phone}" style="font-size: 14px; color: #000; text-decoration: none;">${data.phone}</a>
                                                </td>
                                            </tr>
                                            ${data.linkedin ? `
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                                    <span style="display: inline-block; width: 100px; font-size: 13px; color: #666;">LinkedIn</span>
                                                    <a href="${data.linkedin.startsWith('http') ? data.linkedin : 'https://' + data.linkedin}" style="font-size: 14px; color: #0077b5; text-decoration: none;">${data.linkedin}</a>
                                                </td>
                                            </tr>
                                            ` : ''}
                                            ${data.portfolio ? `
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                                    <span style="display: inline-block; width: 100px; font-size: 13px; color: #666;">Portfolio</span>
                                                    <a href="${data.portfolio.startsWith('http') ? data.portfolio : 'https://' + data.portfolio}" style="font-size: 14px; color: #C87941; text-decoration: none;">${data.portfolio}</a>
                                                </td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                        
                                        <!-- Experience & Details -->
                                        <h2 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">Application Details</h2>
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                                    <span style="display: inline-block; width: 140px; font-size: 13px; color: #666;">Experience</span>
                                                    <span style="font-size: 14px; color: #000; font-weight: 500;">${data.experience} years</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                                    <span style="display: inline-block; width: 140px; font-size: 13px; color: #666;">Earliest Start</span>
                                                    <span style="font-size: 14px; color: #000;">${data.startDate}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0; border-bottom: 1px solid #eee;">
                                                    <span style="display: inline-block; width: 140px; font-size: 13px; color: #666;">Source</span>
                                                    <span style="font-size: 14px; color: #000;">${data.heardFrom}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 12px 0;">
                                                    <span style="display: inline-block; width: 140px; font-size: 13px; color: #666;">Applied</span>
                                                    <span style="font-size: 14px; color: #000;">${data.applicationDate}</span>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        ${data.coverLetter ? `
                                        <!-- Cover Letter -->
                                        <h2 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">Cover Letter</h2>
                                        <div style="padding: 16px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 24px; border-left: 3px solid #C87941;">
                                            <p style="margin: 0; font-size: 14px; color: #333; line-height: 1.7; white-space: pre-wrap;">${data.coverLetter}</p>
                                        </div>
                                        ` : ''}
                                        
                                        <!-- Documents -->
                                        <h2 style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: #000; text-transform: uppercase; letter-spacing: 0.5px;">Documents</h2>
                                        <table width="100%" cellpadding="0" cellspacing="0">
                                            <tr>
                                                <td style="padding: 16px; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; margin-bottom: 12px;">
                                                    <table cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td style="vertical-align: middle;">
                                                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #166534;">Resume / CV</p>
                                                                <p style="margin: 0; font-size: 12px; color: #15803d;">PDF Document</p>
                                                            </td>
                                                            <td style="text-align: right; vertical-align: middle;">
                                                                <a href="${data.resumeUrl}" style="display: inline-block; padding: 10px 20px; background-color: #166534; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500;">Download</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            ${data.portfolioUrl ? `
                                            <tr><td style="height: 12px;"></td></tr>
                                            <tr>
                                                <td style="padding: 16px; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 8px;">
                                                    <table cellpadding="0" cellspacing="0" width="100%">
                                                        <tr>
                                                            <td style="vertical-align: middle;">
                                                                <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #92400e;">Portfolio / Work Samples</p>
                                                                <p style="margin: 0; font-size: 12px; color: #b45309;">Uploaded File</p>
                                                            </td>
                                                            <td style="text-align: right; vertical-align: middle;">
                                                                <a href="${data.portfolioUrl}" style="display: inline-block; padding: 10px 20px; background-color: #92400e; color: #fff; text-decoration: none; border-radius: 6px; font-size: 13px; font-weight: 500;">Download</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            ` : ''}
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 0; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI Careers</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs/careers" style="color: #666; text-decoration: none;">picturaai.sbs/careers</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,

  jobApplicationConfirmation: (data: {
    firstName: string
    jobTitle: string
    department: string
  }) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Application Received</title>
</head>
<body style="margin: 0; padding: 0; background-color: #fafafa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fafafa; min-height: 100vh;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table width="100%" style="max-width: 600px;" cellpadding="0" cellspacing="0">
                    <!-- Logo -->
                    <tr>
                        <td style="padding-bottom: 32px;">
                            <table cellpadding="0" cellspacing="0">
                                <tr>
                                    <td style="width: 40px; height: 40px; background: linear-gradient(135deg, #C87941 0%, #A85D2E 100%); border-radius: 10px; text-align: center; vertical-align: middle;">
                                        <span style="color: white; font-size: 16px; font-weight: 700;">P</span>
                                    </td>
                                    <td style="padding-left: 12px;">
                                        <span style="font-size: 22px; font-weight: 700; color: #000;">Pictura</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Main Card -->
                    <tr>
                        <td>
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #fff; border: 1px solid #eaeaea; border-radius: 12px;">
                                <tr>
                                    <td style="padding: 40px;">
                                        <!-- Success Icon -->
                                        <div style="width: 64px; height: 64px; margin: 0 auto 24px auto; background: linear-gradient(135deg, #C87941 0%, #A85D2E 100%); border-radius: 50%; text-align: center; line-height: 64px;">
                                            <span style="font-size: 28px; color: #fff;">✓</span>
                                        </div>
                                        
                                        <h1 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #000; line-height: 1.3; text-align: center;">Application Received</h1>
                                        
                                        <p style="margin: 0 0 24px 0; font-size: 15px; color: #666; line-height: 1.6; text-align: center;">
                                            Hi ${data.firstName}, thank you for your interest in joining Pictura!
                                        </p>
                                        
                                        <!-- Position Card -->
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                                            <tr>
                                                <td style="padding: 20px; background-color: #f9f9f9; border: 1px solid #eaeaea; border-radius: 8px; text-align: center;">
                                                    <p style="margin: 0 0 4px 0; font-size: 12px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Applied Position</p>
                                                    <p style="margin: 0; font-size: 18px; font-weight: 600; color: #000;">${data.jobTitle}</p>
                                                    <p style="margin: 4px 0 0 0; font-size: 14px; color: #666;">${data.department} Team</p>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <h2 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #000;">What happens next?</h2>
                                        
                                        <table width="100%" cellpadding="0" cellspacing="0" style="margin: 0 0 24px 0;">
                                            <tr>
                                                <td style="padding: 16px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 8px;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 28px; height: 28px; background-color: #C87941; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 13px; font-weight: 600; color: #fff;">1</td>
                                                            <td style="padding-left: 14px;">
                                                                <p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">Application Review</p>
                                                                <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Our team will carefully review your application</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr><td style="height: 8px;"></td></tr>
                                            <tr>
                                                <td style="padding: 16px; background-color: #f9f9f9; border-radius: 8px; margin-bottom: 8px;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 28px; height: 28px; background-color: #C87941; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 13px; font-weight: 600; color: #fff;">2</td>
                                                            <td style="padding-left: 14px;">
                                                                <p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">Initial Contact</p>
                                                                <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">If there is a match, we will reach out within 5-7 business days</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr><td style="height: 8px;"></td></tr>
                                            <tr>
                                                <td style="padding: 16px; background-color: #f9f9f9; border-radius: 8px;">
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td style="width: 28px; height: 28px; background-color: #C87941; border-radius: 50%; text-align: center; vertical-align: middle; font-size: 13px; font-weight: 600; color: #fff;">3</td>
                                                            <td style="padding-left: 14px;">
                                                                <p style="margin: 0; font-size: 14px; color: #000; font-weight: 500;">Interview Process</p>
                                                                <p style="margin: 4px 0 0 0; font-size: 13px; color: #666;">Meet the team and learn more about the role</p>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                        
                                        <hr style="border: none; border-top: 1px solid #eaeaea; margin: 24px 0;" />
                                        
                                        <p style="margin: 0; font-size: 13px; color: #999; line-height: 1.6; text-align: center;">
                                            In the meantime, follow us on <a href="https://twitter.com/picturaai" style="color: #C87941; text-decoration: none;">Twitter</a> to stay updated on what we are building. We appreciate your patience and look forward to potentially working together!
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 32px 0; text-align: center;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #999;">Pictura AI by Imoogle Labs</p>
                            <p style="margin: 0; font-size: 12px; color: #999;">
                                <a href="https://picturaai.sbs" style="color: #666; text-decoration: none;">picturaai.sbs</a>
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
  `,
}
