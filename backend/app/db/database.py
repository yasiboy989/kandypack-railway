import os
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor

load_dotenv()


def get_db_connection():
    """
    Return a new psycopg2 connection.

    Priority:
    1. Use DATABASE_URL (recommended for deployments).
    2. Fall back to individual env vars: DB_HOST, DB_NAME, DB_USER, DB_PASS (or DB_PASSWORD), DB_PORT.

    Raises a RuntimeError with actionable instructions when required env vars are missing or connection fails.
    """
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        try:
            return psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        except Exception as e:
            raise RuntimeError(f"Failed to connect using DATABASE_URL: {e}")

    host = os.getenv("DB_HOST")
    dbname = os.getenv("DB_NAME")
    user = os.getenv("DB_USER")
    # accept either DB_PASS or DB_PASSWORD for flexibility
    password = os.getenv("DB_PASS") or os.getenv("DB_PASSWORD")
    port = os.getenv("DB_PORT")

    missing = []
    if not host:
        missing.append("DB_HOST")
    if not dbname:
        missing.append("DB_NAME")
    if not user:
        missing.append("DB_USER")
    if not password:
        missing.append("DB_PASS or DB_PASSWORD")
    if not port:
        missing.append("DB_PORT")

    if missing:
        raise RuntimeError(
            "Database connection environment variables missing: "
            + ", ".join(missing)
            + ". Set DATABASE_URL or provide DB_HOST, DB_NAME, DB_USER, DB_PASS (or DB_PASSWORD), DB_PORT."
        )

    try:
        return psycopg2.connect(
            host=host,
            database=dbname,
            user=user,
            password=password,
            port=int(port),
            cursor_factory=RealDictCursor,
        )
    except Exception as e:
        raise RuntimeError(f"Failed to connect to Postgres: {e}")
