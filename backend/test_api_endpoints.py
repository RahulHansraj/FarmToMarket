import requests
import unittest

# Direct access to Flask backend (no Vite proxy)
BASE_URL = "http://127.0.0.1:5000"

class TestAPI(unittest.TestCase):
    def test_get_crops(self):
        # Frontend /api/crops -> Backend /crops
        response = requests.get(f"{BASE_URL}/crops")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data) > 0)
        print(f"Found {len(data)} crops")

    def test_get_markets(self):
        # Frontend /api/markets -> Backend /markets
        response = requests.get(f"{BASE_URL}/markets")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data) > 0)
        print(f"Found {len(data)} markets")

    def test_get_prices(self):
        # Get first crop
        crops = requests.get(f"{BASE_URL}/crops").json()
        first_crop = crops[0]['name']
        
        # Frontend /api/prices -> Backend /prices
        response = requests.get(f"{BASE_URL}/prices?crop={first_crop}")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertTrue(len(data) > 0)
        print(f"Found {len(data)} price points for {first_crop}")
        
        # Check structure
        sample = data[0]
        self.assertIn('date', sample)
        self.assertIn('price', sample)
        self.assertIn('is_predicted', sample)
        self.assertIn('market', sample)

if __name__ == '__main__':
    unittest.main()
