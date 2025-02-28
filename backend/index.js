require("dotenv").config();
const express = require("express");

const cors = require("cors");
const session = require("express-session");
const passport = require("passport");

const { getDriveFiles, getFileContent } = require("./lib/drive");
const { upsertToPinecone, searchInPinecone } = require("./lib/pinecone");
const { generateEmbedding } = require("./lib/openai");

const GoogleStrategy = require("passport-google-oauth20").Strategy;

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/callback",
    },
    (accessToken, refreshToken, profile, done) => {
      const user = { ...profile, accessToken };
      return done(null, user);
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// Google OAuth routes
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive.readonly",
    ],
  })
);

app.get(
  "/auth/callback",
  passport.authenticate("google", {
    failureRedirect: process.env.FRONTEND_URL,
  }),
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
      res.json({ message: "Logout successful" });
    });
  });
});

app.get("/auth/user", (req, res) => {
  res.json({ user: req.user ? req.user : null });
});

// Google Drive routes
app.get("/drive/files", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const files = await getDriveFiles(req.user.accessToken);
    res.json({ files });
  } catch (error) {
    console.error("Failed to fetch files:", error);
    res.status(500).json({ error: "Failed to fetch files" });
  }
});

app.get("/drive/file/:id", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const fileContent = await getFileContent(
      req.user.accessToken,
      req.params.id
    );
    if (!fileContent)
      return res.status(500).json({ error: "Failed to read file" });

    res.json({ content: fileContent });
  } catch (error) {
    console.error("Failed to fetch file content:", error);
    res.status(500).json({ error: "Failed to fetch file content" });
  }
});

// Pinecone routes
app.post("/ingest/:fileId", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Unauthorized" });

  try {
    const { fileId } = req.params;
    const files = await getDriveFiles(req.user.accessToken);
    const file = files.find((f) => f.id === fileId);

    if (!file) return res.status(404).json({ error: "File not found" });

    const content = await getFileContent(req.user.accessToken, fileId);
    if (!content)
      return res.status(500).json({ error: "Failed to fetch content" });

    const embedding = await generateEmbedding(content);
    console.log("ingest-Embedding:", embedding);

    await upsertToPinecone(fileId, embedding, {
      title: file.name,
      owner: file.owner,
      modifiedTime: file.modifiedTime,
      fileId: file.id,
    });

    res.json({ message: `File '${file.name}' ingested successfully!` });
  } catch (error) {
    console.error("Ingest error:", error);
    res.status(500).json({ error: "Failed to ingest file" });
  }
});

app.get("/search", async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const queryEmbedding = await generateEmbedding(query);
    console.log("search-Query embedding:", queryEmbedding);

    const results = await searchInPinecone(queryEmbedding);
    console.log("search-Search results:", results);

    res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ error: "Failed to perform search" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));
