#!/bin/bash
set -e

echo "============================================"
echo "  AI Incident Detection Platform - Setup"
echo "============================================"

# Check prerequisites
command -v docker        >/dev/null 2>&1 || { echo "❌ Docker is required"; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required"; exit 1; }

echo "✅  Prerequisites OK"

# Copy env if not exists
if [ ! -f .env ]; then
  cp .env.example .env
  echo "📝  Created .env from .env.example — edit it with your RDS credentials"
fi

# Build and start
echo "🚀  Building and starting all services..."
docker-compose up --build -d

echo ""
echo "✅  Platform is running!"
echo ""
echo "  Frontend:      http://localhost:3000"
echo "  Backend API:   http://localhost:5000/api/health"
echo "  Python Engine: http://localhost:8000/health"
echo ""
echo "  To view logs:    docker-compose logs -f"
echo "  To stop:         docker-compose down"
echo "============================================"
