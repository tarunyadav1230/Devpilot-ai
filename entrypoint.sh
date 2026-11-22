#!/bin/bash
set -e

# Start Celery worker in background if REDIS_URL is provided
if [ -n "$REDIS_URL" ]; then
    echo "Starting Celery worker in background..."
    celery -A app.tasks.celery_app worker --loglevel=info --concurrency=1 &
fi

# Start FastAPI server in foreground
echo "Starting FastAPI server on port ${PORT:-7860}..."
exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-7860}"
