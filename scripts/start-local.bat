@echo off
REM DevPilot AI - Local Windows Startup Script
echo ========================================================
echo               DevPilot AI - Local Launcher
echo ========================================================

IF NOT EXIST ".env" (
    echo [.env] not found. Creating from .env.example...
    copy .env.example .env
    echo Please edit .env and provide your OPENROUTER_API_KEY before running.
    pause
    exit /b
)

echo Starting Docker Compose stack (FastAPI, Redis, Celery, React)...
docker compose up --build

pause
