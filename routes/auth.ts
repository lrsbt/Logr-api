import { Router, Request, Response } from "express";

import db from "../db/index.ts";
import passport from "../lib/passport.ts";
import { createUser } from "../lib/createUser.ts";

const router = Router();

export const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.status(401).send("Not logged in");
};

router.post("/auth/login", passport.authenticate("local"), (req, res) => {
  const { id, username, created_at } = req.user;
  res.send({ success: true, user: { id, username, created_at } });
});

router.post("/auth/logout", (req, res) => {
  req.logout(() => res.send({ success: true }));
});

router.get("/auth/me", (req, res) => {
  if (req.isAuthenticated()) {
    const { id, username, created_at } = req.user;
    res.send({ user: { id, username, created_at } });
  } else {
    res.status(401).send({ error: "Not logged in" });
  }
});

router.post("/auth/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "Missing username or password" });
  }

  const userExists = db
    .prepare("SELECT id FROM users WHERE username = ?")
    .get(username);

  if (userExists) {
    return res.status(400).json({ error: "user already exists" });
  }

  const user = await createUser(username, password);

  res.send({ success: true, user });
});

export default router;
