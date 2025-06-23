import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2, BarChart2, Info, Search } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import GlowingButton from "@/components/GlowingButton";
import RealTimePriceChart from "@/components/RealTimePriceChart";
import SmartContractActivity from "@/components/SmartContractActivity";
import { toast } from "sonner";

interface PriceData {
  date: string;
  price: number;
}

interface VolatilityData {
  token: string;
  currentPrice: number;
  volatilityDaily: number;
  volatilityAnnualized: number;
  volatilityLevel: string;
  maxDrawdown: number;
  trend: string;
  priceChange: number;
  analysisDate: string;
  historicalPrices: PriceData[];
}

const popularTokens = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'ARIES', name: 'Aries Token' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'ADA', name: 'Cardano' },
  { symbol: 'DOT', name: 'Polkadot' },
  { symbol: 'AVAX', name: 'Avalanche' },
  { symbol: 'LINK', name: 'Chainlink' },
];

// Function to generate mock price data (used as fallback)
const generateMockPriceData = (token: string): PriceData[] => {
  const prices: PriceData[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Set base price based on token
  let basePrice = token === 'BTC' ? 65000 : token === 'ETH' ? 3500 : 1.2;
  
  // Generate 30 days of data
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now - (i * dayMs));
    // Add some random variation
    basePrice = basePrice * (1 + (Math.random() * 0.06 - 0.03));
    prices.push({
      date: date.toISOString(),
      price: basePrice
    });
  }
  
  return prices;
};

