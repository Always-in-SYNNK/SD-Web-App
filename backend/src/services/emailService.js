import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

async function sendVerificationEmail(to, verificationToken, name) {
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/verify-email?token=${verificationToken}`;
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Verify Your Email</title>
        </head>
        <body style="font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                <h1 style="color: #4F46E5;">SA Learnerships Portal</h1>
                <p>Hello ${name || 'there'},</p>
                <p>Please verify your email address by clicking the link below:</p>
                <a href="${verificationLink}" style="background: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                <p>Or copy this link: ${verificationLink}</p>
                <p>This link expires in 24 hours.</p>
                <hr>
                <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply.</p>
            </div>
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
        console.log(`✅ Verification email sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send email:', error.message);
        throw error;
    }
}

export async function sendEmailNotification({ to, name, type, title, message, metadata }) {
    const appName = "GrowthStageSA";
    
    const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>${title} | ${appName}</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                .header { background: #035b9d; padding: 30px; text-align: center; color: white; }
                .header h1 { margin: 0; font-size: 24px; }
                .content { padding: 30px; }
                .content h2 { margin-top: 0; color: #1b1c1c; }
                .content p { color: #404850; line-height: 1.6; margin: 15px 0; }
                .button { background: #035b9d; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-top: 20px; }
                .footer { background: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #666; }
                hr { border: none; border-top: 1px solid #eee; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${appName}</h1>
                </div>
                <div class="content">
                    <h2>Hello ${name || 'there'},</h2>
                    <p>${message}</p>
                    <hr>
                    <p style="font-size: 12px; color: #999;">
                        You're receiving this because you have notifications enabled.
                        <br>
                        <a href="${process.env.BASE_URL || 'http://localhost:5173'}/settings/notifications" style="color: #035b9d;">Manage preferences</a>
                    </p>
                </div>
                <div class="footer">
                    <p>${appName} | Building Futures in South Africa</p>
                </div>
            </div>
        </body>
        </html>
    `;
    
    try {
        await transporter.sendMail({
            from: `"${appName}" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: title,
            html: htmlContent
        });
        console.log(`✅ Notification email sent to ${to}: ${title}`);
        return { success: true };
    } catch (error) {
        console.error('❌ Failed to send notification email:', error.message);
        return { success: false, error: error.message };
    }
}

export default sendVerificationEmail;