require('dotenv').config();
const express = require('express');
const router = express.Router();
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');
const { MongoClient, ServerApiVersion } = require('mongodb');
const userSchema = require('./src/models/userSchema');
const itinerarySchema = require('./src/models/itinerarySchema');


const uri = process.env.MONGODB_URI;
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const app = express();
const port = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', async (req, res) => {
  res.sendFile(path.join(__dirname, 'build/static/index.html'));
});

// Google OAuth Routes
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email']
  })
);

app.get(
  '/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    res.redirect('/');
  }
);

// Get current user
app.get('/api/auth/user', (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null
    });
  }
});

// Logout route
app.get('/api/auth/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

app.get('/api/hello', async (req, res) => {
  const results = await client.db("locationscheduler").collection("itineraries").find({}).limit(5).toArray();
  res.json({ message: 'Hello from the API', data: results });
});

app.delete('/api/hello', async (req, res) => {
  res.json({ message: 'DELETE request received' });
});

app.post('/api/hello', (req, res) => {
  res.json({ message: 'POST request received' });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});     

