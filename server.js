require("dotenv").config();
const express = require("express");
const router = express.Router();
const path = require("path");
const session = require("express-session");
const passport = require("./config/passport");
const mongoose = require("mongoose");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const User = require("./src/models/userSchema");
const Itinerary = require("./src/models/itinerarySchema");

// MongoDB Connection using Mongoose
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error(
      process.env.MONGODB_URI,
      "❌ MongoDB connection error:",
      error
    );
    process.exit(1);
  }
};

// Connect to MongoDB
connectDB();

const app = express();
const port = process.env.PORT || 8080;

// Trust proxy - required for Render and other reverse proxies
app.set('trust proxy', 1);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: process.env.NODE_ENV === "production" ? 'none' : 'lax', // Required for cross-site cookies
    },
  })
);

// Initialize Passport and restore authentication state from session
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "build")));

app.get("/", async (req, res) => {
  res.sendFile(path.join(__dirname, "build/static/index.html"));
});

// Google OAuth Routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Successful authentication, redirect to frontend
    console.log('✅ Google auth successful for user:', req.user?.email);
    console.log('Session ID:', req.sessionID);
    console.log('Is authenticated:', req.isAuthenticated());
    res.redirect("/");
  }
);

// Get current user
app.get("/api/auth/user", (req, res) => {
  if (req.isAuthenticated()) {
    res.json({
      isAuthenticated: true,
      user: req.user,
    });
  } else {
    res.json({
      isAuthenticated: false,
      user: null,
    });
  }
});

// Logout route
app.get("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: "Logout failed" });
    }
    res.json({ message: "Logged out successfully" });
  });
});

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized. Please login first." });
};

// ==================== ITINERARY ROUTES ====================

// Get all itineraries for the logged-in user
app.get("/api/itineraries", isAuthenticated, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ userId: req.user._id })
      .sort({ date: -1 })
      .populate("userId", "name email profilePicture");

    res.json({ success: true, itineraries });
  } catch (error) {
    console.error("Error fetching itineraries:", error);
    res.status(500).json({ error: "Failed to fetch itineraries" });
  }
});

// Get a single itinerary by ID
app.get("/api/itineraries/:id", isAuthenticated, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id,
    }).populate("userId", "name email profilePicture");

    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    res.json({ success: true, itinerary });
  } catch (error) {
    console.error("Error fetching itinerary:", error);
    res.status(500).json({ error: "Failed to fetch itinerary" });
  }
});

// Create a new itinerary
app.post("/api/itineraries", isAuthenticated, async (req, res) => {
  try {
    const { title, date, locations } = req.body;

    // Validate required fields
    if (!title || !date) {
      return res.status(400).json({ error: "Title and date are required" });
    }

    const itinerary = await Itinerary.create({
      userId: req.user._id,
      title,
      date,
      locations: locations || [],
    });

    const populatedItinerary = await Itinerary.findById(itinerary._id).populate(
      "userId",
      "name email profilePicture"
    );

    res.status(201).json({
      success: true,
      message: "Itinerary created successfully",
      itinerary: populatedItinerary,
    });
  } catch (error) {
    console.error("Error creating itinerary:", error);
    res.status(500).json({ error: "Failed to create itinerary" });
  }
});

// Update an itinerary
app.put("/api/itineraries/:id", isAuthenticated, async (req, res) => {
  try {
    const { title, date, locations } = req.body;

    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    // Update fields
    if (title) itinerary.title = title;
    if (date) itinerary.date = date;
    if (locations) itinerary.locations = locations;
    itinerary.updatedAt = Date.now();

    await itinerary.save();

    const updatedItinerary = await Itinerary.findById(itinerary._id).populate(
      "userId",
      "name email profilePicture"
    );

    res.json({
      success: true,
      message: "Itinerary updated successfully",
      itinerary: updatedItinerary,
    });
  } catch (error) {
    console.error("Error updating itinerary:", error);
    res.status(500).json({ error: "Failed to update itinerary" });
  }
});

// Delete an itinerary
app.delete("/api/itineraries/:id", isAuthenticated, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    res.json({
      success: true,
      message: "Itinerary deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting itinerary:", error);
    res.status(500).json({ error: "Failed to delete itinerary" });
  }
});

// ==================== SHARE ITINERARY ROUTES ====================

