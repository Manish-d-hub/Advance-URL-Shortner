import crypto from "crypto";
import redisClient from "../config/redis.js";
import { Url } from "../models/urlModel.js";

const generateShortUrl = (length = 6) => {
  return crypto.randomBytes(length).toString("base64url");
};

const checkExistingAlias = async (customAlias) => {
  return await Url.findOne({
    $or: [{ shortUrl: customAlias }, { customAlias: customAlias }],
  });
};

const generateUniqueShortUrl = async () => {
  let shortUrl;
  while (true) {
    shortUrl = generateShortUrl();
    const existing = await checkExistingAlias(shortUrl);
    if (!existing) return shortUrl;
  }
};

const createShortUrl = async (userId, longUrl, customAlias, topic) => {
  try {
    // Check if this URL already exists for this user
    const existingUrl = await Url.findOne({ userId, longUrl });
    if (existingUrl) {
      return existingUrl;
    }

    let finalCustomAlias;
    let shortUrl;

    if (customAlias) {
      // Check if provided custom alias is available
      const existingAlias = await checkExistingAlias(customAlias);
      if (existingAlias) {
        throw new Error("Custom alias already exists");
      }
      finalCustomAlias = customAlias;
      shortUrl = customAlias;
    } else {
      // Generate both shortUrl and customAlias if not provided
      shortUrl = await generateUniqueShortUrl();
      finalCustomAlias = shortUrl;
    }

    const url = new Url({
      userId,
      longUrl,
      shortUrl,
      customAlias: finalCustomAlias,
      topic,
    });

    await url.save();
    // Cache the URL mapping
    await redisClient.set(`url:${shortUrl}`, longUrl, "EX", 86400);
    return url;
  } catch (error) {
    if (error.code === 11000) {
      throw new Error("A duplicate entry was detected. Please try again.");
    }
    throw error;
  }
};

const getLongUrl = async (shortUrl) => {
  try {
    // Check cache first
    const cachedUrl = await redisClient.get(`url:${shortUrl}`);
    if (cachedUrl) return cachedUrl;

    // If not in cache, check database
    const url = await Url.findOne({ shortUrl });
    if (!url) throw new Error("URL not found");

    // Cache the result
    await redisClient.set(`url:${shortUrl}`, url.longUrl, "EX", 86400);
    return url;
  } catch (error) {
    throw error;
  }
};

export { generateShortUrl, createShortUrl, getLongUrl };
