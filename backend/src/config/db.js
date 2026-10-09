import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Parse configuration from env
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
      connectionTimeoutMillis: 4000,
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false
    };

const pool = new Pool(poolConfig);

let isPostgresConnected = false;

// Fallback in-memory / JSON store for demo & seamless offline evaluation
const fallbackStore = {
  users: [],
  repairers: [],
  repair_requests: [],
  repair_updates: [],
  reviews: []
};

// Seed initial fallback data
export async function seedInitialData() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const defaultCustomer = {
    id: 1,
    name: 'Alex Johnson',
    email: 'customer@repairhub.local',
    password: hashedPassword,
    role: 'customer',
    phone: '+91 98765 43210',
    address: '452 Tech Residency, Indiranagar, Bengaluru',
    created_at: new Date().toISOString()
  };

  const defaultRepairerUser = {
    id: 2,
    name: 'Marcus Vance',
    email: 'repairer@repairhub.local',
    password: hashedPassword,
    role: 'repairer',
    phone: '+91 98112 34567',
    address: '12 Workshop Hub, Electronic City, Bengaluru',
    created_at: new Date().toISOString()
  };

  const defaultRepairerProfile = {
    id: 1,
    user_id: 2,
    name: 'Marcus Vance',
    phone: '+91 98112 34567',
    service_categories: 'Mobile Repair, Laptop Repair, Computer Repair',
    service_area: 'Bengaluru & NCR Metro Region',
    rating: 4.9,
    completed_repairs: 48,
    bio: 'Master technician with 8+ years experience in chip-level motherboard diagnostics, micro-soldering, and screen replacements.',
    created_at: new Date().toISOString()
  };

  const sampleRequests = [
    {
      id: 'RH-2024-001',
      customer_id: 1,
      repairer_id: 2,
      repair_type: 'Laptop Repair',
      problem: 'MacBook Pro screen flickering and trackpad unresponsive after accidental water splash.',
      image_url: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      address: '452 Tech Residency, Indiranagar, Bengaluru',
      urgency: 'high',
      preferred_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      preferred_time: '14:00 - 16:00',
      status: 'In Progress',
      estimated_cost: 12499.00,
      repairer_name: 'Marcus Vance',
      repair_notes: 'Inspected logic board. Ultrasonic cleaning performed. Replacing display flex cable.',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 4).toISOString(),
      completed_at: null
    },
    {
      id: 'RH-2024-002',
      customer_id: 1,
      repairer_id: null,
      repair_type: 'Mobile Repair',
      problem: 'iPhone 14 battery draining in under 2 hours, rear glass cracked.',
      image_url: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      address: '452 Tech Residency, Indiranagar, Bengaluru',
      urgency: 'medium',
      preferred_date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      preferred_time: '10:00 - 12:00',
      status: 'Pending',
      estimated_cost: 4250.00,
      repairer_name: null,
      repair_notes: 'Awaiting technician assignment.',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 3).toISOString(),
      completed_at: null
    },
    {
      id: 'RH-2024-003',
      customer_id: 1,
      repairer_id: 2,
      repair_type: 'AC Repair',
      problem: 'Dual inverter AC not cooling properly and making buzzing sound from outdoor compressor.',
      image_url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
      phone: '+91 98765 43210',
      address: '452 Tech Residency, Indiranagar, Bengaluru',
      urgency: 'high',
      preferred_date: new Date(Date.now() - 86400000 * 5).toISOString().split('T')[0],
      preferred_time: '11:00 - 13:00',
      status: 'Completed',
      estimated_cost: 2850.00,
      repairer_name: 'Marcus Vance',
      repair_notes: 'Gas refilled to standard pressure, compressor capacitor replaced and outdoor coils cleaned.',
      created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
      updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
      completed_at: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ];

  const sampleUpdates = [
    {
      id: 1,
      request_id: 'RH-2024-001',
      status: 'Pending',
      note: 'Repair request created by Alex Johnson.',
      created_by: 'Customer',
      created_at: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 2,
      request_id: 'RH-2024-001',
      status: 'Accepted',
      note: 'Assigned to Senior Tech Marcus Vance. Estimated cost provided.',
      created_by: 'Marcus Vance',
      created_at: new Date(Date.now() - 86400000 * 1.5).toISOString()
    },
    {
      id: 3,
      request_id: 'RH-2024-001',
      status: 'In Progress',
      note: 'Diagnostic confirmed moisture damage. Ultrasonic cleaning in progress.',
      created_by: 'Marcus Vance',
      created_at: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 4,
      request_id: 'RH-2024-002',
      status: 'Pending',
      note: 'Repair request submitted. Looking for available certified mobile technician.',
      created_by: 'Customer',
      created_at: new Date(Date.now() - 3600000 * 3).toISOString()
    },
    {
      id: 5,
      request_id: 'RH-2024-003',
      status: 'Completed',
      note: 'AC testing passed at 16°C. Work verified by customer.',
      created_by: 'Marcus Vance',
      created_at: new Date(Date.now() - 86400000 * 4).toISOString()
    }
  ];

  const sampleReviews = [
    {
      id: 1,
      request_id: 'RH-2024-003',
      customer_id: 1,
      repairer_id: 2,
      rating: 5,
      review: 'Incredible speed and professionalism! Marcus fixed our cooling within 45 minutes.',
      created_at: new Date(Date.now() - 86400000 * 3.8).toISOString()
    }
  ];

  fallbackStore.users = [defaultCustomer, defaultRepairerUser];
  fallbackStore.repairers = [defaultRepairerProfile];
  fallbackStore.repair_requests = sampleRequests;
  fallbackStore.repair_updates = sampleUpdates;
  fallbackStore.reviews = sampleReviews;
}

