const mongoose = require("mongoose");

const AttemptSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    required: true,
    unique: true
  },
  baselineIP: {
    type: String,
    required: true
  },
  ipChangeCount: {
    type: Number,
    default: 0
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  status: {
  type: String,
  default: "NORMAL"
}

});

module.exports = mongoose.model("Attempt", AttemptSchema);
