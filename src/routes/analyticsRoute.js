import express from "express";
import {
  getUrlAnalytics,
  getTopicAnalytics,
  getOverallAnalytics,
} from "../controllers/analyticsController.js";
import { authenticateUser } from "../middleware/auth.js";
import { analyticsLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.use(authenticateUser);
router.use(analyticsLimiter);

router.get("/overall", getOverallAnalytics);
router.get("/:alias", getUrlAnalytics);
router.get("/topic/:topic", getTopicAnalytics);

export default router;
