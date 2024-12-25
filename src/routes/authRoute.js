// src/routes/authRoutes.js
import express from "express";
import {
  googleAuth,
  googleCallback,
  getUserProfile,
} from "../controllers/authController.js";
import { authenticateUser } from "../middleware/auth.js";

const router = express.Router();

router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);
router.get("/profile", authenticateUser, getUserProfile);

export default router;
