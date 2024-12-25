import mongoose from "mongoose";
import { logger } from "./redis.js";

const dbUrl = process.env.DB_URL.replace("<db_password>", process.env.DB_PASS);

const db = mongoose.createConnection(dbUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.on("connected", () => {
  logger.info("Mongoose connection open to master DB");
});

db.on("error", (err) => {
  logger.debug(`Mongoose connection error for master DB: ${err}`);
});

db.on("disconnected", () => {
  logger.debug("Mongoose connection disconnected for master DB");
});

db.on("reconnected", () => {
  logger.info("Mongoose connection reconnected for master DB");
});

// If the Node process ends, close the Mongoose connection
process.on("SIGINT", () => {
  db.close(() => {
    logger.debug(
      "Mongoose connection disconnected for master DB via app termination"
    );
    process.exit(0);
  });
});

export default db;
