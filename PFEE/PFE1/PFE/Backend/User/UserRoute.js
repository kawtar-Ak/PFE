const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AuthenticatedUser = require("../User/UserModel");
const { OAuth2Client } = require('google-auth-library');

// Le Client ID doit provenir de tes variables d'environnement (ex: fichier .env)
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /register
router.post("/register", async (req, res) => {
  try {
    console.log("Raw body received:", req.body);
    const { email, password, username } = req.body;
    
    console.log("Register request received:", { email, username, password: password ? "****" : "MISSING" });
    
    if (!email || !password || !username) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await AuthenticatedUser.findOne({ email });
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
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email et mot de passe requis." });
  }

  try {
    const user = await AuthenticatedUser.findOne({ email });
    if (!user) return res.status(401).json({ error: "Identifiants invalides." });
    
    // Protection optionnelle selon ton modèle
    if (user.accountStatus && user.accountStatus !== "ACTIVE") {
      return res.status(403).json({ error: "Ce compte est désactivé." });
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

// ✅ NOUVELLE VERSION: POST /google-login qui accepte les données utilisateur directement
router.post("/google-login", async (req, res) => {
  // Maintenant on attend email, name, googleId au lieu de idToken
  const { email, name, googleId, photoUrl } = req.body;

  console.log("📥 Google login - Données reçues:", { email, name, googleId, photoUrl });

  if (!email || !name || !googleId) {
    return res.status(400).json({ 
      error: "Données Google incomplètes.",
      received: { email, name, googleId }
    });
  }

  try {
    // Chercher si l'utilisateur existe déjà
    let user = await AuthenticatedUser.findOne({ email });

    if (!user) {
      console.log("🆕 Création d'un nouvel utilisateur Google:", email);
      
      // Créer le compte sans mot de passe (ou avec mot de passe aléatoire)
      const randomPassword = Math.random().toString(36).slice(-10);
      const passwordHash = await bcrypt.hash(randomPassword, 10);

      user = new AuthenticatedUser({
        email: email,
        username: name,
        passwordHash: passwordHash,
        isGoogleUser: true,
        picture: photoUrl || null
      });
      
      await user.save();
      console.log("✅ Nouvel utilisateur Google créé avec succès");
    } else {
      console.log("📝 Utilisateur existant trouvé:", email);
      
      // Mettre à jour les infos Google
      user.isGoogleUser = true;
      user.picture = photoUrl || user.picture;
      user.username = name || user.username;
      user.lastLogin = new Date();
      
      await user.save({ validateBeforeSave: false });
      console.log("✅ Utilisateur existant mis à jour avec Google");
    }

    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "fallback_secret_123",
      { expiresIn: "7d" }
    );

    // Renvoyer la réponse
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
    console.error("❌ Erreur lors de l'authentification Google:", error);
    res.status(500).json({ error: "Erreur serveur lors de l'authentification Google." });
  }
});

module.exports = router;