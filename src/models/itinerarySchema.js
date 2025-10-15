const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startLocation: { 
    name: { type: String },
    address: { type: String },
    time: { type: String }
  },
  endLocation: { 
    name: { type: String },
    address: { type: String },
    time: { type: String }
  },
  locations: [{
    setName: { type: String, required: true },
    address: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    contactName: { type: String },
    contactPhone: { type: String },
    notes: { type: String },
    status: { type: String, enum: ['pending', 'completed', 'skipped'], default: 'pending' },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  shareToken: { type: String, unique: true, sparse: true },
  sharePassword: { type: String },
  isShared: { type: Boolean, default: false },
  sharedWith: [{ type: String }], // Array of email addresses
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
