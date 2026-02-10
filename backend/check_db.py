from db import get_db_connection
import os
from dotenv import load_dotenv

# Explicitly load .env from the same directory as this script
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

def check_data():
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            cur.execute("SELECT * FROM users")
            rows = cur.fetchall()
            print(f"Connection successful. Found {len(rows)} users in the database.")
            for row in rows:
                print(row)
            cur.close()
            conn.close()
        except Exception as e:
            print(f"Error querying database: {e}")
    else:
        print("Failed to connect to database.")

if __name__ == "__main__":
    check_data()
