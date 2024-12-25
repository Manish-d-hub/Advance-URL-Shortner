// Load environment variables
import "dotenv/config";
import express from "express";

import passport from "./config/passport.js";
import { logger } from "./config/redis.js";
import indexRouter from "./routes/router.js";

// Initialize express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// Routes
app.use("/api", indexRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: "Something broke!" });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
