import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")
    DB_HOST = os.getenv("DB_HOST")
    DB_PORT = os.getenv("DB_PORT")
    DB_NAME = os.getenv("DB_NAME")

    DATABASE_URL = F"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

    POOL_SIZE = 10
    MAX_OVERFLOW = 20

DB_CONFIG = {
    "host": Config.DB_HOST,
    "database": Config.DB_NAME,
    "user": Config.DB_USER,
    "password": Config.DB_PASSWORD,
    "port":Config.DB_PORT
}