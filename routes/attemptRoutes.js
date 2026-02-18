const express = require("express");
const router = express.Router();
const {startTest,checkIp,getEvents,getAttempt}= require("../controllers/attemptController");

router.post("/start", startTest);
router.post("/checkIp", checkIp);
router.get("/events/:attemptId", getEvents);
router.get("/attempt/:attemptId", getAttempt);

module.exports = router;
