import Project from "../models/project.model.js";
import Share from "../models/share.model.js";

export const createShareController = async (req, res) => {
  try {
    const { projectId } = req.body;
    const userId = req.user._id;

    if (!projectId || !userId)
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });

    const project = await Project.findById(projectId);
    if (!project)
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });

    const share = await Share.findOne({ projectId, userId });
    if (share) {
      return res
        .status(200)
        .json({ success: true, share, message: "Share already exists" });
    }
    const newShare = new Share({ projectId, userId });
    await newShare.save();
    return res
      .status(200)
      .json({ success: true, share: newShare, message: "Share created" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
