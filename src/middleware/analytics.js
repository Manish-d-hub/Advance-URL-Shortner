import geoip from "geoip-lite";

export const enrichAnalytics = (req, res, next) => {
  const ip = req.ip;
  const geo = geoip.lookup(ip);

  if (geo) {
    req.geoLocation = {
      country: geo.country,
      city: geo.city,
    };
  }

  next();
};
