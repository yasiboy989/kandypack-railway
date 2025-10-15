import psycopg2

try:
    conn = psycopg2.connect(
        host="localhost",
        database="railway",
        user="post_chanul",
        password="chanul1234",
        port="5432"
    )
    print("✅ Database connected successfully!")
    conn.close()
except Exception as e:
    print("❌ Database connection failed!")
    print(e)
