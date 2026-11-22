#!/usr/bin/env bash
# DevPilot AI - Local Linux/macOS Startup Script

set -e

echo "========================================================"
echo "             DevPilot AI - Local Launcher"
echo "========================================================"

if [ ! -f ".env" ]; then
    echo "[.env] not found. Creating from .env.example..."
    cp .env.example .env
    echo "Please configure your OPENROUTER_API_KEY in .env before running."
    exit 1
fi

echo "Starting Docker Compose stack..."
docker compose up --build
