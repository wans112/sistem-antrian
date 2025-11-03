import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';

// Membuat direktori db jika belum ada
const dbDir = process.env.DB_DIR || './db';
if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
    console.log('Direktori db berhasil dibuat.');
}

// Membuat database di direktori db
const dbName = process.env.DB_NAME || 'data.db';
const dbPath = path.join(dbDir, dbName);
const db = new Database(dbPath);

// Membuat tabel customer jika belum ada
const createTableQuery = `
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS customer (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama TEXT NOT NULL,
    nomor_telepon TEXT NOT NULL,
    alamat TEXT,
    waktu_daftar DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS layanan (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nama_layanan TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS detail_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    layanan_id INTEGER,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE SET NULL,
    UNIQUE (user_id)
);

CREATE TABLE IF NOT EXISTS antrian (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    nomor_antrian INTEGER NOT NULL,
    layanan_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'menunggu',
    FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE,
    FOREIGN KEY (layanan_id) REFERENCES layanan(id) ON DELETE CASCADE
);

`;

db.exec(createTableQuery);

// Pastikan index unik untuk user_id di detail_users tersedia (untuk mendukung upsert)
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_detail_users_user_id ON detail_users(user_id);');

console.log('Database dan tabel antrian berhasil dibuat di direktori db.');

// Seed data
const insertUser = db.prepare('INSERT OR IGNORE INTO users (username, password, role) VALUES (?, ?, ?)');
const getUserId = db.prepare('SELECT id FROM users WHERE username = ?');
const ensureUser = (username, password, role) => {
    const result = insertUser.run(username, password, role);
    if (result.changes === 0) {
        return getUserId.get(username).id;
    }
    return result.lastInsertRowid;
};

const upsertDetailUser = db.prepare(`
    INSERT INTO detail_users (user_id, full_name, phone_number, layanan_id)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(user_id) DO UPDATE SET
        full_name = excluded.full_name,
        phone_number = excluded.phone_number,
        layanan_id = excluded.layanan_id;
`);

const insertLayanan = db.prepare('INSERT OR IGNORE INTO layanan (nama_layanan) VALUES (?)');
const getLayananId = db.prepare('SELECT id FROM layanan WHERE nama_layanan = ?');
const ensureLayanan = (nama) => {
    const result = insertLayanan.run(nama);
    if (result.changes === 0) {
        return getLayananId.get(nama).id;
    }
    return result.lastInsertRowid;
};

// Insert users
const didiId = ensureUser('didi', 'didi123', 'admin'); // Password plain text untuk demo, sebaiknya hash
const jimmyId = ensureUser('jimmy', 'jimmy123', 'dokter');
const aditId = ensureUser('adit', 'adit123', 'dokter');

// Insert layanan jika belum ada
const layanan1Id = ensureLayanan('Poli Umum');
const layanan2Id = ensureLayanan('Poli Gigi');

// Insert detail_users
upsertDetailUser.run(didiId, 'Administrator', '081234567890', null);
upsertDetailUser.run(jimmyId, 'Dokter Jimmy', '081234567891', layanan2Id);
upsertDetailUser.run(aditId, 'Dokter Adit', '081234567892', layanan1Id);

console.log('Seed data berhasil ditambahkan.');

// Menutup koneksi database
db.close();
