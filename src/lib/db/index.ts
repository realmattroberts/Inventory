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
sqlite.pragma("busy_timeout = 5000");
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

// Auto-seed if database is empty (for fresh deploys)
function autoSeed() {
  const count = sqlite.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number };
  if (count.c > 0) return; // Already seeded

  const d = (days: number) => { const dt = new Date(); dt.setDate(dt.getDate() - days); return dt.toISOString(); };
  const now = new Date().toISOString();
  const users = ["Matt", "Peter", "Sarah"];

  sqlite.transaction(() => {
    // Categories
    const ic = sqlite.prepare("INSERT INTO categories (name, description, color) VALUES (?, ?, ?)");
    [["Resistors","Passive resistance components","#EF4444"],["Capacitors","Energy storage components","#3B82F6"],["Connectors","Interconnect components","#10B981"],["ICs & Microcontrollers","Integrated circuits and MCUs","#8B5CF6"],["Power Supplies","Power management and supplies","#F59E0B"],["Tools & Equipment","Workshop tools and test equipment","#6B7280"],["Consumer Electronics","Retail electronic products","#EC4899"],["Cables & Wiring","Cables, wires, and harnesses","#14B8A6"]].forEach(c => ic.run(...c));

    // Items
    const ii = sqlite.prepare("INSERT INTO items (sku, name, description, category_id, quantity, min_quantity, price, cost_price, upc, location, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    [
      ["RES-10K-0805","10K Ohm Resistor 0805 SMD","1/8W 5% tolerance surface mount resistor",1,2500,500,0.02,0.005,null,"BIN-A1",d(60),now],
      ["RES-4K7-0603","4.7K Ohm Resistor 0603 SMD","1/10W 1% tolerance precision resistor",1,1800,400,0.03,0.008,null,"BIN-A1",d(45),now],
      ["RES-100R-THT","100 Ohm Resistor Through-Hole","1/4W 5% carbon film resistor",1,950,200,0.05,0.01,null,"BIN-A2",d(30),now],
      ["CAP-100UF-16V","100uF Electrolytic Capacitor 16V","Radial lead aluminum electrolytic",2,340,100,0.15,0.06,null,"BIN-B1",d(55),now],
      ["CAP-10UF-50V","10uF Ceramic Capacitor 50V","X7R dielectric 0805 SMD",2,620,200,0.08,0.03,null,"BIN-B1",d(40),now],
      ["CAP-1UF-25V","1uF MLCC 0402","Multi-layer ceramic capacitor",2,3200,500,0.04,0.01,null,"BIN-B2",d(35),now],
      ["USB-C-CONN-M","USB-C Male Connector","USB Type-C male plug, SMD mount, 24-pin",3,45,50,0.85,0.35,null,"BIN-C1",d(50),now],
      ["HDMI-CONN-F","HDMI Female Connector","HDMI Type-A receptacle, right angle, THT",3,120,30,1.20,0.55,null,"BIN-C1",d(42),now],
      ["JST-PH-4PIN","JST PH 4-Pin Connector","2.0mm pitch wire-to-board connector",3,280,100,0.25,0.10,null,"BIN-C2",d(28),now],
      ["RJ45-CONN","RJ45 Ethernet Jack","Shielded 8P8C modular jack with LEDs",3,85,40,1.50,0.65,null,"BIN-C3",d(20),now],
      ["ATMEGA328P","ATmega328P Microcontroller","DIP-28 package, 8-bit AVR, 32KB flash",4,12,20,3.50,1.80,null,"BIN-D1",d(65),now],
      ["ESP32-WROOM","ESP32-WROOM-32E Module","Wi-Fi + BLE module, 4MB flash",4,35,15,4.50,2.20,null,"BIN-D1",d(50),now],
      ["NE555-TIMER","NE555 Timer IC","DIP-8 general purpose timer",4,150,50,0.45,0.15,null,"BIN-D2",d(40),now],
      ["LM7805-REG","LM7805 Voltage Regulator","5V 1A linear regulator TO-220",4,75,25,0.60,0.22,null,"BIN-D2",d(35),now],
      ["PSU-12V-5A","12V 5A Switching Power Supply","AC-DC adapter, barrel plug, UL listed",5,8,5,14.99,7.50,"012345678905","SHELF-E1",d(70),now],
      ["PSU-5V-3A-USB","5V 3A USB-C Power Supply","USB-C PD adapter for Raspberry Pi",5,22,10,12.99,5.80,"012345678912","SHELF-E1",d(45),now],
      ["BATT-18650-3500","18650 Li-Ion Battery 3500mAh","Rechargeable lithium-ion cell, protected",5,48,20,6.99,3.20,null,"SHELF-E2",d(30),now],
      ["SOLDER-STATION","Soldering Station 60W","Digital temperature controlled soldering station",6,3,2,89.99,42.00,"012345678929","SHELF-F1",d(90),now],
      ["MULTI-DMM","Digital Multimeter","Auto-ranging DMM with capacitance measurement",6,5,2,34.99,15.00,"012345678936","SHELF-F1",d(80),now],
      ["HEAT-GUN","Hot Air Rework Station","SMD rework station with digital display",6,2,1,129.99,58.00,"012345678943","SHELF-F2",d(75),now],
      ["RASP-PI-5-8G","Raspberry Pi 5 8GB","Single-board computer, 8GB RAM, BCM2712",7,3,10,79.99,55.00,"012345678950","SHELF-G1",d(25),now],
      ["ARDUINO-UNO-R4","Arduino Uno R4 WiFi","Development board with ESP32-S3 WiFi module",7,15,8,27.50,16.00,"012345678967","SHELF-G1",d(40),now],
      ["OLED-128X64","0.96\" OLED Display 128x64","I2C SSD1306 white OLED module",7,42,15,5.99,2.50,null,"SHELF-G2",d(35),now],
      ["SENSOR-DHT22","DHT22 Temperature/Humidity Sensor","Digital temp and humidity sensor module",7,60,20,4.99,1.80,null,"SHELF-G2",d(30),now],
      ["HDMI-CBL-6FT","HDMI 2.1 Cable 6ft","High speed 48Gbps, 8K@60Hz capable",8,156,25,8.99,3.50,"012345678974","SHELF-H1",d(50),now],
      ["USB-C-CBL-3FT","USB-C to USB-C Cable 3ft","USB 3.2 Gen 2, 100W PD, 10Gbps data",8,85,30,7.99,2.80,"012345678981","SHELF-H1",d(45),now],
      ["WIRE-22AWG-RED","Hook-Up Wire 22AWG Red","Stranded copper, PVC insulation, 100ft spool",8,12,5,11.99,5.50,null,"SHELF-H2",d(60),now],
      ["WIRE-22AWG-BLK","Hook-Up Wire 22AWG Black","Stranded copper, PVC insulation, 100ft spool",8,10,5,11.99,5.50,null,"SHELF-H2",d(60),now],
      ["DUPONT-JUMPER-40","Dupont Jumper Wires 40pcs","Male-to-female 20cm breadboard jumpers",8,35,10,3.99,1.20,null,"SHELF-H3",d(40),now],
    ].forEach(item => ii.run(...item));

    // Jobs
    const ij = sqlite.prepare("INSERT INTO jobs (job_number, customer_name, description, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)");
    [
      ["JOB-2025-001","Acme Corp","Server room network upgrade",           "completed",   d(28),d(14)],
      ["JOB-2025-002","Bean Counter Cafe","POS terminal repair",            "in_progress", d(14),d(2)],
      ["JOB-2025-003","GreenHouse Tech","Custom IoT monitoring system",     "open",        d(5), d(5)],
      ["JOB-2025-004","Summit Electronics","Prototype PCB assembly batch",  "in_progress", d(7), d(1)],
    ].forEach(j => ij.run(...j));

    // Job items
    const iji = sqlite.prepare("INSERT INTO job_items (job_id, item_id, quantity_used, created_at) VALUES (?, ?, ?, ?)");
    [[1,10,12,d(21)],[1,25,8,d(21)],[1,26,5,d(20)],[1,28,4,d(20)],[1,9,20,d(19)],[2,12,2,d(10)],[2,23,2,d(10)],[2,24,3,d(8)],[4,1,100,d(5)],[4,2,80,d(5)],[4,5,50,d(4)],[4,6,100,d(4)],[4,13,10,d(3)],[4,14,10,d(3)]].forEach(ji => iji.run(...ji));

    // Transactions
    const it = sqlite.prepare("INSERT INTO inventory_transactions (item_id, type, quantity, reference, notes, performed_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)");
    [
      [1,"receive",500,"PO-2025-0101","Monthly resistor restock",users[0],d(28)],
      [4,"receive",200,"PO-2025-0102","Capacitor order",users[1],d(27)],
      [5,"receive",300,"PO-2025-0102","Capacitor order",users[1],d(27)],
      [7,"receive",100,"PO-2025-0103","USB-C connectors",users[2],d(25)],
      [10,"receive",50,"PO-2025-0104","RJ45 jacks for Acme job",users[0],d(24)],
      [12,"receive",20,"PO-2025-0105","ESP32 modules",users[2],d(22)],
      [25,"receive",50,"PO-2025-0106","HDMI cables bulk",users[1],d(20)],
      [21,"receive",10,"PO-2025-0107","Raspberry Pi 5 restock",users[0],d(18)],
      [15,"receive",10,"PO-2025-0108","Power supply restock",users[2],d(15)],
      [26,"receive",40,"PO-2025-0109","USB-C cables",users[0],d(14)],
      [1,"receive",300,"PO-2025-0110","Resistor restock weekly",users[1],d(12)],
      [17,"receive",24,"PO-2025-0111","18650 batteries",users[2],d(10)],
      [22,"receive",10,"PO-2025-0112","Arduino boards",users[0],d(8)],
      [9,"receive",100,"PO-2025-0113","JST connectors bulk",users[1],d(7)],
      [3,"receive",500,"PO-2025-0114","Through-hole resistors",users[0],d(5)],
      [23,"receive",20,"PO-2025-0115","OLED displays",users[2],d(3)],
      [6,"receive",1000,"PO-2025-0116","MLCC capacitor reel",users[1],d(2)],
      [29,"receive",15,"PO-2025-0117","Dupont jumper wire packs",users[0],d(1)],
      [10,"use",-12,"JOB-2025-001","RJ45 jacks for Acme",users[0],d(21)],
      [25,"use",-8,"JOB-2025-001","HDMI cables for Acme",users[0],d(21)],
      [26,"use",-5,"JOB-2025-001","USB-C cables for Acme",users[2],d(20)],
      [28,"use",-4,"JOB-2025-001","Wire for Acme",users[2],d(20)],
      [9,"use",-20,"JOB-2025-001","JST connectors for Acme",users[0],d(19)],
      [12,"use",-2,"JOB-2025-002","ESP32 for Bean Counter",users[1],d(10)],
      [23,"use",-2,"JOB-2025-002","OLED for Bean Counter",users[1],d(10)],
      [24,"use",-3,"JOB-2025-002","DHT22 for Bean Counter",users[2],d(8)],
      [1,"use",-100,"JOB-2025-004","Resistors for Summit PCB",users[1],d(5)],
      [2,"use",-80,"JOB-2025-004","Resistors for Summit PCB",users[1],d(5)],
      [5,"use",-50,"JOB-2025-004","Capacitors for Summit PCB",users[0],d(4)],
      [6,"use",-100,"JOB-2025-004","Capacitors for Summit PCB",users[0],d(4)],
      [13,"use",-10,"JOB-2025-004","NE555 for Summit PCB",users[2],d(3)],
      [14,"use",-10,"JOB-2025-004","Regulators for Summit PCB",users[2],d(3)],
      [21,"adjust",-7,null,"Inventory count correction - damaged in shipping",users[0],d(16)],
      [11,"adjust",-3,null,"ATmega328P chips defective",users[2],d(12)],
    ].forEach(t => it.run(...t));
  })();

  console.log("Auto-seeded database with demo data");
}

try { autoSeed(); } catch (e) { console.log("Auto-seed skipped:", e); }

export const db = drizzle(sqlite, { schema });