const TokenVolatility = () => {
  const { user } = useUser();
  const [token, setToken] = useState("BTC");
  const [timeframe, setTimeframe] = useState<"1" | "7" | "30" | "90" | "365" | "max">("30");
  const [isLoading, setIsLoading] = useState(false);
  const [volatilityData, setVolatilityData] = useState<VolatilityData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contractAddress, setContractAddress] = useState("0x2170Ed0880ac9A755fd29B2688956BD959F933F8"); // Example ETH token contract

  const analyzeVolatility = async () => {
    if (!token) {
      toast.error("Token symbol is required");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Get token from localStorage
      const authToken = localStorage.getItem('aries_token');
      
      // Fetch volatility data
      const response = await fetch(`${API_URL}/api/risk/token-volatility/${token}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'x-auth-token': authToken } : {})
        }
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch volatility data');
      }
      
      setVolatilityData(data);
      toast.success(`${token} volatility analysis completed`);
      
    } catch (err) {
      console.error('Error fetching volatility data:', err);
      // Fall back to mock data if API fails
      const mockData: VolatilityData = {
        token,
        currentPrice: token === 'BTC' ? 65432.10 : token === 'ETH' ? 3521.45 : 1.23,
        volatilityDaily: token === 'BTC' ? 2.3 : token === 'ETH' ? 3.1 : 5.7,
        volatilityAnnualized: token === 'BTC' ? 43.8 : token === 'ETH' ? 59.2 : 108.5,
        volatilityLevel: token === 'BTC' ? 'Medium' : token === 'ETH' ? 'Medium-High' : 'High',
        maxDrawdown: token === 'BTC' ? 12.4 : token === 'ETH' ? 15.8 : 28.3,
        trend: token === 'BTC' ? 'Upward' : token === 'ETH' ? 'Sideways' : 'Downward',
        priceChange: token === 'BTC' ? 2.4 : token === 'ETH' ? -0.8 : -4.2,
        analysisDate: new Date().toISOString(),
        historicalPrices: generateMockPriceData(token)
      };
      
      setVolatilityData(mockData);
      setError('Using demo data: ' + (err instanceof Error ? err.message : 'API connection failed'));
      toast.error(err instanceof Error ? err.message : 'Failed to analyze token volatility');
    } finally {
      setIsLoading(false);
    }
  };

  const getVolatilityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'extreme':
        return 'text-red-500';
      case 'high':
        return 'text-orange-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
  };

  const getTrendColor = (trend: string, priceChange: number) => {
    if (trend.toLowerCase() === 'upward') return 'text-green-500';
    if (trend.toLowerCase() === 'downward') return 'text-red-500';
    return 'text-yellow-500';
  };

  const getTrendIcon = (trend: string) => {
    if (trend.toLowerCase() === 'upward') return <TrendingUp className="w-5 h-5 text-green-500" />;
    if (trend.toLowerCase() === 'downward') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <TrendingUp className="w-5 h-5 text-yellow-500 rotate-90" />;
  };

  // Function to generate chart data points
  const generateChartPoints = (prices: PriceData[]) => {
    if (!prices || prices.length === 0) return '';
    
    // Find min and max for scaling
    const values = prices.map(p => p.price);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;
    
    // Scale to 0-100 range for SVG viewBox
    const scaled = prices.map((p, i) => {
      const x = (i / (prices.length - 1)) * 100;
      const y = 100 - ((p.price - min) / range) * 100;
      return `${x},${y}`;
    });
    
    return scaled.join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <nav className="py-4 px-6 lg:px-8 flex justify-between items-center bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-lg hover:-translate-y-1 transition-all duration-300 text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-aries-purple to-aries-blue flex items-center justify-center">
            <span className="font-bold text-sm">{user?.fullName || user?.username?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <span className="hidden md:inline text-sm">{user?.fullName || user?.username}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Token Volatility Tracker</h1>
          <p className="text-gray-400">Analyze price volatility and trends for cryptocurrencies</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Analysis Parameters</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Token Symbol</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={token}
                      onChange={(e) => setToken(e.target.value.toUpperCase())}
                      placeholder="BTC, ETH, etc."
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50 pr-10"
                    />
                    <Search className="absolute right-3 top-3 text-gray-500 w-5 h-5" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Analysis Period</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setTimeframe("7")}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${timeframe === "7" ? 'bg-aries-purple/20 border-aries-purple text-white' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-black/40 hover:text-white'}`}
                    >
                      7 Days
                    </button>
                    <button
                      onClick={() => setTimeframe("30")}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${timeframe === "30" ? 'bg-aries-purple/20 border-aries-purple text-white' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-black/40 hover:text-white'}`}
                    >
                      30 Days
                    </button>
                    <button
                      onClick={() => setTimeframe("90")}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${timeframe === "90" ? 'bg-aries-purple/20 border-aries-purple text-white' : 'bg-black/20 border-white/10 text-gray-400 hover:bg-black/40 hover:text-white'}`}
                    >
                      90 Days
                    </button>
                  </div>
                </div>
                
                <GlowingButton
                  onClick={analyzeVolatility}
                  disabled={isLoading || !token}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <BarChart2 className="w-4 h-4 mr-2" />
                      Analyze Volatility
                    </>
                  )}
                </GlowingButton>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-sm font-medium mb-3">Popular Tokens</h3>
                <div className="flex flex-wrap gap-2">
                  {popularTokens.map((t) => (
                    <button
                      key={t.symbol}
                      onClick={() => setToken(t.symbol)}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        token === t.symbol
                          ? 'bg-aries-purple/20 border-aries-purple text-white'
                          : 'bg-black/20 border-white/10 text-gray-400 hover:bg-black/40 hover:text-white'
                      }`}
                    >
                      {t.symbol}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <Info className="text-red-500" />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <Loader2 className="w-12 h-12 text-aries-purple animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Analyzing Volatility</h2>
                <p className="text-gray-400">
                  Calculating price trends and volatility metrics for {token}...
                </p>
              </div>
            )}
            
            {volatilityData && !isLoading && (
              <div className="space-y-6">
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold mb-1">
                        {volatilityData.token} Volatility Analysis
                      </h2>
                      <div className="text-sm text-gray-400">
                        Analyzed on {new Date(volatilityData.analysisDate).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="text-2xl font-bold">
                        ${volatilityData.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                        volatilityData.priceChange >= 0 ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                      }`}>
                        {volatilityData.priceChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {volatilityData.priceChange >= 0 ? '+' : ''}{volatilityData.priceChange.toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  {/* Real-time Price Chart */}
                  <div className="mb-6">
                    <RealTimePriceChart 
                      symbol={token} 
                      timeframe={timeframe} 
                      height={300} 
                      showControls={false}
                      showDetails={false}
                    />
                  </div>
                  
                  {/* Volatility Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Volatility Level</div>
                      <div className={`text-xl font-bold flex items-center gap-2 ${getVolatilityColor(volatilityData.volatilityLevel)}`}>
                        {volatilityData.volatilityLevel}
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Daily Volatility</div>
                      <div className="text-xl font-bold">
                        {(volatilityData.volatilityDaily * 100).toFixed(2)}%
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Annual Volatility</div>
                      <div className="text-xl font-bold">
                        {(volatilityData.volatilityAnnualized * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Price Trend</div>
                      <div className={`text-xl font-bold flex items-center gap-2 ${getTrendColor(volatilityData.trend, volatilityData.priceChange)}`}>
                        {getTrendIcon(volatilityData.trend)}
                        {volatilityData.trend}
                        <span className="text-sm font-normal">
                          ({volatilityData.priceChange >= 0 ? '+' : ''}{volatilityData.priceChange.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Maximum Drawdown</div>
                      <div className="text-xl font-bold text-red-500">
                        {(volatilityData.maxDrawdown * 100).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Info className="text-blue-500 w-5 h-5" />
                      <h4 className="font-bold text-blue-400">Volatility Insights</h4>
                    </div>
                    
                    <div className="text-gray-300 space-y-2">
                      <p>
                        {volatilityData.token} has {volatilityData.volatilityLevel.toLowerCase()} volatility with daily price movements averaging {(volatilityData.volatilityDaily * 100).toFixed(2)}%.
                      </p>
                      <p>
                        The current price trend is {volatilityData.trend.toLowerCase()}, with a {Math.abs(volatilityData.priceChange).toFixed(2)}% {volatilityData.priceChange >= 0 ? 'increase' : 'decrease'} over the selected time period.
                      </p>
                      <p>
                        The maximum drawdown of {(volatilityData.maxDrawdown * 100).toFixed(2)}% indicates the largest price drop from peak to trough during this period.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Smart Contract Activity */}
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-bold mb-4">Smart Contract Activity</h2>
                  <SmartContractActivity 
                    contractAddress={contractAddress}
                    limit={5}
                    refreshInterval={15000}
                    showHeader={false}
                  />
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <Link
                    to="/risk-visualization"
                    className="px-3 py-1.5 bg-aries-purple/10 text-aries-purple border border-aries-purple/30 rounded hover:bg-aries-purple/20 transition-colors text-sm flex items-center gap-1"
                  >
                    <BarChart2 className="w-4 h-4" />
                    View Risk Visualization
                  </Link>
                </div>
              </div>
            )}
            
            {!volatilityData && !isLoading && !error && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-aries-purple/30 to-aries-blue/30 flex items-center justify-center">
                  <BarChart2 className="w-8 h-8 text-white/70" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Volatility Analysis</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Select a token and time period to analyze its price volatility and trends.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TokenVolatility;
