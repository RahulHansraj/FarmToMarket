import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, Filter, Download, DollarSign, Activity, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Market {
  id: number;
  name: string;
  location: string;
}

interface Crop {
  id: number;
  name: string;
}

interface PricePoint {
  date: string;
  price: number;
  is_predicted: boolean;
  market: string;
  crop: string;
}

interface ChartPoint {
  date: string;
  fullDate: string;
  price: number | null;
  predictedPrice: number | null;
}

export default function PriceDashboard() {
  const [selectedCrop, setSelectedCrop] = useState('');
  const [selectedMarket, setSelectedMarket] = useState('');
  const [timeRange, setTimeRange] = useState('1m');
  const [chartData, setChartData] = useState<ChartPoint[]>([]);
  const [marketStats, setMarketStats] = useState<any[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch Crops and Markets on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [cropsRes, marketsRes] = await Promise.all([
          fetch('/api/crops'),
          fetch('/api/markets')
        ]);

        const cropsData = await cropsRes.json();
        const marketsData = await marketsRes.json();

        setCrops(cropsData);
        setMarkets(marketsData);

        // Set defaults
        if (cropsData.length > 0 && !selectedCrop) setSelectedCrop(cropsData[0].name);
        if (marketsData.length > 0 && !selectedMarket) setSelectedMarket(marketsData[0].name);
      } catch (err: any) {
        console.error("Failed to fetch metadata:", err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch Price Data when filters change
  useEffect(() => {
    if (!selectedCrop) return;

    const fetchPrices = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/prices?crop=${encodeURIComponent(selectedCrop)}`);
        const data: PricePoint[] = await res.json();

        // 1. Chart Data Processing
        const targetMarket = selectedMarket || (markets.length > 0 ? markets[0].name : (data.length > 0 ? data[0].market : ''));
        const marketData = data.filter(d => d.market === targetMarket);

        if (marketData.length === 0) {
          setChartData([]);
          return;
        }

        // Time Range Filter
        const now = new Date();
        const cutoff = new Date();
        if (timeRange === '7d') cutoff.setDate(now.getDate() - 7);
        if (timeRange === '1m') cutoff.setMonth(now.getMonth() - 1);
        if (timeRange === '3m') cutoff.setMonth(now.getMonth() - 3);
        if (timeRange === '6m') cutoff.setMonth(now.getMonth() - 6);

        const filteredRawData = marketData.filter((d) => {
          const dDate = new Date(d.date);
          return dDate >= cutoff;
        }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Build Chart Data
        const processedChartData: ChartPoint[] = [];
        let lastHistoryPrice: number | null = null;

        filteredRawData.forEach(d => {
          const dateObj = new Date(d.date);
          const displayDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

          if (!d.is_predicted) {
            lastHistoryPrice = d.price;
            processedChartData.push({
              date: displayDate,
              fullDate: d.date,
              price: d.price,
              predictedPrice: null // Use null for discontinued line
            });
          } else {
            // Connect history to prediction?
            // For now, simpler approach: Point-to-point. 
            // If we want connection, previous point needs 'predictedPrice' too.

            const lastPoint = processedChartData.length > 0 ? processedChartData[processedChartData.length - 1] : null;
            if (lastPoint && lastPoint.price !== null && lastPoint.predictedPrice === null && lastHistoryPrice !== null) {
              // Add bridge value to last point
              lastPoint.predictedPrice = lastHistoryPrice;
            }

            processedChartData.push({
              date: displayDate,
              fullDate: d.date,
              price: null,
              predictedPrice: d.price
            });
          }
        });

        setChartData(processedChartData);

        // 2. Compute Market Stats
        const marketGroups: { [key: string]: PricePoint[] } = {};
        data.forEach(d => {
          if (!marketGroups[d.market]) marketGroups[d.market] = [];
          marketGroups[d.market].push(d);
        });

        const stats = markets.map(m => {
          const mPrices = marketGroups[m.name] || [];
          if (mPrices.length === 0) return null;

          const prices = mPrices.map(d => d.price);
          const historyPrices = mPrices.filter(d => !d.is_predicted);
          const current = historyPrices.length > 0 ? historyPrices[historyPrices.length - 1].price : 0;
          const prev = historyPrices.length > 1 ? historyPrices[historyPrices.length - 2].price : current;
          const change = prev !== 0 ? ((current - prev) / prev) * 100 : 0;

          return {
            name: m.name,
            location: m.location,
            low: Math.min(...prices).toFixed(2),
            high: Math.max(...prices).toFixed(2),
            avg: (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2),
            change24h: (change > 0 ? '+' : '') + change.toFixed(1) + '%',
            trend: change >= 0 ? 'up' : 'down'
          };
        }).filter(Boolean);
        setMarketStats(stats);

      } catch (err: any) {
        console.error("Failed to fetch prices:", err);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [selectedCrop, selectedMarket, timeRange, markets]);

  const historicalPoints = chartData.filter(d => d.price !== null);
  const currentPrice = historicalPoints.length > 0 ? historicalPoints[historicalPoints.length - 1].price || 0 : 0;

  const previousPrice = historicalPoints.length > 1 ? historicalPoints[historicalPoints.length - 2].price || 0 : currentPrice;
  const priceChange = currentPrice - previousPrice;
  const percentChange = previousPrice !== 0 ? ((priceChange / previousPrice) * 100).toFixed(1) : '0';

  const predictedPoints = chartData.filter(d => d.predictedPrice !== null);
  const maxPredicted = predictedPoints.length > 0 ? Math.max(...predictedPoints.map(d => d.predictedPrice || 0)) : 0;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Crop Type</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              {crops.length === 0 && <option>Loading...</option>}
              {crops.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Market</label>
            <select
              value={selectedMarket}
              onChange={(e) => setSelectedMarket(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500"
            >
              {markets.length === 0 && <option>Loading...</option>}
              {markets.map((m) => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Time Range</label>
            <div className="flex gap-2">
              {['7d', '1m', '3m', '6m'].map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${timeRange === range
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Current Price</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">₹{currentPrice.toFixed(2)}/kg</h3>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            {priceChange >= 0 ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(Number(percentChange))}%
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">vs yesterday</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Predicted Peak (15d)</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {maxPredicted > 0 ? `₹${maxPredicted.toFixed(2)}` : 'N/A'}
              </h3>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <span className="text-sm text-blue-600 dark:text-blue-400 font-medium">AI Forecast</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Recommendation</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {maxPredicted > currentPrice * 1.05 ? 'HOLD' : 'SELL'}
              </h3>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Price Trends</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {chartData.length} Data Points Loaded. (Green: Historical, Blue: Predicted)
            </p>
          </div>
        </div>

        {/* FORCED HEIGHT with inline style to avoid CSS issues */}
        <div style={{ width: '100%', height: 400, minHeight: 400 }}>
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">Loading price data...</p>
            </div>
          ) : chartData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-gray-500">No price data available.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis
                  dataKey="date"
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#6B7280"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₹${value}`}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '0.5rem',
                    border: 'none',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  name="Historical"
                  stroke="#10B981"
                  strokeWidth={3}
                  dot={false}
                  connectNulls={true}
                />
                <Line
                  type="monotone"
                  dataKey="predictedPrice"
                  name="Predicted"
                  stroke="#3B82F6"
                  strokeDasharray="5 5"
                  strokeWidth={3}
                  dot={false}
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Market Details Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Market Price Details ({selectedCrop})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Market</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700 dark:text-gray-300">Location</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Avg</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700 dark:text-gray-300">Trend</th>
              </tr>
            </thead>
            <tbody>
              {marketStats.map((market, index) => (
                <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 font-medium">{market.name}</td>
                  <td className="px-4 py-3 text-gray-600">{market.location}</td>
                  <td className="px-4 py-3 text-right font-bold">₹{market.avg}</td>
                  <td className="px-4 py-3 text-right text-green-600">{market.trend}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
