import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "7d";

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, plan: user.plan },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};
// Set JWT in HTTP-only cookie
const setTokenCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // use https in prod
    sameSite: "lax", // works for localhost
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};
// ==================== Email Signup ====================
export const signupWithEmail = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, hashedPassword });

    if (!user) {
      return res
        .status(500)
        .json({ error: "Internal server error", success: false });
    }

    const token = generateToken(user);
    setTokenCookie(res, token);

    return res.status(201).json({
      user,
      token,
      message: "User created successfully",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// ==================== Email Login ====================
export const loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "All fields are required", success: false });
    }
    const user = await User.findOne({ email });
    if (!user || !user.hashedPassword)
      return res
        .status(400)
        .json({ message: "User not found", success: false });

    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch)
      return res
        .status(400)
        .json({ message: "Invalid credentials", success: false });

    const token = generateToken(user);
    setTokenCookie(res, token);

    return res.json({
      user,
      token,
      success: true,
      message: "Login successful",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// ==================== OAuth Login/Signup ====================
// export const oauthLogin = async (req, res) => {
//   try {
//     const { provider, providerId, email, name } = req.body; // assume frontend sends these after Google OAuth

//     let user = await User.findOne({
//       "oauthProviders.providerId": providerId,
//       "oauthProviders.provider": provider,
//     });

//     if (!user) {
//       user = await User.findOne({ email });
//       if (user) {
//         user.oauthProviders.push({ provider, providerId, email });
//         await user.save();
//       } else {
//         user = await User.create({
//           name,
//           email,
//           oauthProviders: [{ provider, providerId, email }],
//         });
//       }
//     }

//     const token = generateToken(user);
//     setTokenCookie(res, token);

//     return res.json({ user, token });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({ error: "Internal server error" });
//   }
// };

// ==================== Logout ====================
export const logout = (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, sameSite: "lax" });
    return res.json({ message: "Logged out successfully", success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error", success: false });
  }
};

// ==================== Get Current User ====================
export const getCurrentUser = async (req, res) => {
  try {
    const userId = req.user._id;
    if (!userId)
      return res.status(401).json({ message: "Unauthorized", success: false });
    const user = await User.findById({ _id: userId }).select("-hashedPassword");
    if (!user)
      return res
        .status(401)
        .json({ message: "User not found", success: false });
    return res.json({
      user,
      success: true,
      message: "User found successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Server error", success: false });
  }
};
