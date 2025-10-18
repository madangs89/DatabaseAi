import express from "express";
import { authMiddleware } from "../middelware/auth.middelware.js";
import { createShareController } from "../controlers/share.controler.js";

const shareRouter = express.Router();

shareRouter.post("/", authMiddleware, createShareController);

export default shareRouter;
