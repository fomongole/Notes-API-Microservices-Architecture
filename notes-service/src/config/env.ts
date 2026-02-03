import { config } from 'dotenv';

config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

export const NODE_ENV = process.env.NODE_ENV || 'development';
export const PORT = process.env.PORT || '3003';
export const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/notes_db?schema=public';

export const JWT_SECRET = process.env.JWT_SECRET as string;
export const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';