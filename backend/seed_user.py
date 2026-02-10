from db import get_db_connection
from werkzeug.security import generate_password_hash

def seed_user():
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            
            email = "admin@example.com"
            password = "password123"
            name = "Admin User"
            phone = "1234567890"
            
            # Check if user exists
            cur.execute("SELECT id FROM users WHERE email = %s", (email,))
            if cur.fetchone():
                print(f"User {email} already exists.")
            else:
                password_hash = generate_password_hash(password)
                cur.execute("""
                    INSERT INTO users (name, email, phone, password_hash)
                    VALUES (%s, %s, %s, %s)
                """, (name, email, phone, password_hash))
                conn.commit()
                print(f"User {email} created successfully with password '{password}'")
                
            cur.close()
            conn.close()
        except Exception as e:
            print(f"Error seeding user: {e}")

if __name__ == "__main__":
    seed_user()
