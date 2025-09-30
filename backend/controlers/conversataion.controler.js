import mongoose from "mongoose";
import Conversation from "../models/conversatoin.model.js";

export const getPaginatedMessages = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        message: "Project Id is required",
        data: [],
      });
    }

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    const result = await Conversation.aggregate([
      { $match: { projectId: new mongoose.Types.ObjectId(projectId) } },
      { $unwind: "$messages" },
      { $sort: { "messages.createdAt": 1 } }, // oldest first
      { $skip: (pageNumber - 1) * limitNumber },
      { $limit: limitNumber },
      { $group: { _id: "$_id", messages: { $push: "$messages" } } },
    ]);

    const messages = result[0]?.messages || [];

    return res.json({
      success: true,
      data: messages,
      message: "Messages fetched successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Unable to get messages",
      data: [],
    });
  }
};
