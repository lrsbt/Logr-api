import { Router, Request, Response } from "express";
import requireApiKey from "../middleware/apiKey.ts";

import { addEvent } from "../controllers/eventController.ts";

const router = Router();

/*
  Post /data
*/

router.post("/data", requireApiKey, addEvent);

export default router;
