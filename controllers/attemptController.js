const Attempt = require("../models/Attempt");
const Event = require("../models/Event");
const { v4: uuidv4 } = require("uuid");

// Start Test
exports.startAssessment = async (req, res) => {
  try {
    const attemptId = uuidv4();
    const IP =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const newAttempt = await Attempt.create({
      attemptId,
      baselineIP: IP
    });

    res.status(201).json({
      message: "Assessment Started successfully",
      attemptId: newAttempt.attemptId
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// Chech IP
exports.checkIp = async (req, res) => {
  try {
    const { attemptId } = req.body;

    const currentIP =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const foundAttempt = await Attempt.findOne({ attemptId });

    if (!foundAttempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (currentIP !== foundAttempt.baselineIP) {

      await Event.create({
        attemptId,
        eventType: "IP_CHANGE_DETECTED",
        metadata: {
          previousIP: foundAttempt.baselineIP,
          currentIP
        }
      });

      foundAttempt.ipChangeCount += 1;
      foundAttempt.baselineIP = currentIP;

      if (foundAttempt.ipChangeCount >= 3) {
        foundAttempt.status = "SUSPICIOUS";
      }

      await foundAttempt.save();

      return res.json({
        changed: true,
        message: "IP changed detected",
        ipChangeCount: foundAttempt.ipChangeCount
      });
    }

    res.json({
      changed: false,
      message: "IP is same",
      ipChangeCount: foundAttempt.ipChangeCount
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET  Events
exports.getEvents = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const events = await Event.find({ attemptId });

    res.json({
      totalEvents: events.length,
      events
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET Attempt
exports.getAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    const attempt = await Attempt.findOne({ attemptId });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.json({
      attemptId: attempt.attemptId,
      baselineIP: attempt.baselineIP,
      ipChangeCount: attempt.ipChangeCount,
      startedAt: attempt.startedAt,
      status: attempt.status
    });

  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
