const fs   = require("fs");
const path = require("path");

const LOG_TEMPLATES = [
  { line: "INFO  Login Success user=admin",              weight: 5 },
  { line: "INFO  Order Created order_id={{id}}",         weight: 5 },
  { line: "INFO  Payment Processed amount=${{amt}}",     weight: 4 },
  { line: "WARN  CPU High {{pct}}%",                     weight: 2 },
  { line: "WARN  Memory Usage {{pct}}%",                 weight: 2 },
  { line: "ERROR Database Timeout after 30000ms",        weight: 3 },
  { line: "ERROR Connection Refused host=rds.amazonaws.com", weight: 2 },
  { line: "ERROR 500 Internal Server Error /api/orders", weight: 1 },
  { line: "ERROR Failed Login Attempts ip=192.168.1.{{ip}}", weight: 1 },
];

function randomLine() {
  const total = LOG_TEMPLATES.reduce((s, t) => s + t.weight, 0);
  let rnd = Math.random() * total;
  for (const t of LOG_TEMPLATES) {
    rnd -= t.weight;
    if (rnd <= 0) {
      return t.line
        .replace("{{id}}",  Math.floor(Math.random() * 9000 + 1000))
        .replace("{{amt}}", (Math.random() * 500 + 10).toFixed(2))
        .replace("{{pct}}", Math.floor(Math.random() * 40 + 60))
        .replace("{{ip}}",  Math.floor(Math.random() * 254 + 1));
    }
  }
  return "INFO  Heartbeat";
}

function generateBatch(count = 20) {
  const now   = new Date();
  const lines = [];
  for (let i = 0; i < count; i++) {
    const ts = new Date(now - (count - i) * 3000);
    lines.push(`${ts.toISOString().replace("T", " ").slice(0, 19)}  ${randomLine()}`);
  }
  return lines.join("\n");
}

function writeToFile(count = 20) {
  const logDir  = path.join(__dirname, "../../logs");
  const logFile = path.join(logDir, "app.log");
  if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
  const content = generateBatch(count) + "\n";
  fs.appendFileSync(logFile, content, "utf8");
  return content;
}

module.exports = { generateBatch, writeToFile };
