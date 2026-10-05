require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const todoRoutes = require("./routes/todoRoutes");

const app = express();

app.use(express.json());

// Log every API request
app.use("/api", (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const body = ["POST", "PUT"].includes(req.method)
      ? ` ${JSON.stringify(req.body)}`
      : "";

    console.log(
      `${req.method} ${req.originalUrl} ${res.statusCode} ${
        Date.now() - start
      }ms${body}`
    );
  });

  next();
});

// API routes
app.use("/api/todos", todoRoutes);

// Serve React production build
const buildPath = path.join(__dirname, "../client/dist");

app.use(express.static(buildPath));

// React SPA fallback
app.get("/{*splat}", (req, res) => {
  res.sendFile(path.join(buildPath, "index.html"));
});

// Render provides PORT through environment variables
const PORT = process.env.PORT || 5001;

// Connect to MongoDB and start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection failed:", err.message);
  });