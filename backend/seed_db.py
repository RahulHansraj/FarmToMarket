from db import get_db_connection
from datetime import date, timedelta
import random

def seed_db():
    conn = get_db_connection()
    if conn:
        try:
            cur = conn.cursor()

            print("Clearing old price data...")
            cur.execute("TRUNCATE TABLE market_prices CASCADE;")

            # 1. Seed Crops (Comprehensive Indian List)
            crops_data = {
                'Cereals': ['Wheat', 'Rice (Basmati)', 'Rice (Common)', 'Maize', 'Jowar', 'Bajra', 'Ragi'],
                'Pulses': ['Bengal Gram (Chana)', 'Red Gram (Tur)', 'Green Gram (Moong)', 'Black Gram (Urad)', 'Lentil (Masur)'],
                'Oilseeds': ['Groundnut', 'Mustard', 'Soybean', 'Sunflower', 'Sesame'],
                'Vegetables': ['Tomato', 'Onion', 'Potato', 'Brinjal', 'Cabbage', 'Cauliflower', 'Okra', 'Spinach', 'Carrot', 'Green Chilli', 'Ginger', 'Garlic'],
                'Fruits': ['Apple', 'Banana', 'Mango', 'Orange', 'Grapes', 'Papaya', 'Pomegranate'],
                'Commercial': ['Sugarcane', 'Cotton', 'Jute', 'Coconut'],
                'Spices': ['Turmeric', 'Coriander', 'Cumin', 'Black Pepper']
            }

            all_crops = []
            for category, list_of_crops in crops_data.items():
                all_crops.extend(list_of_crops)

            print(f"Seeding {len(all_crops)} crops...")
            for crop in all_crops:
                cur.execute("INSERT INTO crops (name) VALUES (%s) ON CONFLICT (name) DO NOTHING;", (crop,))
            
            # 2. Seed Markets
            markets = [
                {'name': 'Azadpur Mandi', 'location': 'Delhi', 'lat': 28.7041, 'lng': 77.1025, 'risk': 'Low'},
                {'name': 'Vashi Market', 'location': 'Mumbai', 'lat': 19.0760, 'lng': 72.8777, 'risk': 'Medium'},
                {'name': 'Koyambedu Market', 'location': 'Chennai', 'lat': 13.0827, 'lng': 80.2707, 'risk': 'Low'},
                {'name': 'Yeshwanthpur', 'location': 'Bangalore', 'lat': 13.0206, 'lng': 77.5485, 'risk': 'Low'},
                {'name': 'Bowenpally', 'location': 'Hyderabad', 'lat': 17.4764, 'lng': 78.4716, 'risk': 'Low'},
                {'name': 'Ghazipur', 'location': 'Delhi', 'lat': 28.6256, 'lng': 77.3323, 'risk': 'High'},
                {'name': 'Gultekdi', 'location': 'Pune', 'lat': 18.4890, 'lng': 73.8665, 'risk': 'Low'},
                {'name': 'Keshopur', 'location': 'Delhi', 'lat': 28.6430, 'lng': 77.0870, 'risk': 'Medium'},
                {'name': 'Manikpool', 'location': 'Kolkata', 'lat': 22.5726, 'lng': 88.3639, 'risk': 'High'}
            ]
            
            for m in markets:
                cur.execute("""
                    INSERT INTO markets (name, location, lat, lng, spoilage_risk) 
                    VALUES (%s, %s, %s, %s, %s)
                    ON CONFLICT DO NOTHING;
                """, (m['name'], m['location'], m['lat'], m['lng'], m['risk']))

            conn.commit()

            # Helper to get IDs
            def get_id(table, name):
                cur.execute(f"SELECT id FROM {table} WHERE name = %s", (name,))
                res = cur.fetchone()
                return res[0] if res else None

            # Base prices (per kg) and volatility
            # Volatility: higher number = more fluctuation (e.g., vegetables > grains)
            base_price_map = {
                'Wheat': (32, 0.05), 'Rice (Basmati)': (85, 0.04), 'Rice (Common)': (45, 0.03),
                'Tomato': (40, 0.25), 'Onion': (35, 0.20), 'Potato': (25, 0.15),
                'Apple': (120, 0.10), 'Banana': (40, 0.08),
                'Cotton': (65, 0.06), 'Sugarcane': (4, 0.02),
                'Green Chilli': (60, 0.30), 'Ginger': (80, 0.15),
                'Turmeric': (110, 0.05)
            }
            default_base = (50, 0.10)

            # 4. Generate 6 Months of Price Data
            print("Generating 6 months of historical data with realistic trends...")
            
            today = date.today()
            start_date = today - timedelta(days=180) # 6 months ago
            
            crop_ids = {c: get_id('crops', c) for c in all_crops}
            market_ids = {m['name']: get_id('markets', m['name']) for m in markets}

            count = 0
            for market_name, market_id in market_ids.items():
                if not market_id: continue
                
                for crop_name, crop_id in crop_ids.items():
                    if not crop_id: continue

                    base, volatility = base_price_map.get(crop_name, default_base)
                    
                    # Add regional variation (random +/- 15% per market)
                    regional_multiplier = random.uniform(0.85, 1.15)
                    start_price = base * regional_multiplier
                    
                    current_price = start_price
                    trend_direction = random.choice([-1, 1]) # Initial trend
                    trend_duration = random.randint(5, 15)   # How many days trend lasts
                    trend_counter = 0

                    for i in range(195): # 180 days history + 15 days forecast
                        day_date = start_date + timedelta(days=i)
                        is_predicted = day_date > today

                        # Trend logic: periodic reversals to simulate seasonal/supply-demand cycles
                        if trend_counter >= trend_duration:
                            trend_direction *= -1 # Reverse trend
                            trend_duration = random.randint(7, 21)
                            trend_counter = 0
                        trend_counter += 1

                        # Daily random walk + Trend
                        noise = random.normalvariate(0, base * volatility * 0.1) # Random noise
                        drift = trend_direction * (base * volatility * 0.05)     # Directional drift
                        
                        current_price += noise + drift
                        
                        # Soft boundaries to keep prices realistic (0.4x to 2.5x of base)
                        if current_price < base * 0.4: 
                            current_price = base * 0.4
                            trend_direction = 1 # Force upward correction
                        elif current_price > base * 2.5: 
                            current_price = base * 2.5
                            trend_direction = -1 # Force downward correction

                        cur.execute("""
                            INSERT INTO market_prices (market_id, crop_id, price_per_kg, date, is_predicted)
                            VALUES (%s, %s, %s, %s, %s)
                            ON CONFLICT (market_id, crop_id, date, is_predicted) 
                            DO UPDATE SET price_per_kg = EXCLUDED.price_per_kg;
                        """, (market_id, crop_id, round(current_price, 2), day_date, is_predicted))
                        count += 1
                        
            conn.commit()
            print(f"Database seeded successfully! Inserted {count} price records.")
            cur.close()
            conn.close()
        except Exception as e:
            print(f"Error seeding database: {e}")
            if conn: conn.rollback()

if __name__ == "__main__":
    seed_db()
