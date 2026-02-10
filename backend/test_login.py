import requests
import json

BASE_URL = "http://127.0.0.1:5000"

def test_login():
    # 1. Signup a test user
    signup_data = {
        "name": "Test User",
        "email": "test@example.com",
        "phone": "1234567890",
        "password": "password123"
    }
    
    print("Testing Signup...")
    try:
        response = requests.post(f"{BASE_URL}/signup", json=signup_data)
        print(f"Signup Status: {response.status_code}")
        print(f"Signup Response: {response.text}")
    except Exception as e:
        print(f"Signup Request Failed: {e}")

    # 2. Login with the user
    login_data = {
        "email": "test@example.com",
        "password": "password123"
    }

    print("\nTesting Login...")
    try:
        response = requests.post(f"{BASE_URL}/login", json=login_data)
        print(f"Login Status: {response.status_code}")
        print(f"Login Response: {response.text}")
    except Exception as e:
        print(f"Login Request Failed: {e}")

if __name__ == "__main__":
    test_login()
