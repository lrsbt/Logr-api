import { Router, Request, Response } from "express";
import { requireApiKey } from "../middleware/apiKey.ts";
import db from "../db.ts";

const router = Router();

// GET /projects
router.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM projects ORDER BY created_at DESC")
    .all();
  res.json(rows);
});

// GET /projects/:id
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const logs = db
    .prepare("SELECT * FROM logs WHERE project_id = ? ORDER BY created_at DESC")
    .all(id);

  res.json(logs);
});

// GET /projects/:id/channels
router.get("/:id/channels", (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const project = db.prepare("SELECT id FROM projects WHERE id = ?").get(id);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const channels = db
    .prepare("SELECT DISTINCT channel FROM logs WHERE project_id = ?")
    .all(id);

  res.json({ channels: channels.map((row) => row.channel) });
});

// GET /projects/:id/channels/:channel
router.get("/:id/channel/:channel", (req: Request, res: Response) => {
  const projectId = Number(req.params.id);
  const channel = req.params.channel;

  const project = db
    .prepare("SELECT id FROM projects WHERE id = ?")
    .get(projectId);

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  const logs = db
    .prepare(
      `SELECT * FROM logs
       WHERE project_id = ? AND channel = ?
       ORDER BY created_at DESC`
    )
    .all(projectId, channel);

  res.json({ logs });
});

// POST /projects
router.post("/", requireApiKey, (req: Request, res: Response): any => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Please provide a project name." });
  }

  try {
    const stmt = db.prepare("INSERT INTO projects (name) VALUES (?)");
    const result = stmt.run(name);
    res.status(201).json({ id: result.lastInsertRowid, name });
  } catch (err: any) {
    const error = err as Error & { code?: string };
    if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
      res.status(409).json({ error: "Project already exists." });
    } else {
      res.status(500).json({ error: "Database error." });
    }
  }
});

export default router;
