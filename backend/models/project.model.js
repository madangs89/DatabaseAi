import mongoose from "mongoose";
const ProjectSchema = new mongoose.Schema({
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
  title: { type: String, required: true },
  description: String,
  privacy: { type: String, enum: ["private", "public"], default: "private" },
  currentSchemaVersionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SchemaVersion",
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const Project = mongoose.model("Project", ProjectSchema);
export default Project;
