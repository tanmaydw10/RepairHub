import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
const isProduction = process.env.NODE_ENV === 'production';
const requiresSsl = Boolean(
  connectionString &&
  !connectionString.includes('localhost') &&
  !connectionString.includes('127.0.0.1')
);

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: requiresSsl || isProduction ? { rejectUnauthorized: false } : false
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'repairhub_db',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
    };

console.log('🔌 Connecting to PostgreSQL at:', poolConfig.host || connectionString);

const pool = new Pool(poolConfig);

async function runSetup() {
  let client;
  try {
    client = await pool.connect();
    console.log('✅ Connected to PostgreSQL successfully!');

    // Read and run schema.sql
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf8');

    console.log('📄 Executing database schema tables...');
    await client.query(sql);
    console.log('✅ Tables verified: users, repairers, repair_requests, repair_updates, reviews.');

    // Seed initial demo data
    const hashedPassword = await bcrypt.hash('password123', 10);
    const now = new Date().toISOString();

    console.log('🌱 Seeding demo accounts and requests...');
    
    // Customer
    await client.query(
      `INSERT INTO users (id, name, email, password, role, phone, address, created_at)
       VALUES (1, 'Alex Johnson', 'customer@repairhub.local', $1, 'customer', '+91 98765 43210', '452 Tech Residency, Indiranagar, Bengaluru', $2)
       ON CONFLICT (id) DO UPDATE SET password = $1`,
      [hashedPassword, now]
    );

    // Repairer
    await client.query(
      `INSERT INTO users (id, name, email, password, role, phone, address, created_at)
       VALUES (2, 'Marcus Vance', 'repairer@repairhub.local', $1, 'repairer', '+91 98112 34567', '12 Workshop Hub, Electronic City, Bengaluru', $2)
       ON CONFLICT (id) DO UPDATE SET password = $1`,
      [hashedPassword, now]
    );

    // Repairer Profile
    await client.query(
      `INSERT INTO repairers (id, user_id, name, phone, service_categories, service_area, rating, completed_repairs, bio, created_at)
       VALUES (1, 2, 'Marcus Vance', '+91 98112 34567', 'Mobile Repair, Laptop Repair, Computer Repair', 'Bengaluru & NCR Metro Region', 4.9, 48, 'Master technician specializing in board-level electronics and micro-soldering.', $1)
       ON CONFLICT (id) DO NOTHING`,
      [now]
    );

    // Sample Requests
    await client.query(
      `INSERT INTO repair_requests (id, customer_id, repairer_id, repair_type, problem, image_url, phone, address, urgency, preferred_date, preferred_time, status, estimated_cost, repairer_name, repair_notes, created_at, updated_at)
       VALUES 
       ('RH-2024-001', 1, 2, 'Laptop Repair', 'MacBook Pro screen flickering and trackpad unresponsive after accidental water splash.', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80', '+91 98765 43210', '452 Tech Residency, Indiranagar, Bengaluru', 'high', CURRENT_DATE + 1, '14:00 - 16:00', 'In Progress', 12499.00, 'Marcus Vance', 'Inspected logic board. Ultrasonic cleaning performed. Replacing display flex cable.', $1, $1),
       ('RH-2024-002', 1, NULL, 'Mobile Repair', 'iPhone 14 battery draining in under 2 hours, rear glass cracked.', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80', '+91 98765 43210', '452 Tech Residency, Indiranagar, Bengaluru', 'medium', CURRENT_DATE + 2, '10:00 - 12:00', 'Pending', 4250.00, NULL, 'Awaiting technician assignment.', $1, $1),
       ('RH-2024-003', 1, 2, 'AC Repair', 'Dual inverter AC not cooling properly and making buzzing sound from outdoor compressor.', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80', '+91 98765 43210', '452 Tech Residency, Indiranagar, Bengaluru', 'high', CURRENT_DATE - 3, '11:00 - 13:00', 'Completed', 2850.00, 'Marcus Vance', 'Gas refilled to standard pressure, capacitor replaced.', $1, $1)
       ON CONFLICT (id) DO NOTHING`,
      [now]
    );

    console.log('🎉 Database setup complete! All tables and seed records are ready.');
  } catch (error) {
    console.error('❌ Database setup encountered an error:');
    console.error(error.message);
    console.log('\n💡 Tip: Verify that PostgreSQL is running and credentials match your backend/.env file.');
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

runSetup();
