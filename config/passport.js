const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Serialize user for the session
passport.serializeUser((user, done) => {
  done(null, user);
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
  done(null, user);
});

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:8080/auth/google/callback',
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Extract user information from Google profile
        const user = {
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          profilePicture: profile.photos[0]?.value,
          accessToken: accessToken
        };

        // Here you can save the user to your database
        // For now, we'll just return the user object
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
