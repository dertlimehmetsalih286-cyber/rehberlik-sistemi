import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL tanimlanmamis!");
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // RENDER İÇİN KRİTİK AYAR:
  ssl: {
    rejectUnauthorized: false // Bu satır bağlantıdaki SSL sertifika hatasını çözer
  }
});

export const db = drizzle(pool);
