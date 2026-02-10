from db import get_db_connection

def check_expanded_db():
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()
            
            print("--- Crops ---")
            cur.execute("SELECT * FROM crops")
            print(cur.fetchall())

            print("\n--- Markets ---")
            cur.execute("SELECT id, name, location, spoilage_risk FROM markets")
            print(cur.fetchall())

            print("\n--- Market Prices (Per KG) ---")
            cur.execute("""
                SELECT m.name, c.name, mp.price_per_kg, mp.date, mp.is_predicted 
                FROM market_prices mp 
                JOIN markets m ON mp.market_id = m.id 
                JOIN crops c ON mp.crop_id = c.id
                ORDER BY mp.date DESC LIMIT 5
            """)
            for row in cur.fetchall():
                print(row)

            cur.close()
            conn.close()
        except Exception as e:
            print(f"Error checking DB: {e}")

if __name__ == "__main__":
    check_expanded_db()
