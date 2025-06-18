import express from "express";
import Database from "better-sqlite3";

import db from "./db.ts";
import { PORT } from "./config.ts";
import { requireApiKey } from "./middleware/apiKey.ts";

import eventRoutes from "./routes/events.ts";

const app = express();
// App
app.use(express.json());

// Middleware;
app.use(requireApiKey);

// Routes
app.use("/", eventRoutes);

app.listen(PORT, () => {
  console.log(`✅ Listening at http://localhost:${PORT}`);
});
