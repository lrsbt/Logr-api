import { Router, Request, Response } from "express";
import requireApiKey from "../middleware/apiKey.ts";
import db from "../db/index.ts";

const router = Router();

// GET /projects
router.get("/", requireApiKey, (_req, res) => {
  // TODO this needs to be limited down to the projects the user can atually access

  const rows = db
    .prepare("SELECT * FROM projects ORDER BY created_at DESC")
    .all();
  res.json(rows);
});

// GET /projects/:id
router.get("/:id", requireApiKey, (req: Request, res: Response) => {
  // TODO this needs to be limited down to the projects the user can atually access

  const { id } = req.params;

  const logs = db
    // .prepare("SELECT * FROM logs WHERE project_id = ? ORDER BY created_at DESC")
    .prepare(
      `SELECT logs.*, projects.name AS project_name
       FROM logs
       JOIN projects ON logs.project_id = projects.id
       WHERE logs.project_id = ?
       ORDER BY logs.created_at DESC;
      `
    )
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
  const user = req.user; // added to the request by requireApiKey

  if (!name || !user) {
    return res.status(400).json({ error: "Missing project name or user" });
  }

  try {
    const stmt = db.prepare(
      "INSERT INTO projects (name, user_id) VALUES (?, ?)"
    );
    const result = stmt.run(name, parseInt(user.id));
    res.json({
      success: true,
      project: { id: result.lastInsertRowid, name },
    });
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
