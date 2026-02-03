import { config } from 'dotenv';

config({
    path: `.env.${process.env.NODE_ENV || 'development'}.local`
});

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || '3001'; // Auth Service specific port
export const DB_URI = process.env.DB_URI as string;

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const EMAIL_HOST = process.env.EMAIL_HOST as string;
export const EMAIL_PORT = process.env.EMAIL_PORT || '2525';
export const EMAIL_USER = process.env.EMAIL_USER as string;
export const EMAIL_PASS = process.env.EMAIL_PASS as string;

export const CLIENT_URL = process.env.CLIENT_URL as string;

export const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002/internal/users';