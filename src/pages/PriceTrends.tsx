
import { useUser } from "@clerk/clerk-react";
import { Search, ChevronDown, Filter, Download } from "lucide-react";
import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import NavHeader from "@/components/NavHeader";

// Sample data for the chart
const priceTrendData = [
  { name: 'Jan', bitcoin: 38000, ethereum: 1400, solana: 95 },
  { name: 'Feb', bitcoin: 36000, ethereum: 1550, solana: 105 },
  { name: 'Mar', bitcoin: 42000, ethereum: 1700, solana: 120 },
  { name: 'Apr', bitcoin: 45000, ethereum: 1900, solana: 130 },
  { name: 'May', bitcoin: 38000, ethereum: 1800, solana: 115 },
  { name: 'Jun', bitcoin: 36000, ethereum: 1650, solana: 90 },
  { name: 'Jul', bitcoin: 41000, ethereum: 2100, solana: 140 },
];

const TokenCard = ({ name, symbol, price, change, color }: { 
  name: string; 
  symbol: string; 
  price: string; 
  change: string; 
  color: string;
}) => {
  const isPositive = !change.includes('-');
  
  return (
    <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-4 hover:border-aries-purple/40 transition-all hover:shadow-lg hover:shadow-aries-purple/5">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="text-white font-medium">{name}</h3>
          <p className="text-gray-400 text-sm">{symbol}</p>
        </div>
        <div className={`text-xs px-2 py-1 rounded-full ${isPositive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
          {change}
        </div>
      </div>
      <div className="mt-2">
        <p className="text-xl font-bold text-white">{price}</p>
      </div>
      <div className="mt-2 h-10">
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className={`h-full ${color}`} style={{ width: `${Math.random() * 100}%` }}></div>
        </div>
      </div>
    </div>
  );
};

const PriceTrends = () => {
  const { user } = useUser();
  const [timeframe, setTimeframe] = useState("7D");

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <NavHeader 
        title="Price Trend Analysis" 
        subtitle="Track historical performance and predict future market movements" 
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">Price Trend Analysis</h1>
          <p className="text-gray-400 mt-2">Track historical performance and predict future market movements</p>
        </div>
        
        {/* Search and Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search tokens..." 
              className="w-full pl-10 pr-4 py-2 bg-black/30 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50 focus:border-aries-purple/50"
            />
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg text-white hover:bg-black/50 transition-colors">
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
            <button className="px-4 py-2 flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg text-white hover:bg-black/50 transition-colors">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        {/* Popular Tokens */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Popular Tokens</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <TokenCard 
              name="Bitcoin" 
              symbol="BTC" 
              price="$41,325.78" 
              change="+5.6%" 
              color="bg-gradient-to-r from-orange-500 to-yellow-500"
            />
            <TokenCard 
              name="Ethereum" 
              symbol="ETH" 
              price="$2,198.45" 
              change="+3.2%" 
              color="bg-gradient-to-r from-indigo-500 to-purple-500"
            />
            <TokenCard 
              name="Solana" 
              symbol="SOL" 
              price="$137.89" 
              change="+12.1%" 
              color="bg-gradient-to-r from-purple-500 to-pink-500"
            />
            <TokenCard 
              name="Cardano" 
              symbol="ADA" 
              price="$0.52" 
              change="-2.1%" 
              color="bg-gradient-to-r from-blue-500 to-teal-500"
            />
          </div>
        </div>
        
        {/* Price Trend Chart */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-semibold">Price Trend Analysis</h2>
            <div className="flex items-center gap-2 mt-2 md:mt-0">
              {["24H", "7D", "30D", "90D", "1Y"].map((option) => (
                <button 
                  key={option}
                  onClick={() => setTimeframe(option)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    timeframe === option 
                      ? "bg-aries-purple text-white" 
                      : "bg-gray-800/50 text-gray-400 hover:bg-gray-700/50"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={priceTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#777" />
                <YAxis stroke="#777" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1a1a1a", 
                    borderColor: "#333",
                    color: "#fff" 
                  }} 
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="bitcoin" 
                  stroke="#F7931A" 
                  strokeWidth={2}
                  dot={{ stroke: '#F7931A', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="ethereum" 
                  stroke="#62688F" 
                  strokeWidth={2}
                  dot={{ stroke: '#62688F', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="solana" 
                  stroke="#DC1FFF" 
                  strokeWidth={2}
                  dot={{ stroke: '#DC1FFF', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* AI Insights Section */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-4 bg-gradient-to-br from-aries-purple/20 to-aries-blue/20 rounded-lg border border-white/10">
              <h3 className="font-medium mb-2">Market Sentiment</h3>
              <p className="text-gray-300 mb-4">Based on recent price movements and social sentiment analysis, the market appears to be cautiously optimistic with an upward trend expected in the next 48 hours.</p>
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 h-full" style={{ width: '75%' }}></div>
              </div>
              <div className="flex justify-between mt-1 text-xs text-gray-400">
                <span>Bearish</span>
                <span>Neutral</span>
                <span>Bullish</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-aries-purple/20 to-aries-blue/20 rounded-lg border border-white/10">
              <h3 className="font-medium mb-2">Volatility Analysis</h3>
              <p className="text-gray-300 mb-4">Volatility indicators show moderate market volatility with potential for increased fluctuations during Asian trading hours. Consider setting appropriate stop-loss levels.</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Low</span>
                <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 h-full" style={{ width: '60%' }}></div>
                </div>
                <span className="text-xs text-gray-400">High</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PriceTrends;
