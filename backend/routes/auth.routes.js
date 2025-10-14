import express from "express";
import {
  getCurrentUser,
  gitLogin,
  logout,
  oauthLogin,
} from "../controlers/auth.controler.js";
import { authMiddleware } from "../middelware/auth.middelware.js";

const authRouter = express.Router();

authRouter.post("/google-auth", oauthLogin);
authRouter.post("/git-auth", authMiddleware, gitLogin);
authRouter.get("/get-current-user", authMiddleware, getCurrentUser);
authRouter.post("/logout", authMiddleware, logout);
export default authRouter;
