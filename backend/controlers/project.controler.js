import Project from "../models/project.model.js";

export const createProject = async (req, res) => {
  try {
    const { title, description, privacy, status } = req.body;
    const project = new Project({
      ownerId: req.user?._id || req.body.ownerId,
      title,
      description,
      privacy,
      status,
    });
    await project.save();
    res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const userId = req.user?._id;
    let projects = await Project.find({ ownerId: userId }).sort({
      createdAt: -1,
    });
    if (!projects || projects.length === 0) {
      projects = [];
    }
    res.status(200).json({
      success: true,
      data: projects,
      message: "Projects fetched successfully",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    res.status(200).json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Update a project
export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, privacy, status } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }

    if (req.user._id.toString() !== project.ownerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this project",
      });
    }
    project.title = title || project.title;
    project.description = description || project.description;
    project.privacy = privacy || project.privacy;
    project.status = status || project.status;
    await project.save();

    res
      .status(200)
      .json({
        success: true,
        data: project,
        message: "Project updated successfully",
      });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Delete a project
export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return res
        .status(404)
        .json({ success: false, message: "Project not found" });
    }
    if (req.user._id.toString() !== project.ownerId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to delete this project",
      });
    }

    await Project.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .json({ success: true, message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
