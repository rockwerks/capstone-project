const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  locations: [{
    setName: { type: String, required: true },
    address: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    contactName: { type: String },
    contactPhone: { type: String },
    notes: { type: String },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
