const express = require("express");
const router = express.Router();
const Match = require("../Match/MatchModel");
const {
  importAllMatches,
  importLeagueMatches,
  getSupportedLeagues
} = require("../Match/importService");

// GET all matches
router.get("/", async (req, res) => {
  try {
    const matches = await Match.find().sort({ date: 1 });
    res.status(200).json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET matches by league
router.get("/league/:league", async (req, res) => {
  try {
    const matches = await Match.find({ league: req.params.league }).sort({ date: 1 });
    res.status(200).json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET supported leagues
router.get("/import/leagues", async (req, res) => {
  try {
    const leagues = getSupportedLeagues();
    res.status(200).json({ leagues });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST import all matches
router.post("/import/all", async (req, res) => {
  try {
    const result = await importAllMatches();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST import specific league
router.post("/import/:leagueCode", async (req, res) => {
  try {
    const result = await importLeagueMatches(req.params.leagueCode);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
