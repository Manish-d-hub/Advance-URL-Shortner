import { Analytics } from "../models/analyticsModel.js";
import { Url } from "../models/urlModel.js";
import redisClient from "../config/redis.js";
import crypto from "crypto";

const detectOS = (userAgent = "") => {
  if (!userAgent) return "Unknown";
  if (/windows/i.test(userAgent)) return "Windows";
  if (/macintosh|mac os/i.test(userAgent)) return "macOS";
  if (/linux/i.test(userAgent)) return "Linux";
  if (/android/i.test(userAgent)) return "Android";
  if (/ios|iphone|ipad/i.test(userAgent)) return "iOS";
  return "Other";
};

const detectDevice = (userAgent = "") => {
  if (!userAgent) return "unknown";
  if (/mobile|android|iphone|ipad|tablet/i.test(userAgent)) return "mobile";
  return "desktop";
};

const generateVisitorId = (req) => {
  try {
    const data = req.ip + (req.headers["user-agent"] || "unknown");
    return crypto.createHash("md5").update(data).digest("hex");
  } catch (error) {
    logger.error("Error generating visitor ID:", error);
    return crypto.randomBytes(16).toString("hex");
  }
};

const trackVisit = async (urlId, req) => {
  try {
    const analytics = new Analytics({
      urlId,
      userAgent: req.headers["user-agent"],
      ipAddress: req.ip,
      osType: detectOS(req.headers["user-agent"]),
      deviceType: detectDevice(req.headers["user-agent"]),
      uniqueVisitorId: generateVisitorId(req),
    });

    await analytics.save();
    await redisClient.set(`analytics:${urlId}`, "", "EX", 1);
  } catch (error) {
    logger.error("Error tracking visit:", error);
  }
};

const getUrlAnalytics = async (urlId) => {
  try {
    const cachedAnalytics = await redisClient.get(`analytics:${urlId}`);
    if (cachedAnalytics) return JSON.parse(cachedAnalytics);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const [totalClicks, uniqueClicks, clicksByDate, osStats, deviceStats] =
      await Promise.all([
        Analytics.countDocuments({ urlId }),
        Analytics.distinct("uniqueVisitorId", { urlId }).then(
          (visitors) => visitors.length
        ),
        Analytics.aggregate([
          { $match: { urlId, timestamp: { $gte: sevenDaysAgo } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Analytics.aggregate([
          { $match: { urlId } },
          {
            $group: {
              _id: "$osType",
              uniqueClicks: { $sum: 1 },
              uniqueUsers: { $addToSet: "$uniqueVisitorId" },
            },
          },
          {
            $project: {
              osName: "$_id",
              uniqueClicks: 1,
              uniqueUsers: { $size: "$uniqueUsers" },
            },
          },
        ]),
        Analytics.aggregate([
          { $match: { urlId } },
          {
            $group: {
              _id: "$deviceType",
              uniqueClicks: { $sum: 1 },
              uniqueUsers: { $addToSet: "$uniqueVisitorId" },
            },
          },
          {
            $project: {
              deviceName: "$_id",
              uniqueClicks: 1,
              uniqueUsers: { $size: "$uniqueUsers" },
            },
          },
        ]),
      ]);

    const analytics = {
      totalClicks,
      uniqueClicks,
      clicksByDate,
      osType: osStats,
      deviceType: deviceStats,
    };

    await redisClient.set(
      `analytics:${urlId}`,
      JSON.stringify(analytics),
      "EX",
      3600
    );
    return analytics;
  } catch (error) {
    logger.error("Error getting analytics:", error);
    throw error;
  }
};

const getUrlStats = async (url) => {
  const [urlClicks, urlUniqueClicks] = await Promise.all([
    Analytics.countDocuments({ urlId: url._id }),
    Analytics.distinct("uniqueVisitorId", { urlId: url._id }).then(
      (visitors) => visitors.length
    ),
  ]);

  return {
    shortUrl: url.shortUrl,
    totalClicks: urlClicks,
    uniqueClicks: urlUniqueClicks,
  };
};

const getTopicAnalytics = async (topic, userId) => {
  try {
    const urls = await Url.find({ topic, userId });
    const urlIds = urls.map((url) => url._id);

    const [totalClicks, uniqueClicks, clicksByDate, urlStats] =
      await Promise.all([
        Analytics.countDocuments({ urlId: { $in: urlIds } }),
        Analytics.distinct("uniqueVisitorId", { urlId: { $in: urlIds } }).then(
          (visitors) => visitors.length
        ),
        Analytics.aggregate([
          { $match: { urlId: { $in: urlIds } } },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Promise.all(urls.map(getUrlStats)),
      ]);

    return {
      totalClicks,
      uniqueClicks,
      clicksByDate,
      urls: urlStats,
    };
  } catch (error) {
    logger.error("Error getting topic analytics:", error);
    throw error;
  }
};

export {
  trackVisit,
  getUrlAnalytics,
  getTopicAnalytics,
  detectOS,
  detectDevice,
  generateVisitorId,
};
