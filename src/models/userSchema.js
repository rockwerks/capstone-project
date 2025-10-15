const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Google OAuth fields
  googleId: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  profilePicture: { type: String },
  
  // Traditional login fields (optional, for future use)
  password: { type: String },
  
  // Metadata
  authProvider: { type: String, enum: ['google', 'local'], default: 'google' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt timestamp before saving
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);