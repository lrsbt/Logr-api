import { Router, Request, Response } from "express";
import requireApiKey from "../middleware/apiKey.ts";

import {
  addProject,
  getChannel,
  getChannels,
  getProject,
  getProjects,
} from "../controllers/projectController.ts";

const router = Router();

/*
  GET /projects
*/

router.get("/projects", requireApiKey, getProjects);

/*
  GET /projects/:id
*/

router.get("/projects/:id", requireApiKey, getProject);

/*
  GET /projects/:id/channels
*/

router.get("/projects/:id/channels", requireApiKey, getChannels);

/*
  GET /projects/:id/channels/:channel
*/

router.get("/projects/:id/channels/:channel", requireApiKey, getChannel);

/*
  POST /projects
*/

router.post("/projects/", requireApiKey, addProject);

export default router;
