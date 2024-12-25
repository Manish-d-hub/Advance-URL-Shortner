import { Schema } from "mongoose";
import db from "../config/dbmaster.js";

const analyticsSchema = new Schema({
  urlId: {
    type: Schema.Types.ObjectId,
    ref: "Url",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  userAgent: String,
  ipAddress: String,
  location: {
    country: String,
    city: String,
  },
  osType: String,
  deviceType: String,
  uniqueVisitorId: String,
});

analyticsSchema.index({ urlId: 1, timestamp: -1 });
analyticsSchema.index({ urlId: 1, uniqueVisitorId: 1 });

export const Analytics = db.model("Analytics", analyticsSchema);
