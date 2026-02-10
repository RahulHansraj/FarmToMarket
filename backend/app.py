from werkzeug.security import generate_password_hash, check_password_hash
from flask import Flask, jsonify, request
from flask_cors import CORS
from db import get_db_connection
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

@app.route('/')
def index():
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({"message": "Successfully connected to PostgreSQL!"}), 200
    else:
        return jsonify({"error": "Failed to connect to database."}), 500

@app.route('/signup', methods=['POST'])
def signup():
    print("Received signup request")
    data = request.json
    print(f"Signup Data: {data}")
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    password = data.get('password')

    if not all([name, email, password]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        cur.execute("SELECT id FROM users WHERE email = %s", (email,))
        if cur.fetchone():
            return jsonify({"error": "Email already registered"}), 409
        
        password_hash = generate_password_hash(password)
        cur.execute(
            "INSERT INTO users (name, email, phone, password_hash) VALUES (%s, %s, %s, %s) RETURNING id",
            (name, email, phone, password_hash)
        )
        user_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        return jsonify({"message": "User created successfully", "user_id": user_id}), 201
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/login', methods=['POST'])
def login():
    print("Received login request")
    data = request.json
    print(f"Login Data: {data}")
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Missing email or password"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, password_hash FROM users WHERE email = %s", (email,))
        user = cur.fetchone()
        cur.close()
        conn.close()

        if user and check_password_hash(user[2], password):
            return jsonify({"message": "Login successful", "user": {"id": user[0], "name": user[1], "email": email}}), 200
        else:
            return jsonify({"error": "Invalid email or password"}), 401
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/prices', methods=['GET'])
def get_prices():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    crop = request.args.get('crop')
    market = request.args.get('market')
    
    try:
        cur = conn.cursor()
        
        # Build query dynamically based on filters
        query = """
            SELECT mp.date, mp.price_per_kg, mp.is_predicted, c.name, m.name
            FROM market_prices mp
            JOIN crops c ON mp.crop_id = c.id
            JOIN markets m ON mp.market_id = m.id
            WHERE 1=1
        """
        params = []
        
        if crop:
            query += " AND c.name ILIKE %s"
            params.append(crop)
        
        if market:
            query += " AND m.name ILIKE %s"
            params.append(market)
            
        query += " ORDER BY mp.date ASC"
        
        cur.execute(query, tuple(params))
        rows = cur.fetchall()
        
        # Format response
        data = []
        for row in rows:
            data.append({
                "date": row[0].strftime('%Y-%m-%d'),
                "price": float(row[1]),
                "is_predicted": row[2],
                "crop": row[3],
                "market": row[4]
            })
            
        cur.close()
        conn.close()
        return jsonify(data), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/markets', methods=['GET'])
def get_markets():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name, location, lat, lng, spoilage_risk FROM markets")
        rows = cur.fetchall()
        
        markets = []
        for row in rows:
            markets.append({
                "id": row[0],
                "name": row[1],
                "location": row[2],
                "coordinates": {"lat": float(row[3]), "lng": float(row[4])},
                "spoilageRisk": row[5]
            })
            
        cur.close()
        conn.close()
        return jsonify(markets), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/crops', methods=['GET'])
def get_crops():
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, name FROM crops ORDER BY name")
        rows = cur.fetchall()
        
        crops = [{"id": r[0], "name": r[1]} for r in rows]
            
        cur.close()
        conn.close()
        return jsonify(crops), 200
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

# ... existing code ...

import requests
from openai import AzureOpenAI
import json

# Initialize Azure OpenAI Client
def get_openai_client():
    return AzureOpenAI(
        api_key=os.getenv("AZURE_OPENAI_API_KEY"),
        api_version="2024-02-15-preview",
        azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT")
    )

