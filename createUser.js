// TEMP FILE

import Database from "better-sqlite3";
import bcrypt from "bcrypt";

async function createUser(username, password) {
  const db = new Database("logr.db");
  const password_hash = await bcrypt.hash(password, 10);

  const stmt = db.prepare(
    "INSERT INTO users (username, password_hash) VALUES (?, ?)"
  );
  stmt.run(username, password_hash);

  console.log(`User ${username} created!`);
  db.close();
}

// Replace these with your desired username and password
const username = process.argv[2];
const password = process.argv[3];

if (!username || !password) {
  console.error("Usage: node createUser.js <username> <password>");
  process.exit(1);
}

createUser(username, password);
