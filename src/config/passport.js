// src/config/passport.js
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/userModel.js";

// Initialize and configure Google Strategy before exporting passport
const googleStrategyConfig = {
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "http://localhost:3000/api/auth/google/callback",
  scope: ["profile", "email"],
};

// Add error handling for missing environment variables
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  logger.error(
    "Missing required Google OAuth credentials in environment variables"
  );
  process.exit(1);
}

passport.use(
  new GoogleStrategy(
    googleStrategyConfig,
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          // Create new user if doesn't exist
          user = await User.create({
            googleId: profile.id,
            email: profile.emails[0].value,
            name: profile.displayName,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

export default passport;
