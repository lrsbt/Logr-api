import express from "express";

import db from "./db.ts";
import { PORT } from "./config.ts";

import eventRoutes from "./routes/events.ts";
import projectRoutes from "./routes/projects.ts";

const app = express();

// App
app.use(express.json());

// Routes
app.use("/", eventRoutes);
app.use("/projects", projectRoutes);

app.listen(PORT, () => {
  console.log(`✅ Listening at http://localhost:${PORT}`);
});
