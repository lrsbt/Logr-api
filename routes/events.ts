import { Router, Request, Response } from "express";
import { requireApiKey } from "../middleware/apiKey.ts";
import db from "../db.ts";

const router = Router();

// MOVE THIS
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.status(401).send("Not logged in");
}

// DEV protected test
router.get("/dev/all", ensureAuthenticated, (req, res) => {
  const rows = db.prepare("SELECT * FROM logs ORDER BY created_at DESC").all();
  res.json(rows);
});

// CATCH ACTUAL POST
router.post("/data", requireApiKey, (req: Request, res: Response): any => {
  const { project, channel = "default", event } = req.body;

  // Check for params

  if (!project) {
    return res.status(400).json({ error: "Missing field: project name" });
  }

  if (!event) {
    return res.status(400).json({ error: "Missing field: event name" });
  }

  //  Check project exists
  const projectExists = db
    .prepare("SELECT id, name FROM projects WHERE name = ?")
    .get(project);

  if (!projectExists) {
    return res.status(404).json({ error: "project not found" });
  }

  db.prepare(
    `
  INSERT INTO logs (project_id, channel, event, created_at)
  VALUES (?, ?, ?, ?)
`
  ).run(projectExists.id, channel, event, new Date().toISOString());

  return res.json({ ok: true });
});

export default router;