// Initialize Database
export async function initDb() {
  await seedInitialData();

  try {
    const client = await pool.connect();
    console.log('✅ [Database] PostgreSQL connected successfully.');
    isPostgresConnected = true;

    // Run schema
    const schemaPath = path.join(__dirname, '../models/schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await client.query(schemaSql);
      console.log('✅ [Database] Schema tables verified & ready.');

      // Check if users exist in PG, if not seed
      const userCheck = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCheck.rows[0].count, 10) === 0) {
        console.log('🌱 [Database] Seeding PostgreSQL with initial demo users and requests...');
        for (const user of fallbackStore.users) {
          await client.query(
            `INSERT INTO users (id, name, email, password, role, phone, address, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
             ON CONFLICT (id) DO NOTHING`,
            [user.id, user.name, user.email, user.password, user.role, user.phone, user.address, user.created_at]
          );
        }
        for (const rep of fallbackStore.repairers) {
          await client.query(
            `INSERT INTO repairers (id, user_id, name, phone, service_categories, service_area, rating, completed_repairs, bio, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO NOTHING`,
            [rep.id, rep.user_id, rep.name, rep.phone, rep.service_categories, rep.service_area, rep.rating, rep.completed_repairs, rep.bio, rep.created_at]
          );
        }
        for (const req of fallbackStore.repair_requests) {
          await client.query(
            `INSERT INTO repair_requests (id, customer_id, repairer_id, repair_type, problem, image_url, phone, address, urgency, preferred_date, preferred_time, status, estimated_cost, repairer_name, repair_notes, created_at, updated_at, completed_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
             ON CONFLICT (id) DO NOTHING`,
            [req.id, req.customer_id, req.repairer_id, req.repair_type, req.problem, req.image_url, req.phone, req.address, req.urgency, req.preferred_date, req.preferred_time, req.status, req.estimated_cost, req.repairer_name, req.repair_notes, req.created_at, req.updated_at, req.completed_at]
          );
        }
        for (const upd of fallbackStore.repair_updates) {
          await client.query(
            `INSERT INTO repair_updates (id, request_id, status, note, created_by, created_at)
             VALUES ($1, $2, $3, $4, $5, $6)
             ON CONFLICT (id) DO NOTHING`,
            [upd.id, upd.request_id, upd.status, upd.note, upd.created_by, upd.created_at]
          );
        }
        for (const rev of fallbackStore.reviews) {
          await client.query(
            `INSERT INTO reviews (id, request_id, customer_id, repairer_id, rating, review, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             ON CONFLICT (id) DO NOTHING`,
            [rev.id, rev.request_id, rev.customer_id, rev.repairer_id, rev.rating, rev.review, rev.created_at]
          );
        }
        // Synchronize sequences to avoid duplicate key issues on subsequent inserts
        try {
          await client.query(`SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 1));`);
          await client.query(`SELECT setval('repairers_id_seq', COALESCE((SELECT MAX(id) FROM repairers), 1));`);
        } catch (seqErr) {
          // Ignore if sequence names differ
        }
        console.log('✅ [Database] PostgreSQL seeded successfully.');
      }
    }
    client.release();
  } catch (error) {
    isPostgresConnected = false;
    console.warn('⚠️ [Database] Notice: PostgreSQL is not currently running or credentials did not connect.');
    console.warn(`   Reason: ${error.message}`);
    console.log('⚡ [Database] Running on High-Reliability Local Store fallback mode.');
    console.log('   All features, auth, CRUD, tracking, and AI work out-of-the-box.');
    console.log('   To switch to PostgreSQL, start PostgreSQL and update backend/.env.');
  }
}

// Unified query wrapper
export const db = {
  isPostgres: () => isPostgresConnected,
  getFallbackStore: () => fallbackStore,
  pool,
  async query(text, params = []) {
    if (isPostgresConnected) {
      return pool.query(text, params);
    }
    throw new Error('Postgres not connected. Use high-level store access.');
  }
};

export default db;
