from .config import Config
import psycopg2

DB_CONFIG = {
    "host": Config.DB_HOST,
    "database": Config.DB_NAME,
    "user": Config.DB_USER,
    "password": Config.DB_PASSWORD
}

def get_db_connection():
    conn = psycopg2.connect(**DB_CONFIG)
    return conn