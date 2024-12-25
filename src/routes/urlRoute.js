import express from "express";
import { createShortUrl, redirectUrl } from "../controllers/urlController.js";
import { authenticateUser } from "../middleware/auth.js";
import { createUrlLimiter } from "../middleware/rateLimiter.js";
import { enrichAnalytics } from "../middleware/analytics.js";

const router = express.Router();

router.post("/shorten", authenticateUser, createUrlLimiter, createShortUrl);
router.get("/:alias", enrichAnalytics, redirectUrl);

export default router;
