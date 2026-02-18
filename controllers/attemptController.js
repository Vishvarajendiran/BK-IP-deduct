const Attempt = require("../models/Attempt");
const Event = require("../models/Event");
const { v4: uuidv4 } = require("uuid");

// Start Test
const startTest = async (req, res) => {
  try {
    const attemptId = uuidv4();

    const currentIP =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const newAttempt = await Attempt.create({
      attemptId,
      baselineIP: currentIP,
      lastDetectedIP: currentIP,
      ipChangeCount: 0,
      status: "NORMAL"
    });

    await Event.create({
      attemptId,
      eventType: "IP_CAPTURED_INITIAL",
      metadata: { ip: currentIP }
    });

    res.json({ attemptId });

  } catch (err) {
    console.error("Start test error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// Chech IP
const checkIp = async (req, res) => {
  try {
    const { attemptId } = req.body;

    if (!attemptId) {
      return res.status(400).json({ message: "Attempt ID is required" });
    }

    const currentIP =
      req.headers["x-forwarded-for"]?.split(",")[0] ||
      req.socket.remoteAddress;

    const foundAttempt = await Attempt.findOne({ attemptId });

    if (!foundAttempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    // If IP hasn't changed since last poll
    if (currentIP === foundAttempt.lastDetectedIP) {
      return res.json({
        changed: false,
        ipChangeCount: foundAttempt.ipChangeCount,
        status: foundAttempt.status
      });
    }

    // Real transition detected
    await Event.create({
      attemptId,
      eventType: "IP_CHANGE_DETECTED",
      metadata: {
        baselineIP: foundAttempt.baselineIP,
        previousIP: foundAttempt.lastDetectedIP,
        currentIP
      }
    });

    // Only increment if different from original baseline
    if (currentIP !== foundAttempt.baselineIP) {
      foundAttempt.ipChangeCount += 1;
    }

    foundAttempt.lastDetectedIP = currentIP;

    if (foundAttempt.ipChangeCount >= 3) {
      foundAttempt.status = "SUSPICIOUS";
    }

    await foundAttempt.save();

    res.json({
      changed: true,
      ipChangeCount: foundAttempt.ipChangeCount,
      status: foundAttempt.status
    });

  } catch (err) {
    console.error("Check IP error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// GET  Events
const getEvents = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({ message: "Attempt ID is required" });
    }

    const events = await Event.find({ attemptId })
      .sort({ createdAt: 1 }) // oldest first
      .lean();

    res.json({
      totalEvents: events.length,
      events
    });

  } catch (err) {
    console.error("Get events error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};


// GET Attempt
const getAttempt = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({ message: "Attempt ID is required" });
    }

    const attempt = await Attempt.findOne({ attemptId }).lean();

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    res.json({
      attemptId: attempt.attemptId,
      baselineIP: attempt.baselineIP,
      lastDetectedIP: attempt.lastDetectedIP,
      ipChangeCount: attempt.ipChangeCount,
      startedAt: attempt.startedAt,
      status: attempt.status
    });

  } catch (err) {
    console.error("Get attempt error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {startTest,checkIp,getEvents,getAttempt}