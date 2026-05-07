import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL değişkeni tanımlanmamış! Lütfen Render panelinden kontrol edin.");
}

// Render üzerindeki veritabanı bağlantısı için gerekli SSL ayarları
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Bu satır, sertifika doğrulama hatasını aşar ve bağlantıyı sağlar.
  }
});

export const db = drizzle(pool);
