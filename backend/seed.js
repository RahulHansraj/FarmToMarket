const { Client } = require('pg');
require('dotenv').config();

const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

const seed = async () => {
  try {
    await client.connect();
    console.log('Connected to database');

    // 1. Create Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20),
        password_hash VARCHAR(200) NOT NULL
      );

      CREATE TABLE IF NOT EXISTS crops (
        id SERIAL PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL
      );

      CREATE TABLE IF NOT EXISTS markets (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        location VARCHAR(100) NOT NULL,
        lat FLOAT,
        lng FLOAT,
        spoilage_risk VARCHAR(20)
      );

      CREATE TABLE IF NOT EXISTS sellers (
        id SERIAL PRIMARY KEY,
        market_id INTEGER REFERENCES markets(id),
        name VARCHAR(100),
        phone VARCHAR(20),
        email VARCHAR(100),
        address TEXT
      );

      CREATE TABLE IF NOT EXISTS market_prices (
        id SERIAL PRIMARY KEY,
        market_id INTEGER REFERENCES markets(id),
        crop_id INTEGER REFERENCES crops(id),
        price_per_kg FLOAT NOT NULL,
        date DATE NOT NULL,
        is_predicted BOOLEAN DEFAULT FALSE,
        UNIQUE(market_id, crop_id, date, is_predicted)
      );

      CREATE TABLE IF NOT EXISTS farm_data (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        crop_id INTEGER REFERENCES crops(id),
        quantity_kg FLOAT,
        harvest_date DATE,
        location VARCHAR(200),
        storage_details TEXT
      );
    `);
    console.log('Tables created/verified');

    // 2. Clear Existing Data (Optional but good for fresh seed)
    await client.query('TRUNCATE TABLE market_prices, farm_data, sellers, markets, crops, users RESTART IDENTITY CASCADE;');
    console.log('Old data cleared');

    // 3. Seed Crops
    const crops = [
      'Wheat', 'Rice (Basmati)', 'Rice (Common)', 'Maize', 'Jowar', 'Bajra', 'Ragi',
      'Bengal Gram (Chana)', 'Red Gram (Tur)', 'Green Gram (Moong)', 'Black Gram (Urad)', 'Lentil (Masur)',
      'Groundnut', 'Mustard', 'Soybean', 'Sunflower', 'Sesame',
      'Tomato', 'Onion', 'Potato', 'Brinjal', 'Cabbage', 'Cauliflower', 'Okra', 'Spinach', 'Carrot', 'Green Chilli', 'Ginger', 'Garlic',
      'Apple', 'Banana', 'Mango', 'Orange', 'Grapes', 'Papaya', 'Pomegranate',
      'Sugarcane', 'Cotton', 'Jute', 'Coconut',
      'Turmeric', 'Coriander', 'Cumin', 'Black Pepper'
    ];

    for (const crop of crops) {
      await client.query('INSERT INTO crops (name) VALUES ($1) ON CONFLICT DO NOTHING', [crop]);
    }
    console.log(`Seeded ${crops.length} crops`);

    // 4. Seed Markets
    const markets = [
      { name: 'Azadpur Mandi', location: 'Delhi', lat: 28.7041, lng: 77.1025, risk: 'Low' },
      { name: 'Vashi Market', location: 'Mumbai', lat: 19.0760, lng: 72.8777, risk: 'Medium' },
      { name: 'Koyambedu Market', location: 'Chennai', lat: 13.0827, lng: 80.2707, risk: 'Low' },
      { name: 'Yeshwanthpur', location: 'Bangalore', lat: 13.0206, lng: 77.5485, risk: 'Low' },
      { name: 'Bowenpally', location: 'Hyderabad', lat: 17.4764, lng: 78.4716, risk: 'Low' },
      { name: 'Ghazipur', location: 'Delhi', lat: 28.6256, lng: 77.3323, risk: 'High' },
      { name: 'Gultekdi', location: 'Pune', lat: 18.4890, lng: 73.8665, risk: 'Low' },
      { name: 'Keshopur', location: 'Delhi', lat: 28.6430, lng: 77.0870, risk: 'Medium' },
      { name: 'Manikpool', location: 'Kolkata', lat: 22.5726, lng: 88.3639, risk: 'High' }
    ];

    for (const m of markets) {
      await client.query(
        'INSERT INTO markets (name, location, lat, lng, spoilage_risk) VALUES ($1, $2, $3, $4, $5) ON CONFLICT DO NOTHING',
        [m.name, m.location, m.lat, m.lng, m.risk]
      );
    }
    console.log(`Seeded ${markets.length} markets`);

    // 5. Seed Users
    // Password is 'password123' hashed with pbkdf2:sha256 (generic placeholder hash for example)
    // Note: Python's werkzeug uses specific format. For now, we insert a placeholder.
    // Real auth won't work without Python backend anyway, so the hash format is less critical for *viewing* data.
    const userResult = await client.query(`
      INSERT INTO users (name, email, phone, password_hash)
      VALUES ('Admin User', 'admin@example.com', '1234567890', 'pbkdf2:sha256:260000$....')
      RETURNING id
    `);
    const userId = userResult.rows[0].id;
    console.log('Seeded default user');

    // 6. Seed Farm Data
    const cropRes = await client.query('SELECT id, name FROM crops');
    const cropMap = {};
    cropRes.rows.forEach(r => cropMap[r.name] = r.id);

    await client.query(`
      INSERT INTO farm_data (user_id, crop_id, quantity_kg, harvest_date, location, storage_details)
      VALUES 
      ($1, $2, 5000, '2023-10-15', 'Field A', 'Silo 1'),
      ($1, $3, 2000, '2023-11-20', 'Field B', 'Cold Storage')
    `, [userId, cropMap['Wheat'], cropMap['Rice (Basmati)']]);
    console.log('Seeded farm data');

    // 7. Seed Price History (Complex Logic Ported from Python)
    console.log('Generating price history...');
    
    const basePriceMap = {
      'Wheat': [32, 0.05], 'Rice (Basmati)': [85, 0.04], 'Rice (Common)': [45, 0.03],
      'Tomato': [40, 0.25], 'Onion': [35, 0.20], 'Potato': [25, 0.15],
      'Apple': [120, 0.10], 'Banana': [40, 0.08],
      'Cotton': [65, 0.06], 'Sugarcane': [4, 0.02],
      'Green Chilli': [60, 0.30], 'Ginger': [80, 0.15],
      'Turmeric': [110, 0.05]
    };
    const defaultBase = [50, 0.10];

    // Get IDs again to be sure
    const marketRes = await client.query('SELECT id, name FROM markets');
    const marketMap = {};
    marketRes.rows.forEach(r => marketMap[r.name] = r.id);

    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 180);

    const priceValues = [];
    
    for (const mName of Object.keys(marketMap)) {
      const marketId = marketMap[mName];
      
      for (const cName of Object.keys(cropMap)) {
        const cropId = cropMap[cName];
        
        const [base, volatility] = basePriceMap[cName] || defaultBase;
        
        // Regional multiplier
        const regionalMultiplier = 0.85 + Math.random() * 0.30;
        let currentPrice = base * regionalMultiplier;
        
        let trendDirection = Math.random() < 0.5 ? -1 : 1;
        let trendDuration = 5 + Math.floor(Math.random() * 10);
        let trendCounter = 0;

        for (let i = 0; i < 195; i++) {
          const dayDate = new Date(startDate);
          dayDate.setDate(startDate.getDate() + i);
          const isPredicted = dayDate > today;
          
          if (trendCounter >= trendDuration) {
            trendDirection *= -1;
            trendDuration = 7 + Math.floor(Math.random() * 15);
            trendCounter = 0;
          }
          trendCounter++;

          // Random walk
          const noise = (Math.random() - 0.5) * 2 * (base * volatility * 0.1); // Approx normal-ish
          const drift = trendDirection * (base * volatility * 0.05);

          currentPrice += noise + drift;

          // Boundaries
          if (currentPrice < base * 0.4) {
            currentPrice = base * 0.4;
            trendDirection = 1;
          } else if (currentPrice > base * 2.5) {
            currentPrice = base * 2.5;
            trendDirection = -1;
          }

          // Format date YYYY-MM-DD
          const dateStr = dayDate.toISOString().split('T')[0];
          
          // Push to batch (or insert individually if batch is too big, but 195 * crops * markets is a lot)
          // Let's insert individually for simplicity in this script or small batches
          // Actually, let's just do it directly to avoid massive memory usage
          await client.query(`
            INSERT INTO market_prices (market_id, crop_id, price_per_kg, date, is_predicted)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (market_id, crop_id, date, is_predicted) DO UPDATE SET price_per_kg = EXCLUDED.price_per_kg
          `, [marketId, cropId, parseFloat(currentPrice.toFixed(2)), dateStr, isPredicted]);
        }
      }
    }
    
    console.log('Price history seeded successfully');

  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    await client.end();
  }
};

seed();
