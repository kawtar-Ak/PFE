const mongoose = require("mongoose");

const EMAIL_REGEX = /^(?!.*\s)(?!\.)(?!.*\.\.)[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
const USERNAME_REGEX = /^(?=.{3,20}$)[A-Za-z0-9._]+$/;

const AuthenticatedUserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email requis."],
    unique: true,
    index: true,
    trim: true,
    lowercase: true,
    match: [EMAIL_REGEX, "Adresse email invalide."]
  },

  passwordHash: {
    type: String,
    required: false
  },

  username: {
    type: String,
    required: [true, "Nom d'utilisateur requis."],
    unique: true,
    index: true,
    trim: true,
    minlength: [3, "Le nom d'utilisateur doit contenir au moins 3 caracteres."],
    maxlength: [20, "Le nom d'utilisateur ne doit pas depasser 20 caracteres."],
    match: [USERNAME_REGEX, "Le nom d'utilisateur ne peut contenir que des lettres, chiffres, points et underscores."]
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
}, {
  timestamps: true
});

module.exports = mongoose.model("AuthenticatedUser", AuthenticatedUserSchema);