// Configure email transporter - supports Gmail, Mailtrap, SendGrid, etc.
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Share an itinerary via email
app.post("/api/itineraries/:id/share", isAuthenticated, async (req, res) => {
  try {
    const { emails, password, message } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res
        .status(400)
        .json({ error: "Please provide at least one email address" });
    }

    if (!password || password.length < 4) {
      return res
        .status(400)
        .json({ error: "Password must be at least 4 characters" });
    }

    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    // Generate unique share token
    const shareToken = crypto.randomBytes(32).toString("hex");

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update itinerary with share info
    itinerary.shareToken = shareToken;
    itinerary.sharePassword = hashedPassword;
    itinerary.isShared = true;
    itinerary.sharedWith = [...new Set([...itinerary.sharedWith, ...emails])]; // Merge and dedupe
    itinerary.updatedAt = new Date();
    await itinerary.save();

    // Generate share link
    const clientUrl = (process.env.CLIENT_URL || "http://localhost:3000").replace(/\/$/, '');
    const shareLink = `${clientUrl}/shared/${shareToken}`;

    // Send emails to all recipients
    const emailPromises = emails.map((email) => {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: `${req.user.name} shared an itinerary with you: ${itinerary.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #478de9;">📍 Itinerary Shared With You</h2>
            <p><strong>${req.user.name}</strong> (${
          req.user.email
        }) has shared an itinerary with you:</p>
            
            <div style="background: #f8f9fa; border-left: 4px solid #478de9; padding: 15px; margin: 20px 0;">
              <h3 style="margin: 0 0 10px 0; color: #333;">${
                itinerary.title
              }</h3>
              <p style="margin: 0; color: #666;">
                📅 ${new Date(itinerary.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
              <p style="margin: 10px 0 0 0; color: #666;">
                📌 ${itinerary.locations.length} location(s)
              </p>
            </div>

            ${
              message
                ? `
              <div style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0;">
                <p style="margin: 0; color: #856404;"><strong>Message:</strong></p>
                <p style="margin: 5px 0 0 0; color: #856404;">${message}</p>
              </div>
            `
                : ""
            }

            <div style="background: #e7f3ff; padding: 15px; border-radius: 4px; margin: 20px 0;">
              <p style="margin: 0 0 10px 0; color: #333;"><strong>🔐 Production Password Required</strong></p>
              <p style="margin: 0; color: #666;">You'll need a password to view this itinerary. The person who shared it with you should provide the password separately for security.</p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${shareLink}" 
                 style="background: #478de9; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 500;">
                View Itinerary
              </a>
            </div>

            <p style="color: #999; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
              This is a secure link to view the itinerary. Do not share this link with unauthorized individuals.
            </p>
          </div>
        `,
      };

      return transporter.sendMail(mailOptions);
    });

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: `Itinerary shared with ${emails.length} recipient(s)`,
      shareLink,
      sharedWith: emails,
    });
  } catch (error) {
    console.error("Error sharing itinerary:", error);
    res
      .status(500)
      .json({ error: "Failed to share itinerary: " + error.message });
  }
});

// Get shared itinerary (public route, requires password)
app.post("/api/shared/:token", async (req, res) => {
  try {
    const { password } = req.body;
    const { token } = req.params;

    if (!password) {
      return res.status(400).json({ error: "Password required" });
    }

    const itinerary = await Itinerary.findOne({
      shareToken: token,
      isShared: true,
    }).populate("userId", "name email");

    if (!itinerary) {
      return res
        .status(404)
        .json({ error: "Itinerary not found or no longer shared" });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(
      password,
      itinerary.sharePassword
    );

    if (!passwordMatch) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Return itinerary without sensitive data
    const sharedData = {
      title: itinerary.title,
      date: itinerary.date,
      startLocation: itinerary.startLocation,
      endLocation: itinerary.endLocation,
      locations: itinerary.locations,
      sharedBy: {
        name: itinerary.userId.name,
        email: itinerary.userId.email,
      },
    };

    res.json({
      success: true,
      itinerary: sharedData,
    });
  } catch (error) {
    console.error("Error accessing shared itinerary:", error);
    res.status(500).json({ error: "Failed to access shared itinerary" });
  }
});

// Stop sharing an itinerary
app.post("/api/itineraries/:id/unshare", isAuthenticated, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!itinerary) {
      return res.status(404).json({ error: "Itinerary not found" });
    }

    itinerary.isShared = false;
    itinerary.shareToken = undefined;
    itinerary.sharePassword = undefined;
    itinerary.updatedAt = new Date();
    await itinerary.save();

    res.json({
      success: true,
      message: "Itinerary is no longer shared",
    });
  } catch (error) {
    console.error("Error unsharing itinerary:", error);
    res.status(500).json({ error: "Failed to unshare itinerary" });
  }
});

