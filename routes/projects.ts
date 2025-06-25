import { Router, Request, Response } from "express";

import db from "../db/index.ts";
import requireApiKey from "../middleware/apiKey.ts";
import { RequestWithUser } from "../types/requests.ts";

const router = Router();

/*
  GET /projects
*/

router.get(
  "/projects/",
  requireApiKey,
  (req: RequestWithUser, res: Response) => {
    const user = req.user;

    const rows = db
      .prepare(
        "SELECT * FROM projects WHERE user_id = ? ORDER BY created_at DESC"
      )
      .all(user.id);
    res.json(rows);
  }
);

/*
  GET /projects/:id
*/

router.get(
  "/projects/:id",
  requireApiKey,
  (req: RequestWithUser, res: Response) => {
    const { id } = req.params;
    const user = req.user;

    // Check if project belongs to user
    const project = db
      .prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?")
      .get(id, user.id);

    if (!project) {
      return res
        .status(403)
        .json({ error: "Forbidden: Project not found or access denied" });
    }

    const logs = db
      .prepare(
        `SELECT logs.*, projects.name AS project_name
         FROM logs
         JOIN projects ON logs.project_id = projects.id
         WHERE logs.project_id = ?
         ORDER BY logs.created_at DESC`
      )
      .all(id);

    res.json(logs);
  }
);

/*
  GET /projects/:id/channels
*/

router.get("/projects/:id/channels", (req: RequestWithUser, res: Response) => {
  const id = Number(req.params.id);
  const user = req.user;

  // Check if project belongs to user
  const project = db
    .prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?")
    .get(id, user.id);

  if (!project) {
    return res
      .status(403)
      .json({ error: "Forbidden: Project not found or access denied" });
  }

  const channels = db
    .prepare("SELECT DISTINCT channel FROM logs WHERE project_id = ?")
    .all(id);

  res.json({ channels: channels.map((row) => row.channel) });
});

/*
  GET /projects/:id/channels/:channel
*/

router.get(
  "/projects/:id/channel/:channel",
  (req: RequestWithUser, res: Response) => {
    const id = Number(req.params.id);
    const channel = req.params.channel;
    const user = req.user;

    // Check if project belongs to user
    const project = db
      .prepare("SELECT id FROM projects WHERE id = ? AND user_id = ?")
      .get(id, user.id);

    if (!project) {
      return res
        .status(403)
        .json({ error: "Forbidden: Project not found or access denied" });
    }

    const logs = db
      .prepare(
        `SELECT * FROM logs
       WHERE project_id = ? AND channel = ?
       ORDER BY created_at DESC`
      )
      .all(id, channel);

    res.json({ logs });
  }
);

/*
  POST /projects
*/

router.post(
  "/projects/",
  requireApiKey,
  (req: RequestWithUser, res: Response): any => {
    const { name } = req.body;
    const user = req.user;

    if (!name) {
      return res.status(400).json({ error: "Missing project name or user" });
    }

    try {
      const stmt = db.prepare(
        "INSERT INTO projects (name, user_id) VALUES (?, ?)"
      );
      const result = stmt.run(name, user.id);

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
  }
);

export default router;
