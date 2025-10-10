import mongoose from "mongoose";
const SchemaVersionSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
      required: true,
    },
    version: { type: Number, default: 1, required: true }, // v1, "Initial", "Add ratings"
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    nodes: { type: Array, default: [], required: true },
    edges: { type: Array, default: [], required: true },
    apiCodes: { type: Object },
    dbConvKey: { type: String },
  },
  { timestamps: true }
);

const SchemaVersion = mongoose.model("SchemaVersion", SchemaVersionSchema);
export default SchemaVersion;
