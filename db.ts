import Database from "better-sqlite3";
import { DB_FILE } from "./config.ts";
import { User } from "./types/user.ts";

const db = new Database(DB_FILE);

// Create tables if they don't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY,
    project_id INTEGER NOT NULL,
    channel TEXT DEFAULT 'default',
    event TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
  );

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

// Get user by username
export function getUserByUsername(username: string): User | unknown {
  return db
    .prepare("SELECT id, username, password_hash FROM users WHERE username = ?")
    .get(username);
}

// Get user by id
export function getUserById(id: number): User | unknown {
  return db
    .prepare("SELECT id, username, password_hash FROM users WHERE id = ?")
    .get(id);
}

export default db;
