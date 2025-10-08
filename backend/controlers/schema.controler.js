import pubClient from "../app.js";
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

export const regenerateApiCodeAfterError = async (req, res) => {
  try {
    const { projectId, nodes, dbConvKey } = req.body;
    const userId = req.user_id;

    if (!projectId || (nodes && nodes.length == 0) || !userId) {
      return res.status(400).json({
        success: false,
        message: "All Fields are required",
        apiCodeStatus: 3,
      });
    }
    let apiCodeStatus = await pubClient.hGet("apiCodesStatus", userId);
    if (apiCodeStatus) {
      apiCodeStatus = JSON.parse(apiCodeStatus);
      const { projects } = apiCodeStatus;
      const project = projects.find((p) => p?.projectId == projectId);
      if (project) {
        return res.status(200).json({
          success: true,
          message:
            "Our Backend is already working on this project. Please do wait!!",
          apiCodeStatus: 2,
        });
      }
    }
    const data = { entities: nodes };

    pubClient.publish(
      "apiCode",
      JSON.stringify({
        projectId,
        data,
        userId,
        dbConvKey,
      })
    );
    return res.status(200).json({
      success: true,
      message: "Our Backend is Now working on this project. Please do wait!!",
      apiCodeStatus: 2,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to Regenerate again, Please Try again later",
      apiCodeStatus: 3,
    });
  }
};
