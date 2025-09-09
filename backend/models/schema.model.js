import mongoose from "mongoose";
const SchemaVersionSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    index: true,
  },
  name: String, // v1, "Initial", "Add ratings"
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  entities: { type: Array, default: [] }, // full entities[] JSON from LLM
  relationships: { type: Array, default: [] }, // relationships[] JSON from LLM
  explanations: { type: Object, default: {} }, // explanations object
  ddlByTarget: { type: Object, default: {} }, // { postgres: "...", mysql: "..." }
  erDiagramSvgKey: String, // S3 key or null
  changeNotes: String,
  createdAt: { type: Date, default: Date.now },
});

const SchemaVersion = mongoose.model("SchemaVersion", SchemaVersionSchema);

export default SchemaVersion;
