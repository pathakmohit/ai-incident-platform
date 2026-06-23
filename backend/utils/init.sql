CREATE DATABASE IF NOT EXISTS incidents_db;
USE incidents_db;

CREATE TABLE IF NOT EXISTS incidents (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  incident_type  VARCHAR(255)   NOT NULL,
  severity       ENUM('HIGH','MEDIUM','LOW') NOT NULL DEFAULT 'LOW',
  confidence     INT            NOT NULL DEFAULT 0,
  error_count    INT            NOT NULL DEFAULT 0,
  recommendations JSON,
  raw_logs       TEXT,
  created_at     DATETIME       DEFAULT CURRENT_TIMESTAMP
);

-- Seed sample data
INSERT INTO incidents (incident_type, severity, confidence, error_count, recommendations, created_at) VALUES
('Database Failure',  'HIGH',   96, 5, '["Check RDS connectivity","Verify security group rules","Restart application pod"]', NOW()),
('High CPU Usage',    'MEDIUM', 82, 2, '["Scale up EC2 instance","Check for memory leaks","Review running processes"]', NOW() - INTERVAL 1 HOUR),
('Failed Login Attempts', 'LOW', 74, 3, '["Enable MFA","Review IAM policies","Check CloudTrail logs"]', NOW() - INTERVAL 2 HOUR);
