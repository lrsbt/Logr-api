import db from "../db/index.ts";
import { Project } from "../types/project.ts";
import { RequestWithUser } from "../types/requests.ts";

import type { RequestHandler } from "express";

const addEvent: RequestHandler = (req, res) => {
  const { project: projectName, channel = "default", event } = req.body;
  const user = (req as RequestWithUser).user;

  // Check the params

  if (!projectName) {
    res.status(400).json({ error: "Missing field: project name" });
    return;
  }

  if (!event) {
    res.status(400).json({ error: "Missing field: event name" });
    return;
  }

  if (typeof event !== "string") {
    res.status(400).json({ error: "Event must be a string" });
    return;
  }

  if (typeof channel !== "string") {
    res.status(400).json({ error: "Channel must be a string" });
    return;
  }

  // Check project exists for this user

  type PartialProject = Pick<Project, "id" | "name">;

  const project = db
    .prepare("SELECT id, name FROM projects WHERE name = ? AND user_id = ?")
    .get(projectName, user.id) as PartialProject | undefined;

  if (!project) {
    res.status(404).json({ error: "project not found" });
    return;
  }

  const result = db
    .prepare(
      `
    INSERT INTO logs (project_id, channel, event, created_at)
    VALUES (?, ?, ?, ?)
  `
    )
    .run(project.id, channel, event, new Date().toISOString());

  res.json({ ok: true, id: result.lastInsertRowid });
  return;
};

export { addEvent };
