import mongoose from "mongoose";
const ProjectSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    title: { type: String, required: true },
    description: String,
    privacy: { type: String, enum: ["private", "public"], default: "private" },
    status: { type: String, enum: ["active", "inactive" , "completed"], default: "active" },
  },
  { timestamps: true }
);
const Project = mongoose.model("Project", ProjectSchema);
export default Project;
