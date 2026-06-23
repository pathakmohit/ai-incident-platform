// ── Config ──────────────────────────────────────────────────────────
const API_BASE = "http://localhost:5000/api";

// ── Utility ─────────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function severityBadge(sev) {
  return `<span class="alert-badge badge-${sev}">${sev}</span>`;
}

// ── Dashboard ────────────────────────────────────────────────────────
async function initDashboard() {
  checkHealth();
  loadDashboardStats();
  loadRecentAlerts();
}

async function checkHealth() {
  try {
    const r = await fetch(`${API_BASE}/health`);
    const d = await r.json();
    document.getElementById("svc-backend").textContent = "Online";
    document.getElementById("svc-backend").className = "badge badge-green";
    document.getElementById("svc-db").textContent = d.database === "ok" ? "Connected" : "Error";
    document.getElementById("svc-db").className = d.database === "ok" ? "badge badge-green" : "badge badge-red";
    document.getElementById("svc-python").textContent = d.python_engine === "ok" ? "Online" : "Offline";
    document.getElementById("svc-python").className = d.python_engine === "ok" ? "badge badge-green" : "badge badge-red";
  } catch {
    ["svc-backend", "svc-db", "svc-python"].forEach(id => {
      document.getElementById(id).textContent = "Offline";
      document.getElementById(id).className = "badge badge-red";
    });
  }
}

async function loadDashboardStats() {
  try {
    const r = await fetch(`${API_BASE}/dashboard/stats`);
    const d = await r.json();
    document.getElementById("stat-services").textContent = d.services_running ?? 3;
    document.getElementById("stat-incidents").textContent = d.incidents_today ?? 0;
    document.getElementById("stat-critical").textContent = d.critical_alerts ?? 0;
    document.getElementById("stat-confidence").textContent =
      d.avg_confidence ? d.avg_confidence + "%" : "—";
    document.getElementById("trend-incidents").textContent =
      d.incidents_today === 1 ? "1 detected" : `${d.incidents_today || 0} detected`;
    document.getElementById("trend-critical").textContent =
      d.critical_alerts > 0 ? "Needs attention" : "None active";
    document.getElementById("trend-critical").className =
      "stat-trend " + (d.critical_alerts > 0 ? "down" : "up");
  } catch {
    /* silently degrade */
  }
}

async function loadRecentAlerts() {
  const container = document.getElementById("alert-list");
  try {
    const r = await fetch(`${API_BASE}/incidents?limit=5`);
    const { data } = await r.json();
    if (!data || data.length === 0) {
      container.innerHTML = '<div class="loading-row">No incidents recorded yet.</div>';
      return;
    }
    container.innerHTML = data.map(inc => `
      <div class="alert-item ${inc.severity}">
        ${severityBadge(inc.severity)}
        <div class="alert-text">
          <div class="alert-title">${inc.incident_type}</div>
          <div class="alert-time">${fmtDate(inc.created_at)} · ${inc.confidence}% confidence</div>
        </div>
      </div>
    `).join("");
  } catch {
    container.innerHTML = '<div class="loading-row">Could not load alerts. Is the backend running?</div>';
  }
}

async function generateLogs() {
  const btn = document.querySelector('[onclick="generateLogs()"]');
  btn.textContent = "Generating...";
  btn.disabled = true;
  try {
    await fetch(`${API_BASE}/logs/generate`, { method: "POST" });
    setTimeout(() => {
      loadDashboardStats();
      loadRecentAlerts();
      btn.textContent = "⟳ Generate Logs";
      btn.disabled = false;
    }, 1500);
  } catch {
    btn.textContent = "⟳ Generate Logs";
    btn.disabled = false;
  }
}

// ── Upload / Analyze ─────────────────────────────────────────────────
let _fileContent = null;
let _lastResult  = null;

document.addEventListener("DOMContentLoaded", () => {
  const fi = document.getElementById("file-input");
  const zone = document.getElementById("upload-zone");
  if (!fi) return;

  fi.addEventListener("change", e => readFile(e.target.files[0]));

  zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("drag-over"); });
  zone.addEventListener("dragleave", () => zone.classList.remove("drag-over"));
  zone.addEventListener("drop", e => {
    e.preventDefault();
    zone.classList.remove("drag-over");
    if (e.dataTransfer.files[0]) readFile(e.dataTransfer.files[0]);
  });
});

function readFile(file) {
  if (!file) return;
  document.getElementById("file-name-display").textContent = file.name;
  document.getElementById("file-selected").classList.remove("hidden");
  const reader = new FileReader();
  reader.onload = e => {
    _fileContent = e.target.result;
    document.getElementById("log-text").value = _fileContent;
  };
  reader.readAsText(file);
}

function clearFile() {
  _fileContent = null;
  document.getElementById("file-selected").classList.add("hidden");
  document.getElementById("file-input").value = "";
  document.getElementById("log-text").value = "";
}

