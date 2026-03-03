const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AuthenticatedUser = require("../User/UserModel");
const { OAuth2Client } = require('google-auth-library');

// Le Client ID doit provenir de tes variables d'environnement (ex: fichier .env)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

async function findUserByEmail(rawEmail) {
  const normalizedEmail = normalizeEmail(rawEmail);
  if (!normalizedEmail) return null;

  let user = await AuthenticatedUser.findOne({ email: normalizedEmail });
  if (user) return user;

  return AuthenticatedUser.findOne({
    email: { $regex: `^${escapeRegex(normalizedEmail)}$`, $options: "i" },
  });
}

// POST /register
router.post("/register", async (req, res) => {
  try {
    console.log("Raw body received:", req.body);
    const { password, username } = req.body;
    const email = normalizeEmail(req.body.email);
    
    console.log("Register request received:", { email, username, password: password ? "****" : "MISSING" });
    
    if (!email || !password || !username) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new AuthenticatedUser({ 
      email, 
      passwordHash, 
      username,
      isGoogleUser: false 
    });
    await newUser.save();

    const token = jwt.sign(
      { id: newUser._id, email: newUser.email },
      process.env.JWT_SECRET || "fallback_secret_123",
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "User registered successfully",
      user: { id: newUser._id, email: newUser.email, username: newUser.username },
      token
    });
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// POST /login
router.post("/login", async (req, res) => {
  const { password } = req.body;
  const email = normalizeEmail(req.body.email);
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  try {
    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ error: "Identifiants invalides." });
    
    // Protection optionnelle selon ton modèle
    if (user.accountStatus && user.accountStatus !== "ACTIVE") {
      return res.status(403).json({ error: "Ce compte est désactivé." });
    }

    if (user.isGoogleUser && !user.passwordHash) {
      return res.status(400).json({ error: "Ce compte est lie a Google. Utilisez le bouton Se connecter avec Google." });
    }

    if (!user.passwordHash) {
      return res.status(401).json({ error: "Identifiants invalides." });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(401).json({ error: "Identifiants invalides." });

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "fallback_secret_123",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Connexion réussie.",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        accountStatus: user.accountStatus || "ACTIVE"
      }
    });
  } catch (err) {
    console.error("Erreur login :", err);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

router.post("/google-login", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ error: "idToken requis." });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = normalizeEmail(payload?.email);
    const googleId = payload?.sub;
    const name = payload?.name || payload?.given_name || "Utilisateur Google";
    const photoUrl = payload?.picture || null;

    if (!email || !googleId) {
      return res.status(401).json({ error: "Token Google invalide." });
    }

    let user = await findUserByEmail(email);

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = new AuthenticatedUser({
        email,
        username: name,
        passwordHash,
        isGoogleUser: true,
        picture: photoUrl
      });
      await user.save();
    } else {
      user.isGoogleUser = true;
      user.picture = photoUrl || user.picture;
      user.username = name || user.username;
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "fallback_secret_123",
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Connexion via Google réussie.",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        picture: user.picture,
        isGoogleUser: user.isGoogleUser,
        accountStatus: user.accountStatus || "ACTIVE"
      }
    });

  } catch (error) {
    console.error("Erreur lors de l'authentification Google:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'authentification Google." });
  }
});

module.exports = router;
