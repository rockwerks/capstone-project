require('dotenv').config();
const express = require('express');
const router = express.Router();
const path = require('path');
const session = require('express-session');
const passport = require('./config/passport');
const mongoose = require('mongoose');
const User = require('./src/models/userSchema');
const Itinerary = require('./src/models/itinerarySchema');

// MongoDB Connection using Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

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

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized. Please login first.' });
};

// ==================== ITINERARY ROUTES ====================

// Get all itineraries for the logged-in user
app.get('/api/itineraries', isAuthenticated, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user._id })
      .sort({ date: -1 })
      .populate('userId', 'name email profilePicture');
    
    res.json({ success: true, itineraries });
  } catch (error) {
    console.error('Error fetching itineraries:', error);
    res.status(500).json({ error: 'Failed to fetch itineraries' });
  }
});

// Get a single itinerary by ID
app.get('/api/itineraries/:id', isAuthenticated, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('userId', 'name email profilePicture');

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    res.json({ success: true, itinerary });
  } catch (error) {
    console.error('Error fetching itinerary:', error);
    res.status(500).json({ error: 'Failed to fetch itinerary' });
  }
});

// Create a new itinerary
app.post('/api/itineraries', isAuthenticated, async (req, res) => {
  try {
    const { title, date, locations } = req.body;

    // Validate required fields
    if (!title || !date) {
      return res.status(400).json({ error: 'Title and date are required' });
    }

    const itinerary = await Itinerary.create({
      userId: req.user._id,
      title,
      date,
      locations: locations || []
    });

    const populatedItinerary = await Itinerary.findById(itinerary._id)
      .populate('userId', 'name email profilePicture');

    res.status(201).json({ 
      success: true, 
      message: 'Itinerary created successfully',
      itinerary: populatedItinerary 
    });
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({ error: 'Failed to create itinerary' });
  }
});

// Update an itinerary
app.put('/api/itineraries/:id', isAuthenticated, async (req, res) => {
  try {
    const { title, date, locations } = req.body;

    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    // Update fields
    if (title) itinerary.title = title;
    if (date) itinerary.date = date;
    if (locations) itinerary.locations = locations;
    itinerary.updatedAt = Date.now();

    await itinerary.save();

    const updatedItinerary = await Itinerary.findById(itinerary._id)
      .populate('userId', 'name email profilePicture');

    res.json({ 
      success: true, 
      message: 'Itinerary updated successfully',
      itinerary: updatedItinerary 
    });
  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({ error: 'Failed to update itinerary' });
  }
});

// Delete an itinerary
app.delete('/api/itineraries/:id', isAuthenticated, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerary not found' });
    }

    res.json({ 
      success: true, 
      message: 'Itinerary deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting itinerary:', error);
    res.status(500).json({ error: 'Failed to delete itinerary' });
  }
});

// ==================== OLD TEST ROUTES ====================

app.get('/api/hello', async (req, res) => {
  try {
    const itineraries = await Itinerary.find({}).limit(5);
    res.json({ 
      message: 'Hello from the API', 
      authenticated: req.isAuthenticated(),
      user: req.user ? req.user.email : null,
      data: itineraries 
    });
  } catch (error) {
    res.json({ message: 'Hello from the API', error: error.message });
  }
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

