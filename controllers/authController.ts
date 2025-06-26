import db from "../db/index.ts";

import type { RequestHandler } from "express";
import type { User } from "../types/user.ts";

type RequestWithLogin = Request & {
  user: {
    id: User["id"];
    username: User["username"];
    created_at: User["created_at"];
  };
};

const handleLogin: RequestHandler = (req, res) => {
  const { id, username, created_at } = (req as unknown as RequestWithLogin)
    .user;
  res.send({ success: true, user: { id, username, created_at } });
};

const handleLogout = (req, res) => {
  req.logout(() => res.send({ success: true }));
};

const handleSignup = async (req, res) => {
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
};

const getMe = (req, res) => {
  if (req.isAuthenticated()) {
    const userId = req.user.id;
    const user = db
      .prepare(
        "SELECT id, username, api_key, created_at FROM users WHERE id = ?"
      )
      .get(userId);

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }

    res.send({ user });
  } else {
    res.status(401).send({ error: "Not logged in" });
  }
};

export { handleLogin, handleLogout, handleSignup, getMe };
