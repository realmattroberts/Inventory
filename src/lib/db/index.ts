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
