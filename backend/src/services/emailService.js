const nodemailer = require('nodemailer');

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
        const info = await transporter.sendMail({
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

module.exports = { sendVerificationEmail };