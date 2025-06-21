import session from "express-session";
import SQLiteStore from "connect-sqlite3";

const { default: connectSqlite3 } = await import("connect-sqlite3");
const SQLiteStore = connectSqlite3(session);

// SESSIONS
const sessionMiddleware = session({
  store: new SQLiteStore({ db: "logr-sessions.db" }),
  secret: process.env.SESSION_SECRET || "dev-secret",
  resave: false,
  saveUninitialized: false,
});

export default sessionMiddleware;
