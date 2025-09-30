import Project from "../models/project.model.js";
import SchemaVersion from "../models/schema.model.js";

export const getSchemaById = async (req, res) => {
  try {
    const { projectId } = req.params;
    if (!projectId) {
      return res
        .status(400)
        .json({ message: "Project id is required", success: false });
    }
    const project = await Project.findById(projectId);
    if (!project) {
      return res
        .status(404)
        .json({ message: "Project not found", success: false });
    }
    const schema = await SchemaVersion.findOne({
      projectId: projectId,
    });

    if (!schema) {
      return res
        .status(404)
        .json({ message: "Schema not found", success: false });
    }

    return res.status(200).json({
      success: true,
      data: schema,
      message: "Schema fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSchemaById = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id;
    const schema = await SchemaVersion.findOne({
      projectId: projectId,
    });
    if (!schema) {
      return res
        .status(404)
        .json({ message: "Schema not found", success: false });
    }
    if (schema.ownerId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this schema",
      });
    }

    await SchemaVersion.findByIdAndDelete(schema._id);
    return res.status(200).json({
      success: true,
      message: "Schema deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
