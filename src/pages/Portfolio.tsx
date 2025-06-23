
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, PieChart, BarChart2, Download, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { PieChart as ReChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data for the charts
const assetDistribution = [
  { name: "Bitcoin", value: 45, color: "#F7931A" },
  { name: "Ethereum", value: 30, color: "#627EEA" },
  { name: "Solana", value: 15, color: "#DC1FFF" },
  { name: "Other", value: 10, color: "#9945FF" },
];

const monthlyReturns = [
  { month: 'Jan', return: 5.2 },
  { month: 'Feb', return: -2.1 },
  { month: 'Mar', return: 7.8 },
  { month: 'Apr', return: 4.3 },
  { month: 'May', return: -3.5 },
  { month: 'Jun', return: 8.1 },
];

const AssetTable = () => {
  const assets = [
    { name: "Bitcoin", symbol: "BTC", amount: "0.82", value: "$33,986.52", change: "+5.2%", color: "text-green-500" },
    { name: "Ethereum", symbol: "ETH", amount: "12.5", value: "$24,975.00", change: "+2.8%", color: "text-green-500" },
    { name: "Solana", symbol: "SOL", amount: "85.3", value: "$11,513.85", change: "+12.4%", color: "text-green-500" },
    { name: "Cardano", symbol: "ADA", amount: "3450", value: "$1,794.00", color: "text-red-500", change: "-1.2%" },
    { name: "Polkadot", symbol: "DOT", amount: "120", value: "$696.00", color: "text-red-500", change: "-3.5%" },
  ];

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="text-left py-3 px-4 font-medium text-gray-400">Asset</th>
            <th className="text-left py-3 px-4 font-medium text-gray-400">Amount</th>
            <th className="text-right py-3 px-4 font-medium text-gray-400">Value</th>
            <th className="text-right py-3 px-4 font-medium text-gray-400">24h</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => (
            <tr key={asset.symbol} className="border-b border-white/5 hover:bg-white/5">
              <td className="py-4 px-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">
                    {asset.symbol.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium">{asset.name}</p>
                    <div className="text-gray-400 text-sm">{asset.symbol}</div>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="font-medium">{asset.amount}</div>
                <div className="text-gray-400 text-sm">{asset.symbol}</div>
              </td>
              <td className="py-4 px-4 text-right">
                <div className="font-medium">{asset.value}</div>
              </td>
              <td className="py-4 px-4 text-right">
                <span className={asset.color}>{asset.change}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Portfolio = () => {
  const { user } = useUser();
  const [chartView, setChartView] = useState<"pie" | "bar">("pie");
  const totalValue = "$72,965.37";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <nav className="py-4 px-6 lg:px-8 flex justify-between items-center bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-aries-purple to-aries-blue flex items-center justify-center">
            <span className="font-bold text-sm">{user?.fullName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <span className="hidden md:inline text-sm">{user?.fullName || user?.username}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">Portfolio Visualization</h1>
          <p className="text-gray-400 mt-2">Get a complete overview of your assets with visual analytics</p>
        </div>
        
        {/* Portfolio Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">Total Portfolio Value</div>
            <div className="text-3xl font-bold">{totalValue}</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-500 text-sm">+12.4%</span>
              <span className="text-gray-400 text-xs">All Time</span>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">24h Change</div>
            <div className="text-3xl font-bold text-green-500">+$1,231.52</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-green-500 text-sm">+1.7%</span>
              <span className="text-gray-400 text-xs">Since yesterday</span>
            </div>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="text-sm text-gray-400 mb-1">Risk Profile</div>
            <div className="text-3xl font-bold text-yellow-500">Moderate</div>
            <div className="flex items-center gap-1 mt-2">
              <span className="text-yellow-500 text-sm">72/100</span>
              <span className="text-gray-400 text-xs">Risk Score</span>
            </div>
          </div>
        </div>
        
        {/* Asset Distribution */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-semibold">Asset Distribution</h2>
            <div className="flex items-center gap-3 mt-2 md:mt-0">
              <button
                className={`p-2 rounded-lg ${chartView === 'pie' ? 'bg-aries-purple/20 text-aries-purple' : 'bg-gray-800/50 text-gray-400'}`}
                onClick={() => setChartView('pie')}
              >
                <PieChart className="w-5 h-5" />
              </button>
              <button
                className={`p-2 rounded-lg ${chartView === 'bar' ? 'bg-aries-purple/20 text-aries-purple' : 'bg-gray-800/50 text-gray-400'}`}
                onClick={() => setChartView('bar')}
              >
                <BarChart2 className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 transition-colors">
                <RefreshCw className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 transition-colors">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'pie' ? (
                <ReChart>
                  <Pie
                    data={assetDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {assetDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Allocation']}
                    contentStyle={{ 
                      backgroundColor: "#1a1a1a", 
                      borderColor: "#333",
                      color: "#fff" 
                    }}
                  />
                </ReChart>
              ) : (
                <BarChart data={monthlyReturns}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="month" stroke="#777" />
                  <YAxis stroke="#777" />
                  <Tooltip 
                    formatter={(value) => [`${value}%`, 'Monthly Return']}
                    contentStyle={{ 
                      backgroundColor: "#1a1a1a", 
                      borderColor: "#333",
                      color: "#fff" 
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="return"
                    name="Monthly Return"
                    fill="#9b87f5"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Asset List */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-semibold">Your Assets</h2>
            <button className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 transition-colors rounded-lg">
              Add Asset
            </button>
          </div>
          <AssetTable />
        </div>
      </main>
    </div>
  );
};

export default Portfolio;
