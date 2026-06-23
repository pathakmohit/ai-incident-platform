const express = require("express");
const router  = express.Router();
const db      = require("../utils/db");
const axios   = require("axios");

router.get("/", async (req, res) => {
  const status = { status: "ok", timestamp: new Date().toISOString() };

  // Check database
  try {
    await db.query("SELECT 1");
    status.database = "ok";
  } catch {
    status.database = "error";
  }

  // Check Python engine
  try {
    const r = await axios.get(
      `${process.env.PYTHON_ENGINE_URL || "http://python-engine:8000"}/health`,
      { timeout: 3000 }
    );
    status.python_engine = r.data.status === "ok" ? "ok" : "error";
  } catch {
    status.python_engine = "error";
  }

  res.json(status);
});

module.exports = router;
