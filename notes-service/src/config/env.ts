import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || '3003';
export const DB_URI = process.env.DB_URI || 'mongodb://localhost:27017/notes-db';

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';