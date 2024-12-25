import {
  getUrlAnalytics as urlAnalytics,
  getTopicAnalytics as topicAnalytics,
} from "../services/analyticsService.js";
import { Url } from "../models/urlModel.js";
import { Analytics } from "../models/analyticsModel.js";

export const getUrlAnalytics = async (req, res) => {
  try {
    const { alias } = req.params;
    const url = await Url.findOne({ shortUrl: alias, userId: req.user._id });
    if (!url) throw new Error("URL not found");

    const analytics = await urlAnalytics(url._id);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getTopicAnalytics = async (req, res) => {
  try {
    const { topic } = req.params;
    const analytics = await topicAnalytics(topic, req.user._id);
    res.status(200).json(analytics);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getOverallAnalytics = async (req, res) => {
  try {
    const urls = await Url.find({ userId: req.user._id });
    const urlIds = urls.map((url) => url._id);

    const [totalUrls, analytics] = await Promise.all([
      urls.length,
      Analytics.aggregate([
        { $match: { urlId: { $in: urlIds } } },
        {
          $facet: {
            totalClicks: [{ $count: "count" }],
            uniqueClicks: [
              { $group: { _id: "$uniqueVisitorId" } },
              { $count: "count" },
            ],
            clicksByDate: [
              {
                $group: {
                  _id: {
                    $dateToString: { format: "%Y-%m-%d", date: "$timestamp" },
                  },
                  count: { $sum: 1 },
                },
              },
              { $sort: { _id: 1 } },
            ],
            osType: [
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
            ],
            deviceType: [
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
            ],
          },
        },
      ]),
    ]);

    const [analyticsData] = analytics;

    res.status(200).json({
      totalUrls,
      totalClicks: analyticsData.totalClicks[0]?.count || 0,
      uniqueClicks: analyticsData.uniqueClicks[0]?.count || 0,
      clicksByDate: analyticsData.clicksByDate,
      osType: analyticsData.osType,
      deviceType: analyticsData.deviceType,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
