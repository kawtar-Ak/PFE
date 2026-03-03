const mongoose = require("mongoose");

const MatchSchema = new mongoose.Schema({
  apiMatchId: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  homeTeam: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  awayTeam: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  homeScore: {
    type: Number,
    default: null
  },
  awayScore: {
    type: Number,
    default: null
  },
  date: {
    type: Date,
    required: true
  },
  league: {
    type: String,
    required: true
  },
  leagueCode: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ["scheduled", "live", "finished"],
    default: "scheduled"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Match", MatchSchema);
