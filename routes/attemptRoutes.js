const express = require("express");
const router = express.Router();
const controller = require("../controllers/attemptController");

router.post("/start", controller.startAssessment);
router.post("/checkIp", controller.checkIp);
router.get("/events/:attemptId", controller.getEvents);
router.get("/attempt/:attemptId", controller.getAttempt);

module.exports = router;
