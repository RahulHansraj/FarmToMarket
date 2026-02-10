import { TrendingUp, MapPin, AlertTriangle, DollarSign, Calendar, Satellite } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../../context/UserContext';

export default function OverviewDashboard() {
  const { farmData, notifications } = useUser();

  const quickStats = [
    { label: 'Today\'s Best Price', value: '₹48.50/kg', change: '+12%', icon: TrendingUp, color: 'green' },
    { label: 'Active Alerts', value: notifications.length.toString(), change: 'New', icon: AlertTriangle, color: 'yellow' },
    { label: 'Potential Profit', value: '₹48,500', change: '+18%', icon: DollarSign, color: 'emerald' },
    { label: 'Best Selling Day', value: 'Feb 15', change: '6 days', icon: Calendar, color: 'blue' },
  ];

  const priceData = [
    { date: 'Feb 3', price: 4200 },
    { date: 'Feb 4', price: 4350 },
    { date: 'Feb 5', price: 4280 },
    { date: 'Feb 6', price: 4500 },
    { date: 'Feb 7', price: 4650 },
    { date: 'Feb 8', price: 4720 },
    { date: 'Feb 9', price: 4850 },
  ];

  const topMarkets = [
    { name: 'Azadpur Mandi', location: 'Delhi', profit: '₹52,000', distance: '45 km', risk: 'Low' },
    { name: 'Vashi Market', location: 'Mumbai', profit: '₹48,500', distance: '320 km', risk: 'Medium' },
    { name: 'Koyambedu Market', location: 'Chennai', profit: '₹45,200', distance: '180 km', risk: 'Low' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Welcome Back, Farmer!</h1>
        <p className="text-green-100">
          {farmData ? `Managing ${farmData.crop} - ${farmData.quantity} kg` : 'Complete your farm profile to get personalized insights'}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickStats.map((stat, index) => (
          <div key={index} className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-lg bg-${stat.color}-100 dark:bg-${stat.color}-900/20`}>
                <stat.icon className={`w-6 h-6 text-${stat.color}-600 dark:text-${stat.color}-400`} />
              </div>
              <span className={`text-sm font-semibold text-${stat.color}-600 dark:text-${stat.color}-400`}>
                {stat.change}
              </span>
            </div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white mb-1">{stat.value}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Price Trends */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">7-Day Price Trend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={priceData}>
            <defs>
              <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Area type="monotone" dataKey="price" stroke="#10b981" fillOpacity={1} fill="url(#colorPrice)" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Top Markets */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Top Recommended Markets</h3>
        <div className="space-y-4">
          {topMarkets.map((market, index) => (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-750 transition-colors cursor-pointer"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-semibold text-gray-800 dark:text-white">{market.name}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${market.risk === 'Low' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                    }`}>
                    {market.risk} Risk
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {market.location}
                  </span>
                  <span>{market.distance}</span>
                </div>
              </div>
              <div className="mt-3 md:mt-0 text-right">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{market.profit}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Expected Profit</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Satellite Monitoring */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3 mb-4">
          <Satellite className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Satellite Farm Monitoring</h3>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-xl p-6 border-2 border-dashed border-blue-300 dark:border-blue-700">
          <p className="text-gray-700 dark:text-gray-300 mb-4">
            Enable satellite monitoring to track crop health in real-time using AI-powered image analysis.
          </p>
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors">
            Configure Satellite Monitoring
          </button>
        </div>
      </div>
    </div>
  );
}