function loadSampleLogs() {
  const sample = [
    "INFO  2024-01-15 10:00:01 Login Success user=admin",
    "INFO  2024-01-15 10:00:05 Order Created order_id=1234",
    "ERROR 2024-01-15 10:01:12 Database Timeout after 30000ms",
    "ERROR 2024-01-15 10:01:13 Database Timeout after 30000ms",
    "ERROR 2024-01-15 10:01:15 Connection Refused host=rds.amazonaws.com",
    "ERROR 2024-01-15 10:01:16 Database Timeout after 30000ms",
    "WARN  2024-01-15 10:02:00 CPU High 87%",
  ].join("\n");
  document.getElementById("log-text").value = sample;
  _fileContent = sample;
}

async function analyzeLogs() {
  const logText = document.getElementById("log-text").value.trim();
  if (!logText) {
    alert("Please upload a log file or paste log content first.");
    return;
  }
  const btn = document.getElementById("analyze-btn");
  btn.textContent = "Analyzing...";
  btn.disabled = true;

  try {
    const r = await fetch(`${API_BASE}/logs/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ logs: logText }),
    });
    const d = await r.json();
    _lastResult = d;
    renderResult(d);
  } catch {
    alert("Analysis failed. Make sure the backend is running.");
  } finally {
    btn.textContent = "Analyze with AI";
    btn.disabled = false;
  }
}

function renderResult(d) {
  document.getElementById("result-section").style.display = "block";
  document.getElementById("res-type").textContent = d.incident_type || "Unknown";
  document.getElementById("res-severity").innerHTML = d.severity
    ? severityBadge(d.severity)
    : "—";
  document.getElementById("res-confidence").textContent =
    d.confidence ? d.confidence + "%" : "—";
  document.getElementById("res-errors").textContent = d.error_count ?? "—";

  const list = document.getElementById("rec-list");
  list.innerHTML = (d.recommendations || ["No recommendations"]).map(r => `<li>${r}</li>`).join("");
  document.getElementById("save-msg").classList.add("hidden");
}

async function saveIncident() {
  if (!_lastResult) return;
  try {
    const r = await fetch(`${API_BASE}/incidents`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(_lastResult),
    });
    if (r.ok) {
      document.getElementById("save-msg").classList.remove("hidden");
    }
  } catch {
    alert("Failed to save incident.");
  }
}

// ── Incident History ─────────────────────────────────────────────────
let _allIncidents = [];

async function initHistory() {
  const tbody = document.getElementById("incidents-tbody");
  if (!tbody) return;
  try {
    const r = await fetch(`${API_BASE}/incidents`);
    const { data } = await r.json();
    _allIncidents = data || [];
    renderTable(_allIncidents);
  } catch {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-row">Could not load incidents.</td></tr>';
  }
}

function renderTable(rows) {
  const tbody = document.getElementById("incidents-tbody");
  if (rows.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="loading-row">No incidents found.</td></tr>';
    return;
  }
  tbody.innerHTML = rows.map((inc, i) => `
    <tr>
      <td>${inc.id || i + 1}</td>
      <td>${inc.incident_type}</td>
      <td>${severityBadge(inc.severity)}</td>
      <td>${inc.confidence}%</td>
      <td>${fmtDate(inc.created_at)}</td>
      <td>
        <button class="btn btn-outline btn-sm" onclick="viewDetail(${i})">View</button>
      </td>
    </tr>
  `).join("");
}

function filterIncidents() {
  const val = document.getElementById("severity-filter").value;
  const filtered = val ? _allIncidents.filter(i => i.severity === val) : _allIncidents;
  renderTable(filtered);
}

function viewDetail(idx) {
  const inc = _allIncidents[idx];
  if (!inc) return;
  let recs = "";
  try {
    const arr = typeof inc.recommendations === "string"
      ? JSON.parse(inc.recommendations)
      : (inc.recommendations || []);
    recs = `<div class="modal-rec"><h4>Recommendations</h4><ol>${arr.map(r => `<li>${r}</li>`).join("")}</ol></div>`;
  } catch { /* skip */ }

  document.getElementById("modal-title").textContent = inc.incident_type;
  document.getElementById("modal-body").innerHTML = `
    <div class="modal-row"><span class="modal-key">Severity</span><span>${severityBadge(inc.severity)}</span></div>
    <div class="modal-row"><span class="modal-key">Confidence</span><span>${inc.confidence}%</span></div>
    <div class="modal-row"><span class="modal-key">Detected At</span><span>${fmtDate(inc.created_at)}</span></div>
    ${recs}
  `;
  document.getElementById("modal-overlay").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal-overlay").classList.add("hidden");
}

function exportCSV() {
  if (!_allIncidents.length) return;
  const headers = ["ID", "Incident Type", "Severity", "Confidence", "Date"];
  const rows = _allIncidents.map(i =>
    [i.id, i.incident_type, i.severity, i.confidence + "%", fmtDate(i.created_at)].join(",")
  );
  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "incidents.csv";
  a.click();
}
