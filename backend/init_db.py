from db import get_db_connection

def init_db():
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            # Users table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    phone VARCHAR(20),
                    password_hash VARCHAR(200) NOT NULL
                );
            """)

            # Crops table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS crops (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(50) UNIQUE NOT NULL
                );
            """)

            # Markets table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS markets (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(100) NOT NULL,
                    location VARCHAR(100) NOT NULL,
                    lat FLOAT,
                    lng FLOAT,
                    spoilage_risk VARCHAR(20)
                );
            """)

            # Sellers table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS sellers (
                    id SERIAL PRIMARY KEY,
                    market_id INTEGER REFERENCES markets(id),
                    name VARCHAR(100),
                    phone VARCHAR(20),
                    email VARCHAR(100),
                    address TEXT
                );
            """)

            # Market Prices table (prices in INR/kg)
            cur.execute("""
                CREATE TABLE IF NOT EXISTS market_prices (
                    id SERIAL PRIMARY KEY,
                    market_id INTEGER REFERENCES markets(id),
                    crop_id INTEGER REFERENCES crops(id),
                    price_per_kg FLOAT NOT NULL,
                    date DATE NOT NULL,
                    is_predicted BOOLEAN DEFAULT FALSE,
                    UNIQUE(market_id, crop_id, date, is_predicted)
                );
            """)

            # Farm Data table
            cur.execute("""
                CREATE TABLE IF NOT EXISTS farm_data (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER REFERENCES users(id),
                    crop_id INTEGER REFERENCES crops(id),
                    quantity_kg FLOAT,
                    harvest_date DATE,
                    location VARCHAR(200),
                    storage_details TEXT
                );
            """)
            conn.commit()
            cur.close()
            conn.close()
            print("Database initialized successfully.")
        except Exception as e:
            print(f"Error initializing database: {e}")

if __name__ == "__main__":
    init_db()
