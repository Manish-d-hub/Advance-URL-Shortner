import jwt from "jsonwebtoken";
import passport from "../config/passport.js";
import { User } from "../models/userModel.js";

export const googleAuth = (req, res, next) => {
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })(req, res, next);
};

export const googleCallback = (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    if (err) {
      return res
        .status(500)
        .json({ error: err, message: "Authentication error" });
    }

    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, email: user.email, name: user.name },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d",
      }
    );

    res.status(200).json({
      message: "Authentication successful",
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  })(req, res, next);
};

// Get user profile
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-googleId");
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
