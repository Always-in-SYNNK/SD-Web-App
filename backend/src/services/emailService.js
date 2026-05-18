import nodemailer from "nodemailer";

// Check if email is configured on startup
// console.log('📧 Email Service Loading...');
// console.log('📧 EMAIL_USER configured:', !!process.env.EMAIL_USER);
// console.log('📧 EMAIL_PASS configured:', !!process.env.EMAIL_PASS);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: false,
    logger: false
});

// Verify transporter connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Email transporter verification failed:', error.message);
    } else {
        // console.log('✅ Email transporter ready to send emails');
    }
});

async function sendVerificationEmail(to, verificationToken, name) {
    const backendUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${backendUrl}/verify-email?token=${verificationToken}`;
    
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
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
                    </tr>
                </tr>
            </table>
        </body>
        </html>
    `;
    
    try {
        await transporter.sendMail({
            from: `"SA Learnerships Portal" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: 'Verify Your Email - SA Learnerships Portal',
            html: htmlContent
        });
        // console.log(`✅ Verification email sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        throw error;
    }
}

export async function sendEmailNotification({ to, name, type, title, message, metadata }) {
    // Debug logging
    // console.log(`📧 Attempting to send email to: ${to}`);
    // console.log(`📧 Email subject: ${title}`);
    // console.log(`📧 Email type: ${type}`);
    
    // Check if email is configured
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error('❌ Email not configured. Missing EMAIL_USER or EMAIL_PASS in .env');
        return { success: false, error: 'Email not configured' };
    }
    
    const appName = "GrowthStageSA";
    const backendUrl = process.env.BASE_URL || 'http://localhost:3000';
    
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
    }
    
    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
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
                                    <p style="color: #404850; line-height: 1.6; margin: 15px 0;">Please log in to your GrowthStageSA account to view this opportunity and submit your application.</p>
                                    <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 25px 0;">
                                    <p style="font-size: 12px; color: #94a3b8; text-align: center; margin: 0;">
                                        You're receiving this because you have a student profile on ${appName}.
                                        <br>
                                        <a href="${backendUrl}/settings/notifications" style="color: #035b9d;">Manage preferences</a>
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
    
    try {
        const result = await transporter.sendMail({
            from: `"${appName}" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: title,
            html: htmlContent
        });
        // console.log(`✅ Notification email sent to ${to}: ${title}`);
        // console.log(`📧 Message ID: ${result.messageId}`);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('❌ Failed to send notification email:', error.message);
        // console.error('❌ Error details:', error);
        return { success: false, error: error.message };
    }
}

export default sendVerificationEmail;