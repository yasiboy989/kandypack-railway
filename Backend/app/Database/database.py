from .config import DB_CONFIG
import psycopg2



def get_db_connection():
    conn = psycopg2.connect(**DB_CONFIG)
    return conn