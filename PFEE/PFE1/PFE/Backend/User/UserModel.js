const mongoose = require("mongoose");

const AuthenticatedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },

  passwordHash: {
    type: String,
    required: false 
  },

  username: {
    type: String,
    required: true,
    trim: true
  },

  isGoogleUser: {
    type: Boolean,
    default: false
  },

  picture: {
    type: String,
    default: null
  },

  registrationDate: {
    type: Date,
    default: Date.now
  },

  lastLogin: {
    type: Date,
    default: null
  },

  accountStatus: {
    type: String,
    enum: ["ACTIVE", "SUSPENDED", "DELETED"],
    default: "ACTIVE"
  },

  preferences: {
    type: Object,
    default: {}
  },

  favoriteTeams: {
    type: [String],
    default: []
  },

  leaguesFollowed: {
    type: [String],
    default: []
  },

  notificationSettings: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model("AuthenticatedUser", AuthenticatedUserSchema);