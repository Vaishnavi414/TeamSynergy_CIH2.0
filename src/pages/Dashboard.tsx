import { useEffect, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { ChartBar, Shield, BarChart, Layers, Search, Lock, Box, TrendingUp, Wallet, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import DashboardCard from "@/components/DashboardCard";
import GlowingButton from "@/components/GlowingButton";
import NavHeader from "@/components/NavHeader";
import WalletConnect from "@/components/WalletConnect";
import { PieChart, Pie, Cell, BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';

// Sample data for charts
const assetDistribution = [
  { name: "Bitcoin", value: 45, color: "#F7931A" },
  { name: "Ethereum", value: 30, color: "#627EEA" },
  { name: "Solana", value: 15, color: "#DC1FFF" },
  { name: "Other", value: 10, color: "#9945FF" },
];

const priceHistory = [
  { date: 'Jan', btc: 42000, eth: 3200 },
  { date: 'Feb', btc: 44500, eth: 3100 },
  { date: 'Mar', btc: 47000, eth: 3300 },
  { date: 'Apr', btc: 45000, eth: 3000 },
  { date: 'May', btc: 49000, eth: 3500 },
  { date: 'Jun', btc: 52000, eth: 3800 },
];

const riskScores = [
  { name: 'Contract Risk', value: 65 },
  { name: 'Market Risk', value: 45 },
  { name: 'Liquidity Risk', value: 72 },
  { name: 'Volatility', value: 58 },
];

const recentTransactions = [
  { id: 1, type: 'Buy', asset: 'ETH', amount: '0.5', value: '$1,750', time: '2h ago', status: 'completed' },
  { id: 2, type: 'Sell', asset: 'SOL', amount: '12', value: '$840', time: '5h ago', status: 'completed' },
  { id: 3, type: 'Swap', asset: 'BTC → ETH', amount: '0.02', value: '$980', time: '1d ago', status: 'completed' },
  { id: 4, type: 'Stake', asset: 'DOT', amount: '100', value: '$580', time: '2d ago', status: 'pending' },
];

const Dashboard = () => {
  const { user, isLoaded } = useUser();
  console.log("Dashboard: isLoaded:", isLoaded, "user:", user);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState('overview');

  if (!isLoaded) {
    return <div style={{color: "white"}}>Loading user session...</div>;
  }
  if (!user) {
    return <div style={{color: "red"}}>No user session found</div>;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-black text-white">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <NavHeader showBackButton={false} showUserInfo={true} showLogout={true} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Your Dashboard</h1>
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-6">
                <p className="text-gray-400">
                  {currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex gap-2 items-center text-aries-purple">
                  <div className="w-2 h-2 rounded-full bg-aries-purple animate-pulse"></div>
                  <p className="text-sm">{user?.primaryWeb3Wallet?.web3Wallet || 'No wallet connected'}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex overflow-x-auto p-1 gap-2 bg-black/20 backdrop-blur-sm rounded-lg">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'overview' ? 'bg-aries-purple/20 text-aries-purple' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('portfolio')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'portfolio' ? 'bg-aries-purple/20 text-aries-purple' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Portfolio
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === 'activity' ? 'bg-aries-purple/20 text-aries-purple' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Activity
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Total Portfolio Value</p>
                <p className="text-3xl font-bold mt-1">$8,234.56</p>
              </div>
              <div className="p-2 rounded-lg bg-green-500/10">
                <TrendingUp className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-green-500 text-sm">
              <span>+3.2%</span>
              <span className="text-xs text-gray-400">past 24h</span>
            </div>
          </div>
          <div className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Smart Contracts</p>
                <p className="text-3xl font-bold mt-1">12</p>
              </div>
              <div className="p-2 rounded-lg bg-aries-blue/10">
                <Shield className="w-5 h-5 text-aries-blue" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <AlertTriangle className="w-3 h-3" />
              <span>4 High Risk Contracts</span>
            </div>
          </div>
          <div className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-gray-400 text-sm">Hybrid Risk Score</p>
                <p className="text-3xl font-bold mt-1">72/100</p>
              </div>
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <div className="flex items-center gap-1 text-yellow-500 text-sm">
              <span>Medium Risk</span>
              <span className="text-xs text-gray-400">Improve your score</span>
            </div>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Portfolio Distribution Chart */}
          <div className="lg:col-span-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Portfolio Distribution</h3>
              <Link to="/portfolio" className="text-aries-purple text-sm hover:underline">View Details</Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={assetDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
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
                  <Legend
                    layout="vertical"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Price History Chart */}
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Price History</h3>
              <Link to="/price-trends" className="text-aries-purple text-sm hover:underline">View Details</Link>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceHistory}>
                  <defs>
                    <linearGradient id="colorBtc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F7931A" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#F7931A" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorEth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#627EEA" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#627EEA" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#666" />
                  <YAxis stroke="#666" />
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1a1a1a",
                      borderColor: "#333",
                      color: "#fff"
                    }}
                  />
                  <Area type="monotone" dataKey="btc" stroke="#F7931A" fillOpacity={1} fill="url(#colorBtc)" />
                  <Area type="monotone" dataKey="eth" stroke="#627EEA" fillOpacity={1} fill="url(#colorEth)" />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk Analysis & Recent Transactions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Risk Analysis */}
          <div className="lg:col-span-1 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Risk Analysis</h3>
              <Link to="/hybrid-risk" className="text-aries-purple text-sm hover:underline">View Details</Link>
            </div>
            <div className="space-y-4">
              {riskScores.map((risk) => (
                <div key={risk.name} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">{risk.name}</span>
                    <span className="font-medium">{risk.value}/100</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        risk.value < 40 ? 'bg-green-500' : risk.value < 70 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${risk.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Recent Transactions</h3>
              <Link to="/portfolio" className="text-aries-purple text-sm hover:underline">View All</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-400">Asset</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Amount</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Value</th>
                    <th className="text-right py-3 px-4 font-medium text-gray-400">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.type === 'Buy' ? 'bg-green-500/10 text-green-500' : 
                          tx.type === 'Sell' ? 'bg-red-500/10 text-red-500' : 
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {tx.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{tx.asset}</td>
                      <td className="py-3 px-4 text-right">{tx.amount}</td>
                      <td className="py-3 px-4 text-right font-medium">{tx.value}</td>
                      <td className="py-3 px-4 text-right text-gray-400">{tx.time}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Wallet Connection Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 gradient-text">Connect Your Wallet</h2>
          <WalletConnect />
        </div>

        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link to="/contracts" className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-black/40 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-aries-purple/10 group-hover:bg-aries-purple/20 transition-colors">
                <Search className="w-6 h-6 text-aries-purple" />
              </div>
              <div>
                <h3 className="font-medium">Smart Contracts</h3>
                <p className="text-sm text-gray-400">Analyze security risks</p>
              </div>
            </div>
          </Link>
          <Link to="/price-trends" className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-black/40 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-aries-blue/10 group-hover:bg-aries-blue/20 transition-colors">
                <ChartBar className="w-6 h-6 text-aries-blue" />
              </div>
              <div>
                <h3 className="font-medium">Price Trends</h3>
                <p className="text-sm text-gray-400">Market analysis</p>
              </div>
            </div>
          </Link>
          <Link to="/immersive-dashboard" className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-black/40 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
                <Box className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <h3 className="font-medium">Immersive View</h3>
                <p className="text-sm text-gray-400">3D visualization</p>
              </div>
            </div>
          </Link>
          <Link to="/banking-accounts" className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-black/40 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Wallet className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-medium">Banking</h3>
                <p className="text-sm text-gray-400">Manage accounts</p>
              </div>
            </div>
          </Link>
          <Link to="/privacy" className="p-6 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl hover:bg-black/40 transition-colors group">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/10 group-hover:bg-yellow-500/20 transition-colors">
                <Lock className="w-6 h-6 text-yellow-500" />
              </div>
              <div>
                <h3 className="font-medium">Privacy</h3>
                <p className="text-sm text-gray-400">Zero-knowledge proofs</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;