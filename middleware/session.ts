import session from "express-session";
import { DB_SESSIONS_FILE } from "../config.ts";

const { default: connectSqlite3 } = await import("connect-sqlite3");
const SQLiteStore = connectSqlite3(session);

// SESSIONS
const sessionMiddleware = session({
  store: new SQLiteStore({ db: DB_SESSIONS_FILE }),
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
});

export default sessionMiddleware;
