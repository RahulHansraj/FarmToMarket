import { DollarSign, TrendingUp, Calendar, MapPin } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useUser } from '../../context/UserContext';

export default function ProfitDashboard() {
  const { confirmedMarkets, farmData } = useUser();

  const monthlyProfits = [
    { month: 'Sep', profit: 45000, cost: 20000 },
    { month: 'Oct', profit: 52000, cost: 22000 },
    { month: 'Nov', profit: 48000, cost: 21000 },
    { month: 'Dec', profit: 55000, cost: 23000 },
    { month: 'Jan', profit: 58000, cost: 24000 },
    { month: 'Feb', profit: 62000, cost: 25000 },
  ];

  const profitBreakdown = [
    { name: 'Crop Sales', value: 180000, color: '#10b981' },
    { name: 'Transport Costs', value: 25000, color: '#f59e0b' },
    { name: 'Storage Costs', value: 15000, color: '#ef4444' },
    { name: 'Net Profit', value: 140000, color: '#3b82f6' },
  ];

  const marketComparison = [
    { market: 'Azadpur', profit: 52000 },
    { market: 'Vashi', profit: 48500 },
    { market: 'Koyambedu', profit: 45200 },
    { market: 'Yeshwanthpur', profit: 46500 },
  ];

  const totalProfit = confirmedMarkets.reduce((sum, market) => sum + (market.finalProfit || 0), 0);
  const avgProfit = confirmedMarkets.length > 0 ? totalProfit / confirmedMarkets.length : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-10 h-10" />
            <span className="text-sm bg-white/20 px-3 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-3xl font-bold mb-1">₹1,40,000</p>
          <p className="text-green-100">Total Net Profit (6 months)</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
              <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">Monthly Avg</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">₹23,333</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Average Monthly Profit</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-yellow-100 dark:bg-yellow-900/20">
              <Calendar className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <span className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">This Month</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">₹62,000</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">February Earnings</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
              <MapPin className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">Markets</span>
          </div>
          <p className="text-3xl font-bold text-gray-800 dark:text-white mb-1">{confirmedMarkets.length || 4}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Markets</p>
        </div>
      </div>

      {/* Monthly Profit Trend */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">6-Month Profit Trend</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyProfits}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
              }}
            />
            <Legend />
            <Bar dataKey="profit" fill="#10b981" name="Profit (₹)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="cost" fill="#f59e0b" name="Costs (₹)" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Profit Breakdown & Market Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profit Breakdown Pie Chart */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Profit Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={profitBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {profitBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4">
            {profitBreakdown.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{item.name}</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">₹{item.value.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Market Comparison */}
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">Market Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={marketComparison} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis dataKey="market" type="category" stroke="#9ca3af" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#fff',
                }}
              />
              <Bar dataKey="profit" fill="#3b82f6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Confirmed Sales History */}
      {confirmedMarkets.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Your Confirmed Sales</h3>
          <div className="space-y-3">
            {confirmedMarkets.map((market, index) => (
              <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-white">{market.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {market.location} • {market.withTransport ? 'With Transport' : 'Direct Purchase'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    Confirmed on {new Date(market.confirmedDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ₹{market.finalProfit.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Profit</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profit Insights */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Insights & Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <h4 className="font-semibold text-green-700 dark:text-green-400 mb-2">✓ Strong Performance</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• 12% increase in profits this month</li>
              <li>• Best market: Azadpur (₹52,000 avg)</li>
              <li>• Optimal selling timing achieved</li>
            </ul>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">💡 Opportunities</h4>
            <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
              <li>• Reduce transport costs by 15%</li>
              <li>• Explore 2 new high-profit markets</li>
              <li>• Wait 6 days for 8% price increase</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
