require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ───────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ───────────────────────────────────────────────────────────
app.use("/api/health",    require("./routes/health"));
app.use("/api/incidents", require("./routes/incidents"));
app.use("/api/logs",      require("./routes/logs"));
app.use("/api/dashboard", require("./routes/dashboard"));

// ── Error Handler ─────────────────────────────────────────────────────
app.use(require("./middleware/errorHandler"));

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅  Backend API running on http://localhost:${PORT}`);
});
