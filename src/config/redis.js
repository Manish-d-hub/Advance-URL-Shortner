import Redis from "ioredis";
import winston from "winston";

export const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
      maxsize: 5 * 1024 * 1024,
      maxFiles: 5,
    }),
    new winston.transports.File({
      filename: "combined.log",
      maxsize: 10 * 1024 * 1024,
      maxFiles: 3,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    })
  );
}

let redisUrl =
  process.env.NODE_ENV === "production"
    ? process.env.REDIS_PROD_URL
    : process.env.REDIS_URL;

const redisClient = new Redis(redisUrl);

redisClient.on("error", (error) => {
  logger.error("Redis connection error:", error);
});

redisClient.on("connect", () => {
  logger.info("Redis connected successfully");
});

export default redisClient;