@app.route('/api/ai/speech-token', methods=['GET'])
def get_speech_token():
    try:
        speech_key = os.getenv('AZURE_SPEECH_KEY')
        speech_region = os.getenv('AZURE_SPEECH_REGION')

        if not speech_key or not speech_region:
            return jsonify({"error": "Speech key or region not configured"}), 500

        headers = {
            'Ocp-Apim-Subscription-Key': speech_key,
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        response = requests.post(
            f'https://{speech_region}.api.cognitive.microsoft.com/sts/v1.0/issueToken',
            headers=headers
        )

        if response.status_code == 200:
            return jsonify({
                "token": response.text,
                "region": speech_region
            })
        else:
            return jsonify({"error": "Failed to get token"}), response.status_code
    except Exception as e:
        print(f"Error getting speech token: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/api/ai/chat', methods=['POST'])
def chat_with_ai():
    data = request.json
    user_message = data.get('message')
    user_id = data.get('user_id', 1) # Default to admin for now
    system_prompt_addition = data.get('system_prompt_addition', '')

    if not user_message:
        return jsonify({"error": "Message is required"}), 400

    client = get_openai_client()

    # Define tools (functions) the AI can call
    tools = [
        {
            "type": "function",
            "function": {
                "name": "update_farm_data",
                "description": "Update farm data (crop, quantity, location) in the database based on user input",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "crop_name": {
                            "type": "string",
                            "description": "Name of the crop (e.g., Wheat, Rice)"
                        },
                        "quantity": {
                            "type": "number",
                            "description": "Quantity in kg or quintals (convert to kg)"
                        },
                        "location": {
                            "type": "string",
                            "description": "Location of the farm"
                        },
                        "harvest_date": {
                            "type": "string",
                            "description": "Harvest date in YYYY-MM-DD format"
                        }
                    },
                    "required": ["crop_name"]
                }
            }
        }
    ]

    try:
        # 1. Call OpenAI
        base_system_message = "You are a helpful agricultural assistant. You can update farm data in the database if the user provides details like crop name, quantity, and location. If data is missing (e.g. location), ask for it before updating. Be concise."
        
        if system_prompt_addition:
            base_system_message += f" {system_prompt_addition}"

        messages = [
            {"role": "system", "content": base_system_message},
            {"role": "user", "content": user_message}
        ]

        response = client.chat.completions.create(
            model="gpt-35-turbo", # OR your deployment name from env if variable
            messages=messages,
            tools=tools,
            tool_choice="auto"
        )

        response_message = response.choices[0].message
        
        # 2. Check if AI wants to call a function
        if response_message.tool_calls:
            tool_call = response_message.tool_calls[0]
            function_name = tool_call.function.name
            function_args = json.loads(tool_call.function.arguments)

            if function_name == "update_farm_data":
                # Execute the database update
                conn = get_db_connection()
                if conn:
                    cur = conn.cursor()
                    
                    # Find crop ID
                    cur.execute("SELECT id FROM crops WHERE name ILIKE %s", (function_args.get('crop_name'),))
                    crop_res = cur.fetchone()
                    
                    if not crop_res:
                        # Auto-insert crop if not exists? Or tell user.
                        # For now, let's insert it
                        cur.execute("INSERT INTO crops (name) VALUES (%s) RETURNING id", (function_args.get('crop_name'),))
                        crop_id = cur.fetchone()[0]
                    else:
                        crop_id = crop_res[0]

                    # Insert/Update farm data
                    # Default values if missing
                    qty = function_args.get('quantity', 0)
                    loc = function_args.get('location', 'Unknown')
                    date = function_args.get('harvest_date', '2024-01-01')

                    cur.execute("""
                        INSERT INTO farm_data (user_id, crop_id, quantity_kg, location, harvest_date)
                        VALUES (%s, %s, %s, %s, %s)
                    """, (user_id, crop_id, qty, loc, date))
                    
                    conn.commit()
                    cur.close()
                    conn.close()

                    # Report back to AI
                    messages.append(response_message)
                    messages.append({
                        "tool_call_id": tool_call.id,
                        "role": "tool",
                        "name": function_name,
                        "content": "Successfully updated database with farm data."
                    })

                    # Get final response from AI
                    second_response = client.chat.completions.create(
                        model="gpt-35-turbo",
                        messages=messages
                    )
                    return jsonify({"response": second_response.choices[0].message.content})

        # Normal response
        return jsonify({"response": response_message.content})

    except Exception as e:
        print(f"AI Error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
