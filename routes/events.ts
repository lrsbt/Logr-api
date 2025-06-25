import { Router, Request, Response } from "express";
import requireApiKey from "../middleware/apiKey.ts";

import db from "../db/index.ts";
import { User } from "../types/user.ts";
import { Project } from "../types/project.ts";
import { ensureAuthenticated } from "./auth.ts";
import { RequestWithUser } from "../types/requests.ts";

const router = Router();

router.post(
  "/data",
  requireApiKey,
  (req: RequestWithUser, res: Response): any => {
    const { project: projectName, channel = "default", event } = req.body;
    const user = req.user as { id: User["id"] }; // added to the request by requireApiKey

    // Check the params

    if (!projectName) {
      return res.status(400).json({ error: "Missing field: project name" });
    }

    if (!event) {
      return res.status(400).json({ error: "Missing field: event name" });
    }

    if (typeof event !== "string") {
      return res.status(400).json({ error: "Event must be a string" });
    }

    if (typeof channel !== "string") {
      return res.status(400).json({ error: "Channel must be a string" });
    }

    // Check project exists for this user

    type PartialProject = Pick<Project, "id" | "name">;

    const project = db
      .prepare("SELECT id, name FROM projects WHERE name = ? AND user_id = ?")
      .get(projectName, user.id) as PartialProject | undefined;

    if (!project) {
      return res.status(404).json({ error: "project not found" });
    }

    const result = db
      .prepare(
        `
    INSERT INTO logs (project_id, channel, event, created_at)
    VALUES (?, ?, ?, ?)
  `
      )
      .run(project.id, channel, event, new Date().toISOString());

    return res.json({ ok: true, id: result.lastInsertRowid });
  }
);

export default router;
