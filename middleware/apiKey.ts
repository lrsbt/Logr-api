import { Request, Response, NextFunction } from "express";
import { API_KEY } from "../config.ts";

import db from "../db/index.ts";

const requireApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const apiKey = req.headers.authorization?.split(" ")[1]; // expects "Bearer <key>"

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  const user = db.prepare("SELECT * FROM users WHERE api_key = ?").get(apiKey);

  if (!user) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  req.user = user; // Attach user to request
  next();
};

export default requireApiKey;
