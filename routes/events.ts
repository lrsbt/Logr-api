import { Router, Request, Response } from "express";
import db from "../db.ts";

const router = Router();

// DEV
router.get("/dev/all", (req, res) => {
  const rows = db.prepare("SELECT * FROM logs ORDER BY created_at DESC").all();
  res.json(rows);
});

// CATCH ACTUAL POST
router.post("/data", (req: Request, res: Response): any => {
  const { project, channel = "default", event } = req.body;

  if (!project) {
    return res.status(400).json({
      error: "missing_field",
      message: "Please provide a project name.",
    });
  }

  if (!event) {
    return res.status(400).json({
      error: "missing_field",
      message: "Please provide an event name.",
    });
  }

  db.prepare(
    `
    INSERT INTO logs (project, channel, event, created_at)
    VALUES (?, ?, ?, ?)
  `
  ).run(project, channel, event, new Date().toISOString());

  return res.json({ ok: true });
});

export default router;
