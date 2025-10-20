const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../src/models/userSchema');

// Serialize user for the session (save user ID to session)
passport.serializeUser((user, done) => {
  done(null, user._id);
});

// Deserialize user from the session (retrieve full user from DB)
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Configure Google OAuth Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 
        (process.env.NODE_ENV === 'production' 
          ? 'https://locationscheduler.onrender.com/auth/google/callback'
          : 'http://localhost:8080/auth/google/callback'),
      proxy: true
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        // Check if user already exists in database
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          // User exists, update their information
          user.name = profile.displayName;
          user.firstName = profile.name.givenName;
          user.lastName = profile.name.familyName;
          user.profilePicture = profile.photos[0]?.value;
          user.updatedAt = Date.now();
          await user.save();
          
          console.log('Existing user logged in:', user.email);
          return done(null, user);
        }

        // User doesn't exist, create new user
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          profilePicture: profile.photos[0]?.value,
          authProvider: 'google'
        });

        console.log('New user created:', user.email);
        return done(null, user);
      } catch (error) {
        console.error('Error in Google Strategy:', error);
        return done(error, null);
      }
    }
  )
);

module.exports = passport;
