import { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from "chart.js";
import { ArrowUpRight, ArrowDownRight, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PriceData {
  timestamp: number;
  date: string;
  price: number;
}

interface TokenInfo {
  symbol: string;
  name: string;
  currentPrice: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  lastUpdated: string;
  simulated?: boolean;
}

interface RealTimePriceChartProps {
  symbol: string;
  timeframe?: "1" | "7" | "30" | "90" | "365" | "max";
  height?: number;
  showControls?: boolean;
  showDetails?: boolean;
}

const RealTimePriceChart = ({ 
  symbol, 
  timeframe = "30", 
  height = 300,
  showControls = true,
  showDetails = true
}: RealTimePriceChartProps) => {
  const [historicalData, setHistoricalData] = useState<PriceData[]>([]);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(timeframe);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchPriceData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Fetch current price data
      const currentPriceResponse = await fetch(`${API_URL}/api/blockchain/price/${symbol}`);
      const currentPriceData = await currentPriceResponse.json();
      
      if (!currentPriceResponse.ok) {
        throw new Error(currentPriceData.message || 'Failed to fetch current price data');
      }
      
      setTokenInfo(currentPriceData);
      
      // Fetch historical price data
      const historicalResponse = await fetch(`${API_URL}/api/blockchain/historical-price/${symbol}?days=${selectedTimeframe}`);
      const historicalData = await historicalResponse.json();
      
      if (!historicalResponse.ok) {
        throw new Error(historicalData.message || 'Failed to fetch historical price data');
      }
      
      setHistoricalData(historicalData.prices);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch price data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPriceData();
    
    // Set up polling for real-time updates (every 30 seconds)
    const interval = setInterval(() => {
      fetchPriceData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [symbol, selectedTimeframe]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 1 ? 4 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2
    }).format(value);
  };

  const formatLargeNumber = (value: number) => {
    if (value >= 1e12) return (value / 1e12).toFixed(2) + 'T';
    if (value >= 1e9) return (value / 1e9).toFixed(2) + 'B';
    if (value >= 1e6) return (value / 1e6).toFixed(2) + 'M';
    if (value >= 1e3) return (value / 1e3).toFixed(2) + 'K';
    return value.toFixed(2);
  };

  // Prepare chart data
  const chartData = {
    labels: historicalData.map(data => {
      const date = new Date(data.timestamp);
      if (selectedTimeframe === "1") {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (selectedTimeframe === "7" || selectedTimeframe === "30") {
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString([], { month: 'short', year: '2-digit' });
      }
    }),
    datasets: [
      {
        label: `${symbol} Price`,
        data: historicalData.map(data => data.price),
        borderColor: tokenInfo?.priceChangePercentage24h && tokenInfo.priceChangePercentage24h >= 0 
          ? 'rgba(52, 211, 153, 1)' // Green for positive
          : 'rgba(239, 68, 68, 1)', // Red for negative
        backgroundColor: tokenInfo?.priceChangePercentage24h && tokenInfo.priceChangePercentage24h >= 0 
          ? 'rgba(52, 211, 153, 0.1)' // Green for positive
          : 'rgba(239, 68, 68, 0.1)', // Red for negative
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 4,
        tension: 0.4,
        fill: true
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.raw)}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false,
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 8
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
          drawBorder: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.5)',
          callback: function(value: any) {
            return formatCurrency(value);
          }
        }
      }
    },
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false
    }
  };

  const timeframeOptions = [
    { value: "1", label: "24h" },
    { value: "7", label: "7d" },
    { value: "30", label: "30d" },
    { value: "90", label: "90d" },
    { value: "365", label: "1y" },
    { value: "max", label: "All" }
  ];

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            {tokenInfo?.name || symbol} Price
            {tokenInfo?.simulated && (
              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">Demo</span>
            )}
          </h2>
          {tokenInfo && (
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-bold">{formatCurrency(tokenInfo.currentPrice)}</span>
              <div className={`flex items-center ${tokenInfo.priceChangePercentage24h >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {tokenInfo.priceChangePercentage24h >= 0 ? (
                  <ArrowUpRight className="w-4 h-4" />
                ) : (
                  <ArrowDownRight className="w-4 h-4" />
                )}
                <span className="font-medium">{Math.abs(tokenInfo.priceChangePercentage24h).toFixed(2)}%</span>
              </div>
            </div>
          )}
        </div>
        
        {showControls && (
          <div className="flex items-center gap-2">
            <div className="flex bg-black/40 rounded-lg p-1">
              {timeframeOptions.map(option => (
                <button
                  key={option.value}
                  onClick={() => setSelectedTimeframe(option.value)}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    selectedTimeframe === option.value
                      ? 'bg-aries-purple text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            
            <button
              onClick={fetchPriceData}
              className="p-2 rounded-lg bg-black/40 text-gray-400 hover:text-white transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </button>
          </div>
        )}
      </div>
      
      {/* Chart */}
      <div style={{ height: `${height}px` }} className="relative">
        {isLoading && historicalData.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-aries-purple animate-spin" />
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-red-500">{error}</p>
          </div>
        ) : historicalData.length > 0 ? (
          <Line data={chartData} options={chartOptions} />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500">No data available</p>
          </div>
        )}
      </div>
      
      {/* Additional Details */}
      {showDetails && tokenInfo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/10">
          <div>
            <p className="text-gray-400 text-sm">Market Cap</p>
            <p className="font-medium">{formatCurrency(tokenInfo.marketCap)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">24h Volume</p>
            <p className="font-medium">{formatLargeNumber(tokenInfo.volume24h)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">24h High</p>
            <p className="font-medium">{formatCurrency(tokenInfo.high24h)}</p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">24h Low</p>
            <p className="font-medium">{formatCurrency(tokenInfo.low24h)}</p>
          </div>
        </div>
      )}
      
      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-4 text-xs text-gray-500 flex items-center justify-end">
          <span>Last updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      )}
    </div>
  );
};

export default RealTimePriceChart;
