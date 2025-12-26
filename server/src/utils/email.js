import nodemailer from 'nodemailer';

const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
};

export const sendEmail = async ({ to, subject, html, text }) => {
    const transporter = createTransporter();
    const mailOptions = {
        from: `Biology Education <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        text
    };
    return await transporter.sendMail(mailOptions);
};

export const sendVerificationEmail = async (email, token) => {
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c5282;">Welcome to Biology Education Platform!</h2>
      <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #4299e1; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Verify Email</a>
      <p style="color: #718096; font-size: 14px;">If the button doesn't work, copy and paste this link into your browser:<br><a href="${verificationUrl}">${verificationUrl}</a></p>
      <p style="color: #718096; font-size: 12px;">This link expires in 24 hours.</p>
    </div>`;
    return await sendEmail({
        to: email,
        subject: 'Verify Your Email - Biology Education',
        html,
        text: `Welcome! Please verify your email by visiting: ${verificationUrl}`
    });
};

export const sendPasswordResetEmail = async (email, token) => {
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`;
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2c5282;">Password Reset Request</h2>
      <p>You requested a password reset. Click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #e53e3e; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0;">Reset Password</a>
      <p style="color: #718096; font-size: 14px;">If you didn't request this, please ignore this email.<br>If the button doesn't work, copy and paste this link into your browser:<br><a href="${resetUrl}">${resetUrl}</a></p>
      <p style="color: #718096; font-size: 12px;">This link expires in 1 hour.</p>
    </div>`;
    return await sendEmail({
        to: email,
        subject: 'Password Reset - Biology Education',
        html,
        text: `Reset your password by visiting: ${resetUrl}`
    });
};
