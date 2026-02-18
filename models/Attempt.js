const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    required: true,
    unique: true
  },

  // IP when assessment started (never changes)
  baselineIP: {
    type: String,
    required: true
  },

  // Last IP we already processed
  lastDetectedIP: {
    type: String,
    required: true
  },

  ipChangeCount: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["NORMAL", "SUSPICIOUS"],
    default: "NORMAL"
  },

  startedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Attempt", AttemptSchema);
