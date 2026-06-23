const express = require("express");
const router  = express.Router();
const db      = require("../utils/db");

// GET /api/incidents
router.get("/", async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 100;
    const [rows] = await db.query(
      "SELECT * FROM incidents ORDER BY created_at DESC LIMIT ?",
      [limit]
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/incidents
router.post("/", async (req, res, next) => {
  try {
    const { incident_type, severity, confidence, error_count, recommendations, raw_logs } = req.body;

    if (!incident_type || !severity) {
      return res.status(400).json({ success: false, message: "incident_type and severity are required" });
    }

    const [result] = await db.query(
      `INSERT INTO incidents (incident_type, severity, confidence, error_count, recommendations, raw_logs)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        incident_type,
        severity,
        confidence || 0,
        error_count || 0,
        JSON.stringify(recommendations || []),
        raw_logs || null,
      ]
    );

    res.status(201).json({ success: true, id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/incidents/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await db.query("DELETE FROM incidents WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
