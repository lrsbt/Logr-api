import { User } from "./user.ts";
import { Request } from "express";

export interface RequestWithUser extends Request {
  user: { id: User["id"] };
}
