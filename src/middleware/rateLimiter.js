import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";

export const createRateLimiter = (options) => {
  return rateLimit({
    store: new RedisStore({
      sendCommand: (...args) => redisClient.call(...args),
    }),
    windowMs: options.windowMs || 15 * 60 * 1000, // Default 15 minutes
    max: options.max || 100, // Default 100 requests per window
    message: options.message || "Too many requests, please try again later",
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// Create specific limiters
export const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
});

export const createUrlLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: "URL creation limit exceeded",
});

export const analyticsLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
});
