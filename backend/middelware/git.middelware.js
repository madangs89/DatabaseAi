import jwt from "jsonwebtoken";
export const gitMiddleware = (req, res, next) => {
  try {
    const token = req.cookies.gitToken;
    if (!token)
      return res.status(401).json({ message: "Unauthorized", success: false });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Unauthorized", success: false });
  }
};
