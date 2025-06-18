import { Request, Response, NextFunction } from "express";
import { API_KEY } from "../config.ts";

const requireApiKey = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const key = req.headers["x-api-key"];

  if (req.method === "GET") {
    return next(); // Skip API key check for GET requests i.e. browser
  }

  if (key !== API_KEY) {
    res.status(403).json({ error: "[Api key issues]. Nice try, catto" });
    return;
  }

  next();
};

export { requireApiKey };
