import mongoose from "mongoose";

const repoSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      index: true,
    },
    repoUrl: {
      type: String,
      required: true,
    },
    repoName: {
      type: String,
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
  },
  { timestamps: true }
);
const Repo = mongoose.model("Repo", repoSchema);

export default Repo;
