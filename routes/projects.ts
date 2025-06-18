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

// GET /projects/1
router.get("/:id", (req: Request, res: Response) => {
  const { id } = req.params;

  const logs = db
    .prepare("SELECT * FROM logs WHERE project_id = ? ORDER BY created_at DESC")
    .all(id);

  res.json(logs);
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
