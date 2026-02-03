import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import {DATABASE_URL} from "./env";

const connectionString = DATABASE_URL;

if (!connectionString) {
    console.error("❌ DATABASE_URL is missing in .env");
    process.exit(1);
}

// 1. Create a Postgres Pool
const pool = new Pool({ connectionString });

// 2. Create the Adapter
const adapter = new PrismaPg(pool);

// 3. Pass the adapter to PrismaClient
export const prisma = new PrismaClient({ adapter });

export const connectDB = async () => {
    try {
        console.log("😊 Connecting to postgresql database...");
        // The connection is actually established via the pool,
        // but this verifies Prisma can talk to it.
        await prisma.$connect();
        console.log("🐘 Connected to Postgres database via Prisma!");
    } catch (error) {
        console.error("❌ Postgres connection failed:", error);
        process.exit(1);
    }
};