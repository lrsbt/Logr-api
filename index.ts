import cors from "cors";
import express from "express";

import db from "./db.ts";
import { PORT } from "./config.ts";
import passport from "./passport.ts";
import sessionMiddleware from "./session.ts";

import eventRoutes from "./routes/events.ts";
import authRoutes from "./routes/auth.ts";
import projectRoutes from "./routes/projects.ts";

const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:5173", // frontend URL
    credentials: true,
  })
);

// App
app.use(express.json());
app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", eventRoutes);
app.use("/projects", projectRoutes);
app.use("/", authRoutes);

app.listen(PORT, () => {
  console.log(`✅ Listening at http://localhost:${PORT}`);
});
