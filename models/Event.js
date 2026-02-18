const mongoose = require("mongoose");

const EventsSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    required: true
  },
  eventType: {
    type: String,
    required: true
  },
  metadata: {
    type: Object
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Event", EventsSchema);
