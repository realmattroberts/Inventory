import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";
import path from "path";
import fs from "fs";

// Use DATABASE_PATH env var (for Railway volume) or default to local data/ folder
const dbDir = process.env.DATABASE_PATH || path.join(process.cwd(), "data");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, "inventory.db");
const sqlite = new Database(dbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");

// Auto-create tables if they don't exist (needed for Docker builds & fresh deploys)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    color TEXT
  );
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sku TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    category_id INTEGER REFERENCES categories(id),
    quantity INTEGER NOT NULL DEFAULT 0,
    min_quantity INTEGER NOT NULL DEFAULT 0,
    price REAL,
    cost_price REAL,
    upc TEXT,
    location TEXT,
    image_url TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'open',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS job_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL REFERENCES jobs(id),
    item_id INTEGER NOT NULL REFERENCES items(id),
    quantity_used INTEGER NOT NULL,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS inventory_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    item_id INTEGER NOT NULL REFERENCES items(id),
    type TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    reference TEXT,
    notes TEXT,
    performed_by TEXT,
    created_at TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS packing_slips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_name TEXT NOT NULL,
    raw_text TEXT,
    parsed_data TEXT,
    item_count INTEGER DEFAULT 0,
    total_quantity INTEGER DEFAULT 0,
    reference TEXT,
    performed_by TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TEXT NOT NULL
  );
`);

// Run lightweight migrations for new columns on existing databases
try {
  sqlite.exec(`ALTER TABLE packing_slips ADD COLUMN parsed_data TEXT`);
} catch { /* column already exists */ }
try {
  sqlite.exec(`ALTER TABLE packing_slips ADD COLUMN item_count INTEGER DEFAULT 0`);
} catch { /* column already exists */ }
try {
  sqlite.exec(`ALTER TABLE packing_slips ADD COLUMN total_quantity INTEGER DEFAULT 0`);
} catch { /* column already exists */ }
try {
  sqlite.exec(`ALTER TABLE packing_slips ADD COLUMN reference TEXT`);
} catch { /* column already exists */ }
try {
  sqlite.exec(`ALTER TABLE inventory_transactions ADD COLUMN performed_by TEXT`);
} catch { /* column already exists */ }
try {
  sqlite.exec(`ALTER TABLE packing_slips ADD COLUMN performed_by TEXT`);
} catch { /* column already exists */ }

export const db = drizzle(sqlite, { schema });
