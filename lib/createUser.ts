import Database from "better-sqlite3";
import bcrypt from "bcrypt";
import crypto from "crypto";

import db from "../db/index.ts";
import { User } from "../types/user.ts";

export async function createUser(
  username: User["username"],
  password: string
): Promise<Partial<User>> {
  const password_hash = await bcrypt.hash(password, 10);
  const api_key = crypto.randomBytes(16).toString("hex");

  const statement = db.prepare(
    "INSERT INTO users (username, password_hash, api_key) VALUES (?, ?, ?)"
  );

  const result = statement.run(username, password_hash, api_key);

  console.log(`✅ User ${username} created!`, result);

  return {
    id: result.lastInsertRowid as number,
    username,
    api_key,
  };
}
