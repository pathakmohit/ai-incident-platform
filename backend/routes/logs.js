const express   = require("express");
const router    = express.Router();
const axios     = require("axios");
const { writeToFile, generateBatch } = require("../utils/logGenerator");

const PYTHON_URL = process.env.PYTHON_ENGINE_URL || "http://python-engine:8000";

// POST /api/logs/analyze  — forward logs to Python AI engine
router.post("/analyze", async (req, res, next) => {
  try {
    const { logs } = req.body;
    if (!logs) return res.status(400).json({ success: false, message: "logs field required" });

    const response = await axios.post(`${PYTHON_URL}/analyze`, { logs }, { timeout: 15000 });
    res.json(response.data);
  } catch (err) {
    // If Python engine is down, fall back to basic Node.js classifier
    console.warn("Python engine unavailable, using fallback classifier");
    const result = fallbackClassify(req.body.logs);
    res.json(result);
  }
});

// POST /api/logs/generate  — generate sample log lines
router.post("/generate", (req, res) => {
  const content = writeToFile(20);
  res.json({ success: true, generated: 20, preview: content.split("\n").slice(0, 5) });
});

// GET /api/logs/generate  — same but GET (for browser testing)
router.get("/generate", (req, res) => {
  const content = generateBatch(5);
  res.json({ success: true, logs: content });
});

// ── Fallback classifier (no Python needed for demo) ──────────────────
function fallbackClassify(logText) {
  const lines  = logText.split("\n");
  const errors = lines.filter(l => l.includes("ERROR"));
  const warns  = lines.filter(l => l.includes("WARN"));

  let incident_type  = "Normal Operation";
  let severity       = "LOW";
  let confidence     = 70;
  let recommendations = ["Continue monitoring system health"];

  if (errors.some(l => /database|timeout|connection refused/i.test(l))) {
    incident_type  = "Database Failure";
    severity       = "HIGH";
    confidence     = 95;
    recommendations = [
      "Check RDS instance health in AWS Console",
      "Verify security group allows port 3306",
      "Check database connection limits",
      "Restart application pods if needed",
    ];
  } else if (warns.some(l => /cpu|memory/i.test(l))) {
    incident_type  = "Resource Exhaustion";
    severity       = "MEDIUM";
    confidence     = 80;
    recommendations = [
      "Scale up EC2 instance type",
      "Check for memory leaks in application",
      "Review CloudWatch metrics",
    ];
  } else if (errors.some(l => /login|auth|401|403/i.test(l))) {
    incident_type  = "Authentication Failure";
    severity       = "MEDIUM";
    confidence     = 78;
    recommendations = [
      "Enable MFA for IAM users",
      "Review failed login attempts in CloudTrail",
      "Check security group and IAM policies",
    ];
  } else if (errors.length > 0) {
    incident_type  = "Application Error";
    severity       = "MEDIUM";
    confidence     = 72;
    recommendations = [
      "Review application logs for stack traces",
      "Check recent deployments for regressions",
      "Verify all environment variables are set",
    ];
  }

  return {
    incident_type,
    severity,
    confidence,
    error_count:     errors.length,
    warning_count:   warns.length,
    total_lines:     lines.length,
    recommendations,
  };
}

module.exports = router;
