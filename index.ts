import cors from "cors";
import express from "express";

import db from "./db/index.ts";
import { PORT } from "./config.ts";
import passport from "./lib/passport.ts";

import eventRoutes from "./routes/events.ts";
import authRoutes from "./routes/auth.ts";
import projectRoutes from "./routes/projects.ts";

import sessionMiddleware from "./middleware/session.ts";

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
// app.use(requireApiKey);
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/", eventRoutes);
app.use("/", authRoutes);
app.use("/", projectRoutes);

app.listen(PORT, () => {
  console.log(`✅ Listening at http://localhost:${PORT}`);
});
