const mongoose = require("mongoose");

const EventsSchema = new mongoose.Schema(
  {
    attemptId: {
      type: String,
      required: true,
      index: true
    },
    eventType: {
      type: String,
      required: true
    },
    metadata: {
      type: Object,
      default: {}
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", EventsSchema);