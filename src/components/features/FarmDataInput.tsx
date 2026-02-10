import { useState } from 'react';
import { Save, MapPin, Calendar, Package, Wheat, Loader } from 'lucide-react';
import { useUser } from '../../context/UserContext';

export default function FarmDataInput() {
  const { farmData, setFarmData } = useUser();
  const [formData, setFormData] = useState({
    crop: farmData?.crop || '',
    quantity: farmData?.quantity || '',
    harvestDate: farmData?.harvestDate || '',
    location: farmData?.location || '',
    storage: farmData?.storage || '',
  });
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFarmData({
      crop: formData.crop,
      quantity: Number(formData.quantity),
      harvestDate: formData.harvestDate,
      location: formData.location,
      storage: formData.storage,
    });
    alert('Farm data saved successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          // Reverse geocoding using OpenStreetMap Nominatim API
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.display_name) {
            // Construct a simpler address if possible, or use display_name
            // Nominatim address structure: road, city, state, postcode, country
            const addr = data.address || {};
            const formattedLocation = [
              addr.village || addr.town || addr.city || addr.suburb,
              addr.state_district || addr.county,
              addr.state,
              addr.postcode
            ].filter(Boolean).join(', ');

            setFormData(prev => ({
              ...prev,
              location: formattedLocation || data.display_name
            }));
          } else {
            alert("Could not retrieve address details from coordinates.");
          }
        } catch (error) {
          console.error("Error fetching address:", error);
          alert("Failed to fetch address details.");
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setGettingLocation(false);
        alert("Unable to retrieve your location. Please check permissions.");
      }
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Farm Data Management</h2>
        <p className="text-green-100">
          Provide your farm details to get personalized market recommendations and profit predictions
        </p>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-8 border border-gray-200 dark:border-gray-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Crop Details */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Wheat className="w-5 h-5" />
              Crop Type
            </label>
            <select
              name="crop"
              value={formData.crop}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            >
              <option value="">Select Crop</option>
              {['Wheat', 'Rice (Basmati)', 'Rice (Common)', 'Maize', 'Jowar', 'Bajra', 'Ragi',
                'Bengal Gram (Chana)', 'Red Gram (Tur)', 'Green Gram (Moong)', 'Black Gram (Urad)', 'Lentil (Masur)',
                'Groundnut', 'Mustard', 'Soybean', 'Sunflower', 'Sesame',
                'Tomato', 'Onion', 'Potato', 'Brinjal', 'Cabbage', 'Cauliflower', 'Okra', 'Spinach', 'Carrot', 'Green Chilli', 'Ginger', 'Garlic',
                'Apple', 'Banana', 'Mango', 'Orange', 'Grapes', 'Papaya', 'Pomegranate',
                'Sugarcane', 'Cotton', 'Jute', 'Coconut',
                'Turmeric', 'Coriander', 'Cumin', 'Black Pepper'].sort().map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Package className="w-5 h-5" />
              Quantity (in kg)
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              step="0.1"
              placeholder="e.g., 100"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Harvest Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-5 h-5" />
              Harvest Date
            </label>
            <input
              type="date"
              name="harvestDate"
              value={formData.harvestDate}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <MapPin className="w-5 h-5" />
              Farm Location
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Village Name, District, State"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                {gettingLocation ? <Loader className="w-4 h-4 animate-spin" /> : <MapPin className="w-4 h-4" />}
                {gettingLocation ? 'Locating...' : 'Get Location'}
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Click 'Get Location' to auto-fill your address using GPS.
            </p>
          </div>

          {/* Storage Details */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Storage Facility Details
            </label>
            <textarea
              name="storage"
              value={formData.storage}
              onChange={handleChange}
              required
              rows={4}
              placeholder="Describe your storage facility (e.g., Cold storage, Warehouse, On-farm storage)"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
          >
            <Save className="w-5 h-5" />
            Save Farm Data
          </button>
        </form>
      </div>

      {/* Current Data Summary */}
      {farmData && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Current Farm Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Crop</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white capitalize">{farmData.crop}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Quantity</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{farmData.quantity} kg</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Harvest Date</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{farmData.harvestDate}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Location</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{farmData.location}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Storage</p>
              <p className="text-lg font-semibold text-gray-800 dark:text-white">{farmData.storage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
