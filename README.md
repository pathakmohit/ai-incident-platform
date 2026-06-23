# Cloud-Native AI Incident Detection Platform

A lightweight, production-ready AI-powered incident detection and monitoring platform built with Node.js, Python, Docker, Kubernetes (K3s), Terraform, and AWS.

---

## Architecture

```
                    Users
                      │
                      ▼
                HTML/CSS/JS UI  (port 3000)
                      │
                      ▼
               Node.js API Server  (port 5000)
                      │
        ┌─────────────┼─────────────┐
        ▼             ▼             ▼
   Amazon RDS    Log Generator   Python AI Engine
 (Incidents DB)   (Services)       (port 8000)
        │             │             │
        └─────────────┴─────────────┘
                      │
                      ▼
                Kubernetes (K3s)
                      │
                      ▼
                   Docker
                      │
                      ▼
                 AWS EC2 (Free Tier)
```

---

## Tech Stack

| Layer        | Technology                        |
|--------------|-----------------------------------|
| Frontend     | HTML, CSS, JavaScript             |
| Backend      | Node.js / Express                 |
| AI Engine    | Python / Flask                    |
| Database     | Amazon RDS (MySQL)                |
| Container    | Docker                            |
| Orchestration| Kubernetes (K3s)                  |
| IaC          | Terraform                         |
| Cloud        | AWS (EC2, RDS, VPC)               |

---

## Features

- Real-time incident dashboard
- Log file upload and analysis
- Python AI engine for incident classification
- Automated severity detection (High / Medium / Low)
- Incident history stored in Amazon RDS
- Simulated log generator for demo data
- Containerized with Docker
- Orchestrated with Kubernetes
- Infrastructure provisioned with Terraform

---

## Project Structure

```
ai-incident-platform/
├── frontend/               # HTML/CSS/JS UI
│   ├── index.html          # Dashboard
│   ├── upload.html         # Log Upload
│   ├── analysis.html       # AI Analysis Results
│   ├── history.html        # Incident History
│   ├── css/style.css
│   └── js/app.js
├── backend/                # Node.js API Server
│   ├── server.js
│   ├── routes/
│   │   ├── incidents.js
│   │   ├── logs.js
│   │   └── health.js
│   ├── middleware/
│   │   └── errorHandler.js
│   ├── utils/
│   │   └── logGenerator.js
│   ├── package.json
│   └── Dockerfile
├── python-engine/          # AI Classification Engine
│   ├── app.py
│   ├── classifier.py
│   ├── requirements.txt
│   └── Dockerfile
├── kubernetes/             # K8s Manifests
│   ├── namespace.yaml
│   ├── frontend-deployment.yaml
│   ├── backend-deployment.yaml
│   ├── python-engine-deployment.yaml
│   └── ingress.yaml
├── terraform/              # AWS Infrastructure
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   └── userdata.sh
├── logs/                   # Sample log files
│   └── sample.log
├── scripts/
│   └── setup.sh
├── docker-compose.yml
└── README.md
```

---

## Quick Start (Local with Docker Compose)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Python 3.11+

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/ai-incident-platform.git
cd ai-incident-platform
```

### 2. Set environment variables
```bash
cp .env.example .env
# Edit .env with your RDS credentials
```

### 3. Start all services
```bash
docker-compose up --build
```

### 4. Access the app
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- Python AI Engine: http://localhost:8000

---

## Deploy to AWS

### 1. Provision Infrastructure with Terraform
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

### 2. Deploy to Kubernetes (K3s)
```bash
kubectl apply -f kubernetes/namespace.yaml
kubectl apply -f kubernetes/
```

---

## API Endpoints

| Method | Endpoint               | Description               |
|--------|------------------------|---------------------------|
| GET    | /api/health            | Health check              |
| GET    | /api/incidents         | Get all incidents         |
| POST   | /api/incidents         | Create incident           |
| POST   | /api/logs/analyze      | Analyze uploaded log file |
| GET    | /api/logs/generate     | Generate sample logs      |
| GET    | /api/dashboard/stats   | Get dashboard stats       |

---

## Resume Bullet Points

- Designed and deployed a **Cloud-Native AI Incident Detection Platform** on AWS EC2 (Free Tier)
- Containerized 3 microservices (Frontend, Node.js API, Python AI Engine) using **Docker**
- Orchestrated workloads using **Kubernetes (K3s)** with namespace isolation
- Provisioned AWS infrastructure (EC2, RDS, VPC, Security Groups) using **Terraform**
- Built a **Python AI classification engine** that analyzes logs and detects incident type, severity, and confidence score
- Stored incident records in **Amazon RDS (MySQL)** with automated retention
- Developed a real-time dashboard using **HTML/CSS/JavaScript** with Node.js/Express REST API
- Implemented automated log generation for simulated production traffic

---

## License

MIT
