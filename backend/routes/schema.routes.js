import express from "express";
import { authMiddleware } from "../middelware/auth.middelware.js";
import {
  deleteSchemaById,
  getSchemaById,
} from "../controlers/schema.controler.js";

const schemaRouter = express.Router();

schemaRouter.get("/:projectId", getSchemaById);
schemaRouter.delete("/:projectId", authMiddleware, deleteSchemaById);
export default schemaRouter;
