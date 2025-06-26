import db from "../db/index.ts";
import { User } from "../types/user.ts";
import { RequestWithUser } from "../types/requests.ts";

import type { RequestHandler } from "express";

const requireApiKey: RequestHandler = (req, res, next) => {
  const apiKey = req.headers.authorization?.split(" ")[1]; // expects "Bearer <key>"

  if (!apiKey) {
    res.status(401).json({ error: "Missing API key" });
    return;
  }

  const user = db
    .prepare("SELECT id FROM users WHERE api_key = ?")
    .get(apiKey) as User | undefined;

  if (!user) {
    res.status(403).json({ error: "Invalid API key" });
    return;
  }

  (req as RequestWithUser).user = { id: user.id }; // Attach user to request
  next();
};

export default requireApiKey;