// ==================== TRAVEL TIME CALCULATION ====================

// Helper function to geocode address using free Nominatim API
async function geocodeAddress(address) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        address
      )}&limit=1`,
      {
        headers: {
          "User-Agent": "LocationSchedulerApp/1.0",
        },
      }
    );
    const data = await response.json();

    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
      };
    }
    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance; // Returns distance in kilometers
}

// Estimate driving time based on distance (assumes average speed)
function estimateDrivingTime(distanceKm) {
  // Assume average city driving speed of 40 km/h
  const avgSpeedKmh = 40;
  const timeHours = distanceKm / avgSpeedKmh;
  const timeMinutes = Math.round(timeHours * 60);
  return timeMinutes;
}

// Format duration for display
function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min${minutes !== 1 ? "s" : ""}`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours} hour${hours > 1 ? "s" : ""} ${mins} min${
    mins !== 1 ? "s" : ""
  }`;
}

// Calculate travel times between locations
app.post("/api/calculate-travel-times", isAuthenticated, async (req, res) => {
  try {
    const { origins, destinations } = req.body;

    if (
      !origins ||
      !destinations ||
      !Array.isArray(origins) ||
      !Array.isArray(destinations)
    ) {
      return res.status(400).json({ error: "Invalid origins or destinations" });
    }

    // For simplicity, we expect one origin and one destination per request
    const origin = origins[0];
    const destination = destinations[0];

    // Geocode both addresses
    const originCoords = await geocodeAddress(origin);
    const destCoords = await geocodeAddress(destination);

    if (!originCoords || !destCoords) {
      return res.status(400).json({
        error:
          "Could not geocode one or more addresses. Please check the addresses are valid.",
      });
    }

    // Calculate straight-line distance
    const distanceKm = calculateDistance(
      originCoords.lat,
      originCoords.lon,
      destCoords.lat,
      destCoords.lon
    );

    // Account for road routes being typically 20-30% longer than straight-line distance
    const roadDistanceKm = distanceKm * 1.25;

    // Estimate driving time
    const durationMinutes = estimateDrivingTime(roadDistanceKm);

    // Format response to match expected structure
    const mockResponse = {
      status: "OK",
      rows: [
        {
          elements: [
            {
              status: "OK",
              distance: {
                text: `${roadDistanceKm.toFixed(1)} km`,
                value: Math.round(roadDistanceKm * 1000), // in meters
              },
              duration: {
                text: formatDuration(durationMinutes),
                value: durationMinutes * 60, // in seconds
              },
            },
          ],
        },
      ],
    };

    res.json({
      success: true,
      data: mockResponse,
    });
  } catch (error) {
    console.error("Error calculating travel times:", error);
    res
      .status(500)
      .json({ error: "Failed to calculate travel times: " + error.message });
  }
});

// ==================== OLD TEST ROUTES ====================

app.get("/api/hello", async (req, res) => {
  try {
    const itineraries = await Itinerary.find({}).limit(5);
    res.json({
      message: "Hello from the API",
      authenticated: req.isAuthenticated(),
      user: req.user ? req.user.email : null,
      data: itineraries,
    });
  } catch (error) {
    res.json({ message: "Hello from the API", error: error.message });
  }
});

app.delete("/api/hello", async (req, res) => {
  res.json({ message: "DELETE request received" });
});

app.post("/api/hello", (req, res) => {
  res.json({ message: "POST request received" });
});

// ==================== CATCH-ALL ROUTE FOR REACT ROUTER ====================
// This must be AFTER all API routes
// Handles client-side routing (React Router) for paths like /shared/:token
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📦 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔐 Session secure cookies: ${process.env.NODE_ENV === "production"}`);
  console.log(`🌐 Client URL: ${process.env.CLIENT_URL || 'not set'}`);
  console.log(`🔑 Google callback URL: ${process.env.GOOGLE_CALLBACK_URL || 'using auto-detect'}`);
});
