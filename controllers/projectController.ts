import { Router, Request, Response } from "express";

import type { RequestHandler } from "express";
import type { RequestWithUser } from "../types/requests.ts";
import type { Log } from "../types/log.ts";

import db from "../db/index.ts";
import verifyProjectOwnership from "../lib/verifyProjectOwnership.ts";

const getProjects: RequestHandler = (req, res) => {
  const user = (req as RequestWithUser).user;

  const rows = db
    .prepare("SELECT * FROM projects WHERE user_id = ? ORDER BY name ASC")
    .all(user.id);
  res.json(rows);
  return;
};

const getProject: RequestHandler = (req, res) => {
  const { id: projecId } = req.params;
  const user = (req as RequestWithUser).user;

  if (!verifyProjectOwnership(Number(projecId), user.id)) {
    res.status(403).json({ error: "Forbidden..." });
    return;
  }

  const logs = db
    .prepare(
      `SELECT logs.*, projects.name AS project_name
         FROM logs
         JOIN projects ON logs.project_id = projects.id
         WHERE logs.project_id = ?
         ORDER BY logs.created_at DESC`
    )
    .all(projecId);

  res.json(logs);
  return;
};

const getChannels: RequestHandler = (req, res) => {
  const { id: projecId } = req.params;
  const user = (req as RequestWithUser).user;

  if (!verifyProjectOwnership(Number(projecId), user.id)) {
    res.status(403).json({ error: "Forbidden..." });
    return;
  }

  const channels = db
    .prepare("SELECT DISTINCT channel FROM logs WHERE project_id = ?")
    .all(projecId) as { channel: Log["channel"] }[];

  res.json({ channels: channels.map((row) => row.channel) });
  return;
};

const getChannel: RequestHandler = (req, res) => {
  const { id: projectId, channel } = req.params;
  const user = (req as RequestWithUser).user;

  if (!verifyProjectOwnership(Number(projectId), user.id)) {
    res.status(403).json({ error: "Forbidden..." });
    return;
  }

  const logs = db
    .prepare(
      `SELECT * FROM logs
       WHERE project_id = ? AND channel = ?
       ORDER BY created_at DESC`
    )
    .all(projectId, channel) as Log[];

  res.json({ channel, logs });
  return;
};

const addProject: RequestHandler = (req, res) => {
  const { name } = req.body;
  const user = (req as RequestWithUser).user;

  if (!name) {
    res.status(400).json({ error: "Missing project name" });
    return;
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
  return;
};

export { getProjects, getProject, getChannels, getChannel, addProject };
