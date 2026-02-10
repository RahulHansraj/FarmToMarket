import { useState, useEffect, useMemo } from 'react';
import { Search, MapPin, TrendingUp, Truck, AlertTriangle, Phone, Mail, ExternalLink, Check, Sprout, ArrowLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useUser } from '../../context/UserContext';

interface Market {
  id: number;
  name: string;
  location: string;
  coordinates: { lat: number; lng: number };
  spoilageRisk?: string;
}

interface Crop {
  id: number;
  name: string;
}

interface PriceData {
  marketName: string;
  currentPrice: number;
  predictedPrice: number;
  priceHistory: { date: string; price: number | null; predicted: number | null }[];
}

export default function MarketExplorer() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMarketId, setSelectedMarketId] = useState<number | null>(null); // Store ID only to prevent stale state
  const [showTransport, setShowTransport] = useState(false);
  const [transportStart, setTransportStart] = useState('');

  const [markets, setMarkets] = useState<Market[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [marketPrices, setMarketPrices] = useState<{ [key: string]: PriceData }>({});
  const [loading, setLoading] = useState(false);

  const { addConfirmedMarket, confirmedMarkets, farmData } = useUser();

  // Fetch Metadata
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cropsRes, marketsRes] = await Promise.all([
          fetch('/api/crops'),
          fetch('/api/markets')
        ]);
        const cropsData = await cropsRes.json();
        const marketsData = await marketsRes.json();

        setCrops(cropsData);
        setMarkets(marketsData);

        if (cropsData.length > 0) setSelectedCrop(cropsData[0].name);
      } catch (err) {
        console.error("Error fetching metadata:", err);
      }
    };
    fetchData();
  }, []);

  // Fetch Prices for Selected Crop
  useEffect(() => {
    if (!selectedCrop) return;

    const fetchPrices = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/prices?crop=${encodeURIComponent(selectedCrop)}`);
        const data = await res.json();

        // Process data by market
        const pricesByMarket: { [key: string]: PriceData } = {};

        const groups: { [key: string]: any[] } = {};
        data.forEach((d: any) => {
          if (!groups[d.market]) groups[d.market] = [];
          groups[d.market].push(d);
        });

        Object.keys(groups).forEach(mName => {
          const points = groups[mName];
          points.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

          const history = points.filter((p: any) => !p.is_predicted);
          const currentPrice = history.length > 0 ? history[history.length - 1].price : 0;

          const predictions = points.filter((p: any) => p.is_predicted);
          const predictedPrice = predictions.length > 0 ? Math.max(...predictions.map((p: any) => p.price)) : currentPrice;

          // Format chart data with continuity
          const recentHistory = history.slice(-15); // Show last 15 days
          const nearForecast = predictions.slice(0, 15); // Show next 15 days

          const chartData = recentHistory.map((p: any) => ({
            date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            price: p.price,
            predicted: null
          }));

          // Continuity bridge
          if (recentHistory.length > 0) {
            const lastHist = recentHistory[recentHistory.length - 1];
            // We make the last history point also the start of prediction line
            chartData[chartData.length - 1].predicted = lastHist.price;
          }

          nearForecast.forEach((p: any) => {
            chartData.push({
              date: new Date(p.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              price: null,
              predicted: p.price
            });
          });

          pricesByMarket[mName] = {
            marketName: mName,
            currentPrice,
            predictedPrice,
            priceHistory: chartData
          };
        });

        setMarketPrices(pricesByMarket);

      } catch (err) {
        console.error("Error fetching prices:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrices();
  }, [selectedCrop]);


  // Derive display data dynamically so it updates when selectedCrop changes
  const displayMarkets = useMemo(() => {
    return markets.map(m => {
      const pricing = marketPrices[m.name] || {
        marketName: m.name,
        currentPrice: 0,
        predictedPrice: 0,
        priceHistory: []
      };

      const quantityKg = 1000;
      const estimatedProfit = pricing.currentPrice * quantityKg;

      // Seeded random logic for consistency
      const seed = m.id * 123;
      const distance = (seed % 300) + 20;
      const transportCost = Math.round(distance * 25);

      return {
        ...m,
        ...pricing,
        distance: `${distance} km`,
        estimatedProfit,
        transportCost,
        spoilageRisk: m.spoilageRisk || (distance > 150 ? 'Medium' : 'Low'),
      };
    });
  }, [markets, marketPrices]);

  const filteredMarkets = displayMarkets.filter(market =>
    market.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get active market object
  const activeMarket = selectedMarketId ? displayMarkets.find(m => m.id === selectedMarketId) : null;

  const handleConfirmMarket = () => {
    if (activeMarket) {
      const finalProfit = showTransport
        ? activeMarket.estimatedProfit - activeMarket.transportCost
        : activeMarket.estimatedProfit;

      addConfirmedMarket({
        ...activeMarket,
        withTransport: showTransport,
        transportStart: showTransport ? transportStart : null,
        finalProfit,
        confirmedDate: new Date().toISOString(),
      });

      alert(`Market confirmed! ${showTransport ? 'Transport booking included.' : 'Direct purchase selected.'}`);
      setSelectedMarketId(null);
      setShowTransport(false);
      setTransportStart('');
    }
  };

  const calculateFinalDecision = (market: any) => {
    if (market.currentPrice === 0) return { decision: 'No Data', color: 'gray' };
    if (market.spoilageRisk === 'Low' && market.predictedPrice > market.currentPrice) return { decision: 'Highly Recommended', color: 'green' };
    if (market.spoilageRisk === 'High') return { decision: 'High Risk', color: 'red' };
    if (market.predictedPrice < market.currentPrice) return { decision: 'Price Falling', color: 'yellow' };
    return { decision: 'Recommended', color: 'blue' };
  };

  return (
    <div className="space-y-6">
      {/* Search and Crop Selection */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search markets by name or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>

          <div className="md:w-64">
            <div className="relative">
              <Sprout className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-green-600" />
              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-green-500 appearance-none"
              >
                {crops.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmed Markets */}
      {confirmedMarkets.length > 0 && (
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <Check className="w-6 h-6 text-green-600" />
            Confirmed Markets
          </h3>
          <div className="space-y-3">
            {confirmedMarkets.map((market, index) => (
              <div key={index} className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{market.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{market.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-green-600 dark:text-green-400">₹{market.finalProfit.toLocaleString()}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {market.withTransport ? 'With Transport' : 'Direct Purchase'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Market List */}
      {!activeMarket && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {loading && filteredMarkets.length === 0 ? (
            <div className="col-span-2 text-center py-10">
              <p className="text-gray-500 text-lg">Loading real-time market data...</p>
            </div>
          ) : filteredMarkets.map((market) => {
            const decision = calculateFinalDecision(market);
            return (
              <div
                key={market.id}
                onClick={() => setSelectedMarketId(market.id)}
                className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-500 cursor-pointer transition-all hover:shadow-lg"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{market.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {market.location} • {market.distance}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-${decision.color}-100 text-${decision.color}-700 dark:bg-${decision.color}-900/30 dark:text-${decision.color}-400`}>
                    {decision.decision}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Price</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">₹{market.currentPrice.toFixed(2)}/kg</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Predicted (15d)</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">₹{market.predictedPrice.toFixed(2)}/kg</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">~₹{market.transportCost.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={`w-4 h-4 ${market.spoilageRisk === 'Low' ? 'text-green-600' : 'text-yellow-600'}`} />
                    <span className="text-gray-600 dark:text-gray-400">{market.spoilageRisk} Risk</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Market Details - Renders ACTIVE derived market data */}
      {activeMarket && (
        <div className="space-y-6">
          <button
            onClick={() => {
              setSelectedMarketId(null);
              setShowTransport(false);
              setTransportStart('');
            }}
            className="flex items-center text-green-600 dark:text-green-400 hover:underline mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Markets
          </button>

          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{activeMarket.name}</h2>
                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {activeMarket.location} • {activeMarket.distance} from your farm
                </p>
              </div>
            </div>

            {/* Price Chart */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Price Trends ({selectedCrop})</h3>
              <div style={{ width: '100%', height: 350 }}>
                {activeMarket.priceHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={activeMarket.priceHistory} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                      <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke="#9ca3af"
                        domain={['auto', 'auto']}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `₹${value}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          border: 'none',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="price"
                        stroke="#10b981"
                        strokeWidth={3}
                        name="Historical"
                        dot={false}
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#3b82f6"
                        strokeWidth={3}
                        strokeDasharray="5 5"
                        name="Predicted"
                        dot={false}
                        connectNulls={true}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    No price data available for {selectedCrop} in this market.
                  </div>
                )}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Current Price</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">₹{activeMarket.currentPrice}/kg</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Predicted Prediction</p>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">₹{activeMarket.predictedPrice}/kg</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Estimated Transport</p>
                <p className="text-xl font-bold text-gray-800 dark:text-white">₹{activeMarket.transportCost}</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Spoilage Risk</p>
                <p className={`text-xl font-bold ${activeMarket.spoilageRisk === 'Low' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                  {activeMarket.spoilageRisk}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleConfirmMarket}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                Confirm Market
              </button>
              <button
                onClick={() => setSelectedMarketId(null)}
                className="px-6 py-4 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
