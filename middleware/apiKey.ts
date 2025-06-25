import { Request, Response, NextFunction } from "express";

import db from "../db/index.ts";
import { User } from "../types/user.ts";
import { RequestWithUser } from "../types/requests.ts";

const requireApiKey = (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
): Response | void => {
  const apiKey = req.headers.authorization?.split(" ")[1]; // expects "Bearer <key>"

  if (!apiKey) {
    return res.status(401).json({ error: "Missing API key" });
  }

  const user = db
    .prepare("SELECT id FROM users WHERE api_key = ?")
    .get(apiKey) as User | undefined;

  if (!user) {
    return res.status(403).json({ error: "Invalid API key" });
  }

  req.user = { id: user.id }; // Attach user to request
  next();
};

export default requireApiKey;
