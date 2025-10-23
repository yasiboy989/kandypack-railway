# syntax=docker/dockerfile:1
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# System dependencies (kept minimal; psycopg2-binary avoids Postgres client libs)
RUN pip install --no-cache-dir --upgrade pip

COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# Copy app source
COPY app /app/app

# Railway provides $PORT; default to 8000 for local docker run
ENV PORT=8000
EXPOSE 8000

# Start Uvicorn binding on all interfaces and platform port
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
