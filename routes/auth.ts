import { Router, Request, Response } from "express";

import db from "../db/index.ts";
import passport from "../lib/passport.ts";
import { createUser } from "../lib/createUser.ts";
import {
  getMe,
  handleLogin,
  handleLogout,
  handleSignup,
} from "../controllers/authController.ts";

const router = Router();

/*
  Post /auth/login
*/

router.post("/auth/login", passport.authenticate("local"), handleLogin);

/*
  Post /auth/logout
*/

router.post("/auth/logout", handleLogout);

/*
  Post /auth/signup
  username: string
  password: string
*/

router.post("/auth/signup", handleSignup);

/*
  Get /auth/me
*/

router.get("/auth/me", getMe);

export default router;
