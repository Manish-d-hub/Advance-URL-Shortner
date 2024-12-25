import {
  getLongUrl,
  createShortUrl as shortenUrl,
} from "../services/urlService.js";
import { trackVisit } from "../services/analyticsService.js";
import { Url } from "../models/urlModel.js";
import { catchAsync } from "../utils/catchAsync.js";

export const createShortUrl = catchAsync(async (req, res) => {
  try {
    const { longUrl, customAlias, topic } = req.body;

    const url = await shortenUrl(req.user._id, longUrl, customAlias, topic);

    return res.status(201).json({
      shortUrl: `${process.env.BASE_URL}/api/url/${url.shortUrl}`,
      createdAt: url.createdAt,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export const redirectUrl = catchAsync(async (req, res) => {
  try {
    const { alias } = req.params;
    const url = await Url.findOne({ shortUrl: alias });
    if (!url) {
      return res.status(404).json({ error: "URL not found" });
    }

    const longUrl = await getLongUrl(alias);

    // Track analytics asynchronously
    Promise.resolve(trackVisit(url._id, req)).catch((error) =>
      logger.error("Analytics tracking error:", error)
    );

    return res.status(200).json({ urlData: longUrl });
  } catch (error) {
    logger.error("Redirect error:", error);
    return res.status(500).json({ error: "Server error" });
  }
});
