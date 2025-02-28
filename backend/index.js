require('dotenv').config();
const express = require('express');
const cors = require('cors');
const session = require('express-session');
const passport = require('passport');
const { getDriveFiles, getFileContent } = require('./drive');

const GoogleStrategy = require('passport-google-oauth20').Strategy;

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/callback'
    },
    (accessToken, refreshToken, profile, done) => {
        const user = { ...profile, accessToken};
        return done(null, user);
    })
)

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((obj, done) => {
    done(null, obj);
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email", "https://www.googleapis.com/auth/drive.readonly"] })
);

app.get(
  "/auth/callback",
  passport.authenticate("google", { failureRedirect: process.env.FRONTEND_URL }),
  (req, res) => {
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

app.get("/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).send("Logout failed");
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).send("Could not clear session");
      }
      res.json({ message: "Logout successful"});
    });
  });
});

app.get("/auth/user", (req, res) => {
  res.json({ user: req.user ? req.user : null });
});

app.get("/drive/files", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const files = await getDriveFiles(req.user.accessToken);
  res.json({ files });
});

app.get("/drive/file/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  const fileContent = await getFileContent(req.user.accessToken, req.params.id);
  if (!fileContent) return res.status(500).json({ error: "Failed to read file" });

  res.json({ content: fileContent });
});

app.listen(3000, () => console.log("Server running on port 3000"));
