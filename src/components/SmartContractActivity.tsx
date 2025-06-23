import { useState, useEffect } from "react";
import { Loader2, RefreshCw, ExternalLink, Clock } from "lucide-react";
import { toast } from "sonner";

interface ContractActivity {
  blockNumber: number;
  transactionHash: string;
  logIndex: number;
  address: string;
  data: string;
  timestamp: number;
  date: string;
  eventType: string;
  simulated?: boolean;
}

interface SmartContractActivityProps {
  contractAddress: string;
  limit?: number;
  refreshInterval?: number; // in milliseconds
  showHeader?: boolean;
}

const SmartContractActivity = ({ 
  contractAddress, 
  limit = 10,
  refreshInterval = 30000, // 30 seconds
  showHeader = true
}: SmartContractActivityProps) => {
  const [activities, setActivities] = useState<ContractActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchContractActivity = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      const response = await fetch(`${API_URL}/api/blockchain/contract-activity/${contractAddress}?limit=${limit}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch contract activity');
      }
      
      setActivities(data);
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching contract activity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContractActivity();
    
    // Set up polling for real-time updates
    const interval = setInterval(() => {
      fetchContractActivity();
    }, refreshInterval);
    
    return () => clearInterval(interval);
  }, [contractAddress, limit, refreshInterval]);

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds}s ago`;
    
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const truncateHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'Transfer':
        return 'bg-blue-500/20 text-blue-400';
      case 'Approval':
        return 'bg-purple-500/20 text-purple-400';
      case 'Mint':
        return 'bg-green-500/20 text-green-400';
      case 'Burn':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      {showHeader && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Smart Contract Activity</h2>
          
          <div className="flex items-center gap-2">
            {activities.length > 0 && activities[0].simulated && (
              <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded">Demo</span>
            )}
            
            <button
              onClick={fetchContractActivity}
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
        </div>
      )}
      
      {isLoading && activities.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-aries-purple animate-spin" />
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <p className="text-red-400">{error}</p>
        </div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No recent activity found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <div 
              key={`${activity.transactionHash}-${activity.logIndex}`}
              className="bg-black/20 border border-white/5 rounded-lg p-4 hover:border-white/10 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`px-2 py-1 rounded text-xs font-medium ${getEventColor(activity.eventType)}`}>
                    {activity.eventType}
                  </div>
                  <div className="flex flex-col">
                    <a 
                      href={`https://sepolia.etherscan.io/tx/${activity.transactionHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-mono text-aries-blue hover:underline flex items-center"
                    >
                      {truncateHash(activity.transactionHash)}
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                    <span className="text-xs text-gray-500">Block #{activity.blockNumber}</span>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-400">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
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

export default SmartContractActivity;
