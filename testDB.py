import psycopg2

try:
    conn = psycopg2.connect(
        dbname="postgres",
        user="postgres",
        password="YuAEmUHpw24PRASZ",
        host="db.mysczevyslcwxzeufsax.supabase.co",
        port="5432"
    )
    print("Connected successfully")
except psycopg2.OperationalError as e:
    print("Connection failed:")
    print(e)
