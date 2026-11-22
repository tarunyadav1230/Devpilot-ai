#!/usr/bin/env bash
# DevPilot AI - Cloud Server Deployment Automation Script

set -e

echo "========================================================"
echo "          DevPilot AI - Server Deployment"
echo "========================================================"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "Docker is not installed. Installing Docker..."
    sudo apt update
    sudo apt install -y docker.io docker-compose-v2
    sudo systemctl enable --now docker
    sudo usermod -aG docker "$USER"
fi

# Ensure .env exists
if [ ! -f ".env" ]; then
    echo "Creating .env from .env.example..."
    cp .env.example .env
    echo "WARNING: Please configure OPENROUTER_API_KEY in .env before starting."
    exit 1
fi

echo "Pulling base images and rebuilding services..."
docker compose pull redis
docker compose build --no-cache

echo "Launching DevPilot AI stack in background..."
docker compose up -d

echo "Services deployed successfully!"
docker compose ps
