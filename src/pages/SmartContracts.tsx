
import { useUser } from "@clerk/clerk-react";
import { Search, AlertTriangle, CheckCircle, ExternalLink, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GlowingButton from "@/components/GlowingButton";
import NavHeader from "@/components/NavHeader";

// Define contract type for TypeScript
interface Contract {
  id: string;
  name: string;
  address: string;
  network: string;
  type: string;
  riskScore: number;
  lastAudit?: string;
  deployedAt?: string;
  creator?: string;
}

const SmartContracts = () => {
  const { user } = useUser();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch contracts from backend API
  useEffect(() => {
    const fetchContracts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // API URL - use environment variable or default to localhost in development
        const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
        
        // Make the API call to fetch contracts - no token needed for hackathon demo
        const response = await fetch(`${API_URL}/api/contracts/fetch?address=${user?.primaryWeb3Wallet?.web3Wallet || ''}`, {
          headers: {
            // The backend has authentication bypass for the hackathon demo
          }
        });
        
        // Parse the response
        const data = await response.json();
        
        // Handle error response
        if (!response.ok) {
          throw new Error(data.message || 'Failed to fetch contracts');
        }
        
        // Set contracts in state
        setContracts(data.contracts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching contracts:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchContracts();
  }, [user?.primaryWeb3Wallet?.web3Wallet]);
  
  // Filter contracts based on search query
  const filteredContracts = contracts.filter(contract => 
    contract.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    contract.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <NavHeader 
        title="Smart Contracts" 
        subtitle="Analyze and monitor your smart contracts" 
      />

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Smart Contracts</h1>
            <p className="text-gray-400">Analyze and monitor your smart contracts</p>
          </div>
          
          {/* Search bar */}
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="bg-black/30 border border-white/10 text-white rounded-lg pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
              placeholder="Search contracts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-aries-purple animate-spin" />
            <span className="ml-2 text-gray-400">Loading contracts...</span>
          </div>
        )}
        
        {/* Error state */}
        {!loading && error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-500" />
              <p className="text-red-400">{error}</p>
            </div>
            <GlowingButton 
              className="mt-4" 
              onClick={() => window.location.reload()}
              size="sm"
            >
              Try Again
            </GlowingButton>
          </div>
        )}
        
        {/* No contracts found */}
        {!loading && !error && filteredContracts.length === 0 && (
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-aries-purple/30 to-aries-blue/30 flex items-center justify-center">
              <Search className="w-8 h-8 text-white/70" />
            </div>
            <h2 className="text-2xl font-bold mb-2">No Contracts Found</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              {searchQuery ? 
                `No contracts matching "${searchQuery}" were found.` : 
                "We couldn't find any smart contracts associated with your wallet address."}
            </p>
            {searchQuery ? (
              <button 
                onClick={() => setSearchQuery('')}
                className="text-aries-purple hover:text-aries-blue transition-colors"
              >
                Clear Search
              </button>
            ) : (
              <Link to="/dashboard">
                <span className="text-aries-purple hover:text-aries-blue transition-colors">
                  Return to Dashboard
                </span>
              </Link>
            )}
          </div>
        )}
        
        {/* Contracts list */}
        {!loading && !error && filteredContracts.length > 0 && (
          <div className="grid grid-cols-1 gap-6">
            {filteredContracts.map(contract => (
              <div 
                key={contract.id}
                className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 hover:border-aries-purple/40 transition-all hover:shadow-lg hover:shadow-aries-purple/5"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-bold mb-1">{contract.name}</h3>
                    <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                      <span className="font-mono">{contract.address.slice(0, 8)}...{contract.address.slice(-6)}</span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs">{contract.network}</span>
                      <span className="px-2 py-0.5 rounded-full bg-gray-800 text-xs">{contract.type}</span>
                    </div>
                    <div className="mt-4">
                      {contract.lastAudit && (
                        <div className="text-sm text-gray-400">
                          Last audited: <span className="text-white">{new Date(contract.lastAudit).toLocaleDateString()}</span>
                        </div>
                      )}
                      {contract.deployedAt && (
                        <div className="text-sm text-gray-400">
                          Deployed: <span className="text-white">{new Date(contract.deployedAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <div className="relative w-24 h-24">
                      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          className="text-gray-800"
                          strokeWidth="8"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                        <circle
                          className={`${getRiskColor(contract.riskScore)}`}
                          strokeWidth="8"
                          strokeDasharray={`${2 * Math.PI * 40 * contract.riskScore / 100} ${2 * Math.PI * 40 * (1 - contract.riskScore / 100)}`}
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="transparent"
                          r="40"
                          cx="50"
                          cy="50"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold">{contract.riskScore}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">Risk Score</div>
                  </div>
                </div>
                
                <div className="mt-6 flex flex-wrap gap-2">
                  <button className="px-3 py-1.5 bg-aries-purple/20 text-aries-purple border border-aries-purple/30 rounded hover:bg-aries-purple/30 transition-colors text-sm flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Scan Vulnerabilities
                  </button>
                  <button className="px-3 py-1.5 bg-green-500/10 text-green-500 border border-green-500/30 rounded hover:bg-green-500/20 transition-colors text-sm flex items-center gap-1">
                    <CheckCircle className="w-4 h-4" />
                    Check Compliance
                  </button>
                  <a 
                    href={`https://etherscan.io/address/${contract.address}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/20 transition-colors text-sm flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Explorer
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Helper function to get risk color based on score
function getRiskColor(score: number): string {
  if (score < 40) return 'text-green-500';
  if (score < 70) return 'text-yellow-500';
  return 'text-red-500';
}

export default SmartContracts;
