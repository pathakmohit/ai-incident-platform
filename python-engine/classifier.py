"""
AI Incident Classifier
----------------------
Rule-based classifier with confidence scoring.
Can be extended with Llama 3 / Ollama for root-cause analysis.
"""

import re
from datetime import datetime


# ── Incident Rules ────────────────────────────────────────────────────
RULES = [
    {
        "name":    "Database Failure",
        "severity": "HIGH",
        "patterns": [
            r"database\s+timeout",
            r"connection\s+refused",
            r"too\s+many\s+connections",
            r"rds.*error",
            r"mysql.*error",
            r"postgres.*error",
            r"lost\s+connection\s+to\s+mysql",
        ],
        "weight": 3,
        "recommendations": [
            "Check RDS instance health in AWS Console",
            "Verify security group allows port 3306/5432",
            "Check database connection pool limits",
            "Review slow query logs",
            "Consider Read Replica if under heavy load",
        ],
    },
    {
        "name":    "High CPU / Memory Usage",
        "severity": "MEDIUM",
        "patterns": [
            r"cpu\s+(high|usage|alert)",
            r"memory\s+(high|usage|leak|alert)",
            r"out\s+of\s+memory",
            r"heap\s+space",
            r"gc\s+overhead",
        ],
        "weight": 2,
        "recommendations": [
            "Scale up EC2 instance type (t2.micro → t2.small)",
            "Enable Auto Scaling for the instance group",
            "Profile application for memory leaks",
            "Review CloudWatch metrics for trends",
        ],
    },
    {
        "name":    "Authentication Failure",
        "severity": "MEDIUM",
        "patterns": [
            r"failed\s+login",
            r"invalid\s+(credentials|token|password)",
            r"unauthorized",
            r"401",
            r"403",
            r"authentication\s+failed",
        ],
        "weight": 2,
        "recommendations": [
            "Enable MFA for all IAM users",
            "Review failed attempts in AWS CloudTrail",
            "Implement account lockout policy",
            "Check for brute-force attack patterns",
        ],
    },
    {
        "name":    "Network / Connectivity Issue",
        "severity": "HIGH",
        "patterns": [
            r"network\s+(timeout|unreachable|error)",
            r"connection\s+timed?\s+out",
            r"dns\s+(resolution|error|failed)",
            r"host\s+unreachable",
            r"socket\s+(timeout|error)",
        ],
        "weight": 3,
        "recommendations": [
            "Check VPC security groups and NACLs",
            "Verify subnet route tables",
            "Test connectivity with ping/traceroute from EC2",
            "Review AWS VPC Flow Logs",
        ],
    },
    {
        "name":    "Application Error",
        "severity": "MEDIUM",
        "patterns": [
            r"500\s+internal\s+server\s+error",
            r"null\s+pointer",
            r"unhandled\s+(exception|error)",
            r"stack\s+trace",
            r"segfault",
        ],
        "weight": 2,
        "recommendations": [
            "Review application logs for full stack trace",
            "Check recent deployments for regressions",
            "Verify all environment variables are set",
            "Roll back to previous deployment if needed",
        ],
    },
    {
        "name":    "Disk Space Warning",
        "severity": "LOW",
        "patterns": [
            r"disk\s+(full|space|usage)",
            r"no\s+space\s+left",
            r"storage\s+(full|alert)",
            r"inode\s+(full|exhausted)",
        ],
        "weight": 1,
        "recommendations": [
            "Expand EBS volume in AWS Console",
            "Clean up old log files with logrotate",
            "Enable S3 lifecycle policy for log archiving",
        ],
    },
]


# ── Classifier ────────────────────────────────────────────────────────
def classify_logs(log_text: str) -> dict:
    lines        = log_text.strip().splitlines()
    error_lines  = [l for l in lines if re.search(r"\bERROR\b", l, re.I)]
    warn_lines   = [l for l in lines if re.search(r"\bWARN(ING)?\b", l, re.I)]
    error_text   = "\n".join(error_lines + warn_lines).lower()

    # Score each rule
    scores = []
    for rule in RULES:
        hits = sum(
            len(re.findall(p, error_text, re.I))
            for p in rule["patterns"]
        )
        if hits > 0:
            scores.append((hits * rule["weight"], rule))

    if not scores:
        # No incident detected
        return {
            "incident_type":   "Normal Operation",
            "severity":        "LOW",
            "confidence":      85,
            "error_count":     len(error_lines),
            "warning_count":   len(warn_lines),
            "total_lines":     len(lines),
            "recommendations": ["System appears healthy. Continue monitoring."],
            "analyzed_at":     datetime.utcnow().isoformat(),
        }

    # Pick highest-scoring rule
    scores.sort(key=lambda x: x[0], reverse=True)
    top_score, top_rule = scores[0]

    # Confidence = base 60 + up to 35 from score, capped at 99
    confidence = min(99, 60 + int(top_score * 5))

    return {
        "incident_type":   top_rule["name"],
        "severity":        top_rule["severity"],
        "confidence":      confidence,
        "error_count":     len(error_lines),
        "warning_count":   len(warn_lines),
        "total_lines":     len(lines),
        "recommendations": top_rule["recommendations"],
        "analyzed_at":     datetime.utcnow().isoformat(),
    }
