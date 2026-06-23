const express = require("express");
const router  = express.Router();
const db      = require("../utils/db");

router.get("/stats", async (req, res, next) => {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [[{ incidents_today }]] = await db.query(
      "SELECT COUNT(*) AS incidents_today FROM incidents WHERE DATE(created_at) = ?",
      [today]
    );

    const [[{ critical_alerts }]] = await db.query(
      "SELECT COUNT(*) AS critical_alerts FROM incidents WHERE severity = 'HIGH' AND DATE(created_at) = ?",
      [today]
    );

    const [[{ avg_confidence }]] = await db.query(
      "SELECT ROUND(AVG(confidence), 0) AS avg_confidence FROM incidents"
    );

    res.json({
      services_running: 3,
      incidents_today:  parseInt(incidents_today),
      critical_alerts:  parseInt(critical_alerts),
      avg_confidence:   avg_confidence || 0,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
