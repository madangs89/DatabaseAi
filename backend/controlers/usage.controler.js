import Usage from "../models/usage.model.js";

export const getTotalTokenUsage = async (req, res) => {
  try {
    const userId = req.user._id;

    if (!userId) {
      return res.status(400).json({
        message: "Unauthorized",
        success: false,
      });
    }
    const totalTokenUsage = await Usage.find({ ownerId: userId });
    console.log(totalTokenUsage);

    if (totalTokenUsage.length === 0) {
      return res.status(200).json({
        message: "Fetched Usage Token successfully",
        success: true,
        data: {
          ownerId: userId,
          promptTokens: 0,
          totalTokens: 0,
          completionTokens: 0,
        },
      });
    }

    if (totalTokenUsage.length && totalTokenUsage.length > 0) {
      let promptTokens = 0;
      let totalTokens = 0;
      let completionTokens = 0;
      totalTokenUsage.forEach((d) => {
        promptTokens += d?.promptTokens;
        totalTokens += d?.totalTokens;
        completionTokens += d?.completionTokens;
      });

      return res.status(200).json({
        message: "Fetched Usage Token successfully",
        success: true,
        data: {
          ownerId: userId,
          promptTokens: promptTokens,
          totalTokens: totalTokens,
          completionTokens: completionTokens,
        },
      });
    }
  } catch (error) {
    console.log(error);

    return res
      .status(500)
      .json({ message: "Unable to Fetch full token usage", success: false });
  }
};
