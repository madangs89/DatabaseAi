import express from "express";
import { authMiddleware } from "../middelware/auth.middelware.js";
import {
  deleteSchemaById,
  getSchemaById,
  regenerateApiCodeAfterError,
} from "../controlers/schema.controler.js";

const schemaRouter = express.Router();

schemaRouter.get("/:projectId", getSchemaById);
schemaRouter.delete("/:projectId", authMiddleware, deleteSchemaById);
schemaRouter.post("/regenerate", authMiddleware, regenerateApiCodeAfterError);
export default schemaRouter;
