import { Schema } from "mongoose";
import db from "../config/dbmaster.js";

const urlSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  longUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  customAlias: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  topic: {
    type: String,
    enum: ["acquisition", "activation", "retention", null],
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add compound index to prevent duplicate combinations
urlSchema.index({ userId: 1, longUrl: 1 }, { unique: true });
export const Url = db.model("Url", urlSchema);
