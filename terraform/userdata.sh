#!/bin/bash
set -e

# ── System update ─────────────────────────────────────────────────────
yum update -y

# ── Docker ────────────────────────────────────────────────────────────
yum install -y docker git
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# ── Docker Compose ────────────────────────────────────────────────────
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# ── K3s (lightweight Kubernetes) ─────────────────────────────────────
curl -sfL https://get.k3s.io | sh -
systemctl enable k3s

# ── Clone project ─────────────────────────────────────────────────────
cd /home/ec2-user
git clone https://github.com/YOUR_USERNAME/ai-incident-platform.git
cd ai-incident-platform

# ── Write .env from Terraform environment vars ────────────────────────
cat > .env <<EOF
DB_HOST=${db_host}
DB_PORT=3306
DB_USER=${db_user}
DB_PASSWORD=${db_password}
DB_NAME=incidents_db
NODE_ENV=production
PORT=5000
PYTHON_ENGINE_URL=http://python-engine:8000
EOF

# ── Start services ────────────────────────────────────────────────────
docker-compose up -d --build

echo "✅  AI Incident Platform deployed successfully"
