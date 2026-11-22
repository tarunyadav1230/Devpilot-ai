# 🚀 DevPilot AI — Production Deployment Guide

This guide provides end-to-end instructions for deploying DevPilot AI locally, on a Cloud VPS (Docker Compose), or using Serverless PaaS platforms (Vercel + Render/Railway).

---

## 📋 Architecture Overview

DevPilot AI consists of four primary services:
1. **FastAPI Backend (`devpilot-backend`)**: Python 3.11, PyTorch CPU, FAISS Vector Store, CrewAI Multi-Agent orchestrator. Exposes REST & SSE streaming APIs on port `8000` (container port `7860`).
2. **Redis Service (`devpilot-redis`)**: High-performance in-memory cache and Celery task broker on port `6379`.
3. **Celery Worker (`devpilot-celery-worker`)**: Non-blocking asynchronous task worker for code execution sandboxes and background evaluations.
4. **React Frontend (`devpilot-frontend`)**: Vite + React single-page application served via an Alpine Nginx reverse proxy on port `5173` (container port `80`).

---

## 🔑 Environment Variables Reference

Create a `.env` file in the root directory:

| Variable | Required | Default | Description |
|---|---|---|---|
| `OPENROUTER_API_KEY` | **Yes** | — | API key from [openrouter.ai](https://openrouter.ai/) for multi-agent LLMs |
| `REDIS_URL` | **Yes** | `redis://redis:6379/0` (Docker) / `redis://localhost:6379/0` (local) | Connection URL for Redis cache and Celery broker |
| `VITE_API_BASE` | No | `http://localhost:8000` | Backend URL used by frontend at build time |
| `TAVILY_API_KEY` | No | — | Optional search API; falls back to free DuckDuckGo |
| `LANGSMITH_TRACING` | No | `false` | Enable/disable LangSmith telemetry tracing |
| `LANGSMITH_API_KEY` | No | — | Optional LangSmith API key for tracing |
| `LANGSMITH_PROJECT` | No | `devpilot-ai` | Optional LangSmith project name |

---

## 🐳 Path 1: Cloud VPS Deployment with Docker Compose (Recommended)

Deploying via Docker Compose is the most robust and complete method. It maintains the isolated network between Redis, the Celery worker, FastAPI, and Nginx.

### 1. Provision a Server
- **Recommended OS**: Ubuntu 22.04 LTS or 24.04 LTS
- **Hardware**: Minimum 2 vCPU, 4 GB RAM (PyTorch & HuggingFace models require ~2 GB RAM)
- **Providers**: DigitalOcean Droplet ($24/mo), Hetzner CX22/CX32, AWS EC2 (`t3.medium`), or GCP Compute Engine.

### 2. Configure Firewall / Security Group
Ensure the following inbound ports are open:
- `80` (HTTP)
- `443` (HTTPS)
- `5173` (Frontend UI, if accessed directly without reverse proxy)
- `8000` (FastAPI backend, if accessed directly without reverse proxy)

### 3. Server Setup
SSH into your server and run:

```bash
# Update packages
sudo apt update && sudo apt upgrade -y

# Install Docker and Docker Compose plugin
sudo apt install -y git curl docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
newgrp docker
```

### 4. Clone & Deploy
```bash
# Clone the repository
git clone https://github.com/tarunyadav1230/Devpilot-ai.git
cd Devpilot-ai

# Configure environment
cp .env.example .env
nano .env   # Enter your OPENROUTER_API_KEY and other parameters

# Launch all 4 containers in background
docker compose up -d --build
```

### 5. Verify Running Containers
```bash
docker compose ps
docker compose logs -f
```

---

## 🔒 Path 2: Production Nginx Reverse Proxy with SSL (Domain Setup)

To serve the application over HTTPS with a custom domain (e.g., `devpilot.yourdomain.com`):

### 1. Install Nginx & Certbot
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### 2. Configure Nginx
Create `/etc/nginx/sites-available/devpilot`:

```nginx
server {
    listen 80;
    server_name devpilot.yourdomain.com;

    # Frontend SPA
    location / {
        proxy_pass http://127.0.0.1:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API & SSE Streaming
    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # SSE Streaming headers
        proxy_http_version 1.1;
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 24h;
    }
}
```

### 3. Enable Site & Generate Free SSL Certificate
```bash
sudo ln -s /etc/nginx/sites-available/devpilot /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Generate SSL with Let's Encrypt
sudo certbot --nginx -d devpilot.yourdomain.com
```

---

## ☁️ Path 3: Cloud PaaS (Vercel + Render / Railway + Upstash)

If you prefer managed serverless hosting:

### 1. Redis
- Create a free database at [Upstash](https://upstash.com).
- Copy the Redis URI: `rediss://default:password@endpoint.upstash.io:6379`.

### 2. Backend (Render / Railway)
- Create a new **Web Service** from GitHub repo `tarunyadav1230/Devpilot-ai`.
- Select Docker runtime (uses root `Dockerfile`).
- Set instance RAM to at least **2 GB**.
- Add environment variables:
  - `OPENROUTER_API_KEY`
  - `REDIS_URL` (Upstash connection string)
  - `PORT` = `7860`

### 3. Frontend (Vercel / Cloudflare Pages)
- Import repo `tarunyadav1230/Devpilot-ai`.
- Root Directory: `ui`
- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variable: `VITE_API_BASE = https://your-backend-service.onrender.com`

---

## 💻 Local Development Setup

To run locally without Docker:

```bash
# 1. Start Redis (via Docker or local service)
docker run -d -p 6379:6379 redis:7-alpine

# 2. Setup Python environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env

# 3. Start FastAPI Backend
uvicorn app.main:app --reload --port 8000

# 4. In a separate terminal, start React UI:
cd ui
npm install
npm run dev
```

---

## 🩺 Health Check & Monitoring

Once deployed, test the following endpoints:

- **Swagger Documentation**: `GET /docs`
- **Telemetry Overview**: `GET /api/observability/overview`
- **Repository List**: `GET /repos`
- **Interactive UI**: `http://<HOST>:5173`
