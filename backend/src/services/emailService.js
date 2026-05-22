// backend/src/services/emailService.js
import nodemailer from "nodemailer";

let transporter = null;
let initializationError = null;

// Initialize email transporter with better error handling
function initializeTransporter() {
    if (transporter) {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            initializationError = 'Email credentials missing';
            console.error('❌ Email credentials missing!');
            transporter = null;
            return null;
        }
        return transporter;
    }

    console.log('📧 Email Service Initializing...');
    console.log('📧 EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Missing');
    console.log('📧 EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Missing');
    console.log('📧 NODE_ENV:', process.env.NODE_ENV || 'development');

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        initializationError = 'Email credentials missing';
        console.error('❌ Email credentials missing!');
        return null;
    }

    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            // Better production settings
            pool: true,
            maxConnections: 5,
            maxMessages: 100,
            rateLimit: 5,
            secure: true,
            debug: process.env.NODE_ENV === 'development',
            logger: process.env.NODE_ENV === 'development'
        });

        // Verify connection asynchronously
        transporter.verify((error, success) => {
            if (error) {
                console.error('❌ Email verification failed:', error.message);
                initializationError = error.message;
                transporter = null;
            } else {
                console.log('✅ Email transporter ready');
                initializationError = null;
            }
        });

        return transporter;
    } catch (error) {
        console.error('❌ Failed to create transporter:', error.message);
        initializationError = error.message;
        return null;
    }
}

export function resetTransporter() {
    transporter = null;
    initializationError = null;
}

// Helper to check if email is configured
export function isEmailConfigured() {
    return !!process.env.EMAIL_USER && !!process.env.EMAIL_PASS;
}

async function sendVerificationEmail(to, verificationToken, name) {
    const transporter = initializeTransporter();

    if (!transporter) {
        console.error('❌ Cannot send email:', initializationError || 'Transporter not initialized');
        return { success: false, error: initializationError || 'Email service not configured' };
    }

    // Use environment URLs with fallbacks
    const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:5173';
    const verificationLink = `${frontendUrl}/verify-email?token=${verificationToken}`;
    
    console.log(`📧 Sending verification email to: ${to}`);
    console.log(`🔗 Verification link generated for ${to} (token length: ${verificationToken?.length || 0})`);

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verify Your Email</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f4f4; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="600" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <tr>
                                <td style="background: linear-gradient(135deg, #4F46E5, #002356); padding: 40px 30px; text-align: center;">
                                    <h1 style="color: white; margin: 0; font-size: 28px;">SA Learnerships Portal</h1>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 35px;">
                                    <p style="font-size: 18px; color: #1b1c1c; margin-bottom: 15px;">Hello ${name || 'there'},</p>
                                    <p style="color: #404850; line-height: 1.6; margin: 15px 0;">Please verify your email address by clicking the link below:</p>
                                    <p style="text-align: center; margin: 25px 0;">
                                        <a href="${verificationLink}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Verify Email</a>
                                    </p>
                                    <p style="color: #404850; line-height: 1.6; margin: 15px 0;">Or copy this link: <a href="${verificationLink}" style="color: #4F46E5;">${verificationLink}</a></p>
                                    <p style="color: #666; font-size: 12px;">This link expires in 24 hours.</p>
                                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                                    <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    // Retry logic (3 attempts)
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const result = await transporter.sendMail({
                from: `"SA Learnerships Portal" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: 'Verify Your Email - SA Learnerships Portal',
                html: htmlContent
            });

            console.log(`✅ Verification email sent to ${to} (attempt ${attempt})`);
            console.log(`📧 Message ID: ${result.messageId}`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            lastError = error;
            console.error(`❌ Attempt ${attempt} failed:`, error.message);

            if (attempt < 3) {
                // Wait 2 seconds before retry
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    console.error('❌ All attempts failed for verification email');
    throw lastError;
}

export async function sendEmailNotification({ to, name, type, title, message, metadata }) {
    const transporter = initializeTransporter();

    if (!transporter) {
        console.error('❌ Cannot send notification:', initializationError || 'Transporter not initialized');
        return { success: false, error: initializationError || 'Email service not configured' };
    }

    const appName = "GrowthStageSA";
    const frontendUrl = process.env.FRONTEND_URL || process.env.BASE_URL || 'http://localhost:5173';

    // Different styling based on notification type
    let headerColor = '#035b9d';
    let emoji = '';

    if (type === 'new_opportunity') {
        headerColor = '#10b981';
        emoji = '🎉';
    } else if (type === '7_day_reminder') {
        headerColor = '#f59e0b';
        emoji = '⏰';
    } else if (type === '24_hour_reminder') {
        headerColor = '#ef4444';
        emoji = '⚠️';
    } else if (type === 'matching_opportunity') {
        headerColor = '#8b5cf6';
        emoji = '🎯';
    }

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${title} | ${appName}</title>
        </head>
        <body style="font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 0; background-color: #f0eeea;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f0eeea; padding: 20px;">
                <tr>
                    <td align="center">
                        <table width="580" cellpadding="0" cellspacing="0" style="background-color: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 35px -10px rgba(0,0,0,0.1);">
                            <tr>
                                <td style="background: linear-gradient(135deg, ${headerColor}, #002356); padding: 40px 30px; text-align: center;">
                                    ${emoji ? `<p style="font-size: 48px; margin: 0 0 10px 0;">${emoji}</p>` : ''}
                                    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 700;">${title}</h1>
                                    <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">${appName}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 35px;">
                                    <h2 style="color: #1b1c1c; margin-top: 0; font-size: 20px;">Hello ${name || 'there'},</h2>
                                    <p style="color: #404850; line-height: 1.6; margin: 15px 0; font-size: 16px;">${message}</p>
                                    <p style="color: #404850; line-height: 1.6; margin: 15px 0;">Please log in to your ${appName} account to view this opportunity and submit your application.</p>
                                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                                    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                                        You're receiving this because you have a student profile on ${appName}.
                                        <br>
                                        <a href="${frontendUrl}/settings/notifications" style="color: #035b9d;">Manage preferences</a>
                                    </p>
                                </td>
                            </tr>
                            <tr>
                                <td style="background: #f8fafc; padding: 20px 35px; text-align: center;">
                                    <p style="margin: 0; font-size: 12px; color: #94a3b8;">${appName} | Building Futures in South Africa</p>
                                    <p style="margin: 5px 0 0 0; font-size: 11px; color: #94a3b8;">Visit: www.growthstage.co.za</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>
    `;

    // Retry logic (3 attempts)
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            const result = await transporter.sendMail({
                from: `"${appName}" <${process.env.EMAIL_USER}>`,
                to: to,
                subject: title,
                html: htmlContent
            });

            console.log(`✅ Notification email sent to ${to}: ${title} (attempt ${attempt})`);
            return { success: true, messageId: result.messageId };
        } catch (error) {
            lastError = error;
            console.error(`❌ Attempt ${attempt} failed for ${to}:`, error.message);

            if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }

    console.error(`❌ All attempts failed for notification to ${to}`);
    return { success: false, error: lastError.message };
}

export default sendVerificationEmail;