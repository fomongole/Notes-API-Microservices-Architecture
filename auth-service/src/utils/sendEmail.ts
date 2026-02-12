import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } from '../config/env';

interface EmailOptions {
    email: string;
    subject: string;
    message: string; // Plain text version (for reliability)
    html?: string;   // HTML version (optional, for styling)
}

const sendEmail = async (options: EmailOptions) => {
    const transporter = nodemailer.createTransport({
        host: EMAIL_HOST,
        port: Number(EMAIL_PORT),
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });

    const mailOptions = {
        from: '"Notes App Support" <support@notesapp.com>',
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    await transporter.sendMail(mailOptions);
};

export default sendEmail;
