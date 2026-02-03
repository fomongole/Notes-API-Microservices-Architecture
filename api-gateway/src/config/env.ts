import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8000;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:3000';

export const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
export const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';
export const NOTES_SERVICE_URL = process.env.NOTES_SERVICE_URL || 'http://localhost:3003';