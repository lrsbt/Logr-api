import { Router, Request, Response } from "express";

import passport from "../passport.ts";
import db from "../db.ts";

const router = Router();

router.post("/login", passport.authenticate("local"), (req, res) => {
  const { id, username, created_at } = req.user;
  res.send({ success: true, user: { id, username, created_at } });
});

router.post("/logout", (req, res) => {
  req.logout(() => res.send({ success: true }));
});

router.get("/me", (req, res) => {
  if (req.isAuthenticated()) {
    const { id, username, created_at } = req.user;
    res.send({ user: { id, username, created_at } });
  } else {
    res.status(401).send({ error: "Not logged in" });
  }
});

export default router;
