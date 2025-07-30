const mongoose = require('mongoose');

const PARTICIPATION_MODES = require('../constants/participationModes.js');

const registrationSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true
  },
  phone: String,
  location: String,
  courseOfInterest: String,
  selectedSession: {
    type: String,
    enum: PARTICIPATION_MODES,
    default: 'Morning'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model('Registration', registrationSchema);
