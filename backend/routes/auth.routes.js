import express from "express";
import { getCurrentUser, oauthLogin } from "../controlers/auth.controler.js";
import { authMiddleware } from "../middelware/auth.middelware.js";

const authRouter = express.Router();

authRouter.post("/google-auth", oauthLogin);
authRouter.get("/get-current-user", authMiddleware, getCurrentUser);
export default authRouter;
