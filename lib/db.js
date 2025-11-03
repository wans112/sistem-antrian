import 'dotenv/config';
import Database from 'better-sqlite3';
import path from 'path';

// Path database dari .env
const dbDir = process.env.DB_DIR || './db';
const dbName = process.env.DB_NAME || 'data.db';
const dbPath = path.join(dbDir, dbName);

// Membuat koneksi database
const db = new Database(dbPath);

// Mengaktifkan pragma untuk meningkatkan performa
db.pragma('journal_mode = WAL');
db.pragma('synchronous = NORMAL');
db.pragma('cache_size = 1000000');
db.pragma('temp_store = memory');
db.pragma('foreign_keys = ON');

// Fungsi untuk mengambil semua data dari tabel
export function all(table) {
    const stmt = db.prepare(`SELECT * FROM ${table}`);
    return stmt.all();
}

// Fungsi untuk mengambil satu data berdasarkan ID
export function get(table, id) {
    const stmt = db.prepare(`SELECT * FROM ${table} WHERE id = ?`);
    return stmt.get(id);
}

// Fungsi untuk insert data ke tabel
export function insert(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const stmt = db.prepare(`INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`);
    const result = stmt.run(...values);
    return result.lastInsertRowid;
}

// Fungsi untuk update data berdasarkan ID
export function update(table, id, data) {
    const keys = Object.keys(data);
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const values = [...Object.values(data), id];
    const stmt = db.prepare(`UPDATE ${table} SET ${setClause} WHERE id = ?`);
    return stmt.run(...values);
}

// Fungsi untuk delete data berdasarkan ID
export function remove(table, id) {
    const stmt = db.prepare(`DELETE FROM ${table} WHERE id = ?`);
    return stmt.run(id);
}

// Fungsi untuk menjalankan query custom (untuk fleksibilitas)
export function query(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.all(...params);
}

// Fungsi untuk menjalankan query single result
export function queryOne(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.get(...params);
}

// Fungsi untuk menjalankan query non-select
export function execute(sql, params = []) {
    const stmt = db.prepare(sql);
    return stmt.run(...params);
}
