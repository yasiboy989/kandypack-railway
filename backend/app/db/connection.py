import os
from dotenv import load_dotenv
import psycopg2
import urllib.parse as urlparse

# Load environment variables from .env file
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

try:
    # Parse the database URL
    result = urlparse.urlparse(DATABASE_URL)
    username = result.username
    password = result.password
    database = result.path[1:]
    hostname = result.hostname
    port = result.port or 5432  # Use default 5432 if port is not specified

    conn = psycopg2.connect(
        host=hostname,
        database=database,
        user=username,
        password=password,
        port=port,
        sslmode='require'
    )
    print("✅ Database connected successfully!")
    conn.close()

except Exception as e:
    print("❌ Database connection failed!")
    print(e)
