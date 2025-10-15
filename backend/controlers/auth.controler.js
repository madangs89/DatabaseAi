import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { oauth2Client } from "../utils/helper.google.js";
import User from "../models/user.model.js";
import axios from "axios";
import { encrypt } from "../utils/helpers.service.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRES_IN = "7d";

// Helper to generate JWT
const generateToken = (user) => {
  return jwt.sign(
    {
      _id: user._id,
      email: user.email,
      name: user.name,
      plan: user.plan,
      avatarUrl: user.avatarUrl,
    },
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
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: "Internal server error", success: false });
  }
};

// ==================== OAuth Login/Signup ====================
export const oauthLogin = async (req, res) => {
  try {
    const { code } = req.body;
    const googleRes = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(googleRes.tokens);
    const userRes = await axios.get(
      "https://www.googleapis.com/oauth2/v2/userinfo",
      {
        headers: {
          Authorization: `Bearer ${googleRes.tokens.access_token}`,
        },
      }
    );
    const { id, email, name, picture } = userRes.data;

    let user = await User.findOne({ email });

    if (user) {
      const token = generateToken(user);
      setTokenCookie(res, token);
      return res.json({
        user,
        token,
        message: "Login successful",
        success: true,
      });
    }

    user = new User({
      email,
      name,
      avatarUrl: picture,
      oauthProviders: [{ provider: "google", providerId: id }],
    });
    await user.save();
    const token = generateToken(user);
    setTokenCookie(res, token);
    return res.json({
      user,
      token,
      message: "Login successful",
      success: true,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

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
    return res.json({
      user: req.user,
      success: true,
      message: "User found successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(401).json({ message: "Server error", success: false });
  }
};

export const gitLogin = async (req, res) => {
  const { code } = req.body;
  try {
    const userId = req.user._id;
    const user = req.user;
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GIT_CLIENT_ID,
        client_secret: process.env.GIT_SECRET_ID,
        code,
      },
      { headers: { Accept: "application/json" } }
    );
    console.log(process.env.GIT_CLIENT_ID, process.env.GIT_SECRET_ID);

    console.log(tokenRes.data.scope);

    let accessToken = tokenRes.data.access_token;
    if (!accessToken)
      return res.status(400).json({ message: "Invalid code", success: false });

    console.log(accessToken);
    // Step 5: Get user info
    const userRes = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    console.log(userRes.data);

    const { avatar_url, name } = userRes.data;

    accessToken = encrypt(accessToken);

    const userDetails = await User.findOneAndUpdate(
      { _id: userId },
      {
        $set: {
          gitAccessToken: accessToken,
          gitAvatarUrl: avatar_url,
          gitName: name,
        },
      },
      { new: true }
    );

    if (!userDetails) {
      return res
        .status(400)
        .json({ message: "User not found", success: false });
    }

    const token = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        name: user.name,
        plan: user.plan,
        avatarUrl: user.avatarUrl,
        gitAvatarUrl: avatar_url,
        gitName: name,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
    // Set JWT in HTTP-only cookie

    res.cookie("gitToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // use https in prod
      sameSite: "lax", // works for localhost
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.json({
      message: "Successfully done github auth",
      success: true,
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ message: "Failed to authenticate", success: false });
  }
};
