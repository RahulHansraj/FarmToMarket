import { Cloud, CloudRain, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-react';

export default function WeatherAlerts() {
  const currentWeather = {
    temperature: 28,
    humidity: 65,
    rainfall: 12,
    windSpeed: 15,
    condition: 'Partly Cloudy',
  };

  const alerts = [
    {
      type: 'warning',
      title: 'Heavy Rainfall Expected',
      message: 'Heavy rainfall predicted in your area on Feb 12-13. Consider harvesting early or ensuring proper drainage.',
      date: 'Feb 9, 2026',
      severity: 'high',
    },
    {
      type: 'info',
      title: 'Optimal Temperature',
      message: 'Temperature conditions are ideal for crop growth. Maintain current irrigation schedule.',
      date: 'Feb 9, 2026',
      severity: 'low',
    },
    {
      type: 'warning',
      title: 'High Humidity Alert',
      message: 'Humidity levels rising. Monitor for potential fungal growth. Consider applying preventive measures.',
      date: 'Feb 8, 2026',
      severity: 'medium',
    },
  ];

  const forecast = [
    { day: 'Today', temp: 28, condition: 'Partly Cloudy', rain: 20, icon: Cloud },
    { day: 'Tomorrow', temp: 27, condition: 'Light Rain', rain: 60, icon: CloudRain },
    { day: 'Feb 11', temp: 26, condition: 'Rainy', rain: 80, icon: CloudRain },
    { day: 'Feb 12', temp: 25, condition: 'Heavy Rain', rain: 90, icon: CloudRain },
    { day: 'Feb 13', temp: 27, condition: 'Cloudy', rain: 40, icon: Cloud },
    { day: 'Feb 14', temp: 29, condition: 'Sunny', rain: 10, icon: Cloud },
  ];

  return (
    <div className="space-y-6">
      {/* Current Weather */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Current Weather</h2>
            <p className="text-blue-100">Location: Your Farm</p>
          </div>
          <Cloud className="w-20 h-20 text-white/80" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5" />
              <span className="text-sm">Temperature</span>
            </div>
            <p className="text-3xl font-bold">{currentWeather.temperature}°C</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Droplets className="w-5 h-5" />
              <span className="text-sm">Humidity</span>
            </div>
            <p className="text-3xl font-bold">{currentWeather.humidity}%</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CloudRain className="w-5 h-5" />
              <span className="text-sm">Rainfall</span>
            </div>
            <p className="text-3xl font-bold">{currentWeather.rainfall}mm</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wind className="w-5 h-5" />
              <span className="text-sm">Wind Speed</span>
            </div>
            <p className="text-3xl font-bold">{currentWeather.windSpeed} km/h</p>
          </div>
        </div>
      </div>

      {/* Weather Alerts */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Active Weather Alerts</h3>
        <div className="space-y-4">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={`p-4 rounded-xl border-l-4 ${
                alert.severity === 'high'
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : alert.severity === 'medium'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500'
                  : 'bg-blue-50 dark:bg-blue-900/20 border-blue-500'
              }`}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={`w-6 h-6 mt-1 ${
                    alert.severity === 'high'
                      ? 'text-red-600 dark:text-red-400'
                      : alert.severity === 'medium'
                      ? 'text-yellow-600 dark:text-yellow-400'
                      : 'text-blue-600 dark:text-blue-400'
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800 dark:text-white">{alert.title}</h4>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{alert.date}</span>
                  </div>
                  <p className="text-gray-700 dark:text-gray-300">{alert.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6-Day Forecast */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">6-Day Forecast</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {forecast.map((day, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-center border border-gray-200 dark:border-gray-700"
            >
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{day.day}</p>
              <day.icon className="w-10 h-10 mx-auto mb-3 text-blue-500 dark:text-blue-400" />
              <p className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{day.temp}°C</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{day.condition}</p>
              <div className="flex items-center justify-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                <CloudRain className="w-4 h-4" />
                <span>{day.rain}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations Based on Weather */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Farming Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">✓ Good Conditions For:</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Current irrigation schedule</li>
              <li>• Fertilizer application</li>
              <li>• Pest monitoring</li>
            </ul>
          </div>
          <div className="bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
            <h4 className="font-semibold text-orange-700 dark:text-orange-400 mb-2">⚠ Avoid This Week:</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Postpone harvesting until Feb 14</li>
              <li>• Delay pesticide spraying</li>
              <li>• Reduce irrigation during rainfall</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
