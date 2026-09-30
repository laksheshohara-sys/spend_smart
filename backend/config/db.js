// backend/config/db.js
// SQLite database connection using better-sqlite3 (synchronous, no callback hell)

const Database = require('better-sqlite3');
const path     = require('path');
const fs       = require('fs');

const DB_PATH     = path.join(__dirname, '../../database/SpendSmart.db');
const SCHEMA_PATH = path.join(__dirname, '../../database/schema.sql');

let db;

function getDB() {
    if (!db) {
        db = new Database(DB_PATH);
        // Enable WAL mode for better concurrent read performance
        db.pragma('journal_mode = WAL');
        db.pragma('foreign_keys = ON');

        // Run schema on first boot
        const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
        db.exec(schema);
        console.log('✅ SQLite database connected & schema applied');
    }
    return db;
}

module.exports = { getDB };