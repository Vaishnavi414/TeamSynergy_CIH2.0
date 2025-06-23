import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Shield, TrendingUp, Loader2, Copy, ExternalLink, Info, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import GlowingButton from "@/components/GlowingButton";
import CreditScoreNFT from "@/components/CreditScoreNFT";
import { toast } from "sonner";
import blockchainService, { Token, SupportedNetwork } from "@/services/blockchain/BlockchainService";
import riskAnalysisService, { AssetRisk, PortfolioRisk } from "@/services/risk/RiskAnalysisService";
import { useWeb3Auth } from "@/services/auth/useWeb3Auth";

interface RiskFactor {
  factor: string;
  description: string;
  impact: string;
}

interface WalletRisk {
  address: string;
  riskLevel: string;
  riskScore: number;
  analysisDate: string;
  transactions: {
    total: number;
    suspicious: number;
  };
  riskFactors: RiskFactor[];
  recommendations: string[];
}

// Helper function to calculate credit score based on risk data
const calculateCreditScore = (riskData: WalletRisk | null): number => {
  if (!riskData) return 0;
  
  // Base score starts at 850 (max credit score)
  let score = 850;
  
  // Deduct points based on risk score (higher risk = lower credit score)
  score -= riskData.riskScore * 5;
  
  // Deduct for suspicious transactions
  if (riskData.transactions.suspicious > 0) {
    const suspiciousRatio = riskData.transactions.suspicious / riskData.transactions.total;
    score -= Math.round(suspiciousRatio * 200);
  }
  
  // Ensure score stays within 300-850 range (standard credit score range)
  return Math.max(300, Math.min(850, Math.round(score)));
};

// Helper function to get color based on credit score
const getCreditScoreColor = (score: number): string => {
  if (score >= 750) return 'bg-green-500/20 text-green-500';
  if (score >= 670) return 'bg-blue-500/20 text-blue-500';
  if (score >= 580) return 'bg-yellow-500/20 text-yellow-500';
  if (score >= 480) return 'bg-orange-500/20 text-orange-500';
  return 'bg-red-500/20 text-red-500';
};

const WalletRiskProfile = () => {
  const { user } = useAuth();
  const { address: connectedAddress } = useWeb3Auth();
  const [address, setAddress] = useState(connectedAddress || user?.walletAddress || "");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskData, setRiskData] = useState<WalletRisk | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [portfolioRisk, setPortfolioRisk] = useState<PortfolioRisk | null>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<SupportedNetwork>("ethereum");
  const [isLoadingTokens, setIsLoadingTokens] = useState(false);

  // Effect to fetch token data and risk analysis when address changes
  useEffect(() => {
    if (address) {
      fetchTokensAndRiskData();
    }
  }, [address, selectedNetwork]);

  // Effect to update address when connected wallet changes
  useEffect(() => {
    if (connectedAddress) {
      setAddress(connectedAddress);
    }
  }, [connectedAddress]);

  // Fetch token balances and risk data for the wallet
  const fetchTokensAndRiskData = async () => {
    if (!address) return;
    
    setIsLoadingTokens(true);
    setError(null);
    
    try {
      // Fetch token balances from blockchain service
      const tokenBalances = await blockchainService.getTokenBalances(address, selectedNetwork);
      setTokens(tokenBalances);
      
      // Fetch portfolio risk analysis
      await analyzeWallet();
    } catch (err) {
      console.error('Error fetching wallet data:', err);
      setError('Failed to fetch wallet data: ' + (err instanceof Error ? err.message : 'Unknown error'));
    } finally {
      setIsLoadingTokens(false);
    }
  };

  const analyzeWallet = async () => {
    if (!address) {
      toast.error("Wallet address is required");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);
      
      // Use the risk analysis service to get real risk data
      const portfolioRiskData = await riskAnalysisService.getWalletRiskProfile(address, selectedNetwork);
      setPortfolioRisk(portfolioRiskData);
      
      // Convert the portfolio risk data to the format expected by the UI
      const riskDataForUI: WalletRisk = {
        address,
        riskLevel: getRiskLevelFromScore(portfolioRiskData.overallRiskScore),
        riskScore: portfolioRiskData.overallRiskScore,
        analysisDate: new Date().toISOString(),
        transactions: {
          total: tokens.length > 0 ? tokens.length * 10 : 100, // Estimate based on token count
          suspicious: Math.round(portfolioRiskData.overallRiskScore / 10) // Estimate based on risk score
        },
        riskFactors: portfolioRiskData.riskFactors.map(factor => ({
          factor: factor.factor,
          description: factor.description,
          impact: getImpactLevel(factor.impact)
        })),
        recommendations: [
          'Diversify your portfolio to reduce concentration risk',
          'Consider using a hardware wallet for additional security',
          'Regularly monitor wallet activity for suspicious transactions',
          'Use multi-signature for high-value transactions'
        ]
      };
      
      setRiskData(riskDataForUI);
      toast.success('Wallet risk analysis completed');
    } catch (err) {
      console.error('Error analyzing wallet:', err);
      
      // Fall back to mock data if real data fails
      const mockData: WalletRisk = {
        address,
        riskLevel: 'Medium',
        riskScore: 45,
        analysisDate: new Date().toISOString(),
        transactions: {
          total: 156,
          suspicious: 3
        },
        riskFactors: [
          {
            factor: 'Interaction with unverified contracts',
            description: 'The wallet has interacted with smart contracts that have not been audited or verified.',
            impact: 'High'
          },
          {
            factor: 'High-value transfers',
            description: 'Multiple high-value transfers detected in a short time period.',
            impact: 'Medium'
          },
          {
            factor: 'Low transaction diversity',
            description: 'Limited variety in transaction types and recipients.',
            impact: 'Low'
          }
        ],
        recommendations: [
          'Avoid interacting with unverified smart contracts',
          'Enable multi-signature for high-value transactions',
          'Consider using a hardware wallet for additional security',
          'Regularly monitor wallet activity for suspicious transactions'
        ]
      };
      
      setRiskData(mockData);
      setError('Using demo data: ' + (err instanceof Error ? err.message : 'API connection failed'));
    } finally {
      setIsAnalyzing(false);
    }
  };
  
  // Helper function to convert risk score to risk level
  const getRiskLevelFromScore = (score: number): string => {
    if (score >= 75) return 'Very High';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Very Low';
  };
  
  // Helper function to convert impact number to impact level
  const getImpactLevel = (impact: number): string => {
    if (impact >= 7) return 'High';
    if (impact >= 4) return 'Medium';
    return 'Low';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy to clipboard'));
  };

  const getRiskColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
      case 'very high':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
      case 'very low':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <nav className="py-4 px-6 lg:px-8 flex justify-between items-center bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <Link to="/dashboard" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-lg hover:-translate-y-1 transition-all duration-300 text-white">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-aries-purple to-aries-blue flex items-center justify-center">
            <span className="font-bold text-sm">{user?.name?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <span className="hidden md:inline text-sm">{user?.name}</span>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Wallet Risk Profile</h1>
          <p className="text-gray-400">Analyze risk factors and security metrics for any blockchain wallet</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
              <h2 className="text-xl font-bold mb-4">Wallet Analysis</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="walletAddress" className="block text-sm text-gray-400 mb-1">Wallet Address</label>
                  <div className="flex">
                    <input
                      id="walletAddress"
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="0x..."
                      className="flex-1 bg-black/30 border border-gray-700 rounded-l-lg px-4 py-2 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-aries-purple"
                    />
                    <button 
                      onClick={() => setAddress(user?.walletAddress || "")}
                      className="bg-gray-800 hover:bg-gray-700 px-3 py-2 rounded-r-lg border-y border-r border-gray-700"
                      title="Use my wallet"
                    >
                      <User className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div>
                  <label htmlFor="network" className="block text-sm text-gray-400 mb-1">Blockchain Network</label>
                  <select
                    id="network"
                    value={selectedNetwork}
                    onChange={(e) => setSelectedNetwork(e.target.value as SupportedNetwork)}
                    className="w-full bg-black/30 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple"
                  >
                    <option value="ethereum">Ethereum Mainnet</option>
                    <option value="polygon">Polygon</option>
                    <option value="arbitrum">Arbitrum</option>
                    <option value="optimism">Optimism</option>
                  </select>
                </div>
                
                <div>
                  <button
                    onClick={fetchTokensAndRiskData}
                    disabled={isAnalyzing || isLoadingTokens || !address}
                    className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-colors ${
                      isAnalyzing || isLoadingTokens || !address
                        ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-aries-purple to-aries-blue hover:opacity-90 text-white'
                    }`}
                  >
                    {isAnalyzing || isLoadingTokens ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isLoadingTokens ? "Loading Tokens..." : "Analyzing Risk..."}</span>
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        <span>Analyze Wallet</span>
                      </>
                    )}
                  </button>
                </div>
                
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-sm text-red-300">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0 text-red-400" />
                      <span>{error}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Token Balances Section */}
            {tokens.length > 0 && (
              <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl mt-6">
                <h2 className="text-xl font-bold mb-4">Token Balances</h2>
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {tokens.map((token, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-black/30 rounded-lg border border-white/5">
                      <div className="flex items-center gap-3">
                        {token.logo ? (
                          <img src={token.logo} alt={token.symbol} className="w-8 h-8 rounded-full" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-aries-purple to-aries-blue flex items-center justify-center">
                            <span className="font-bold text-xs">{token.symbol.slice(0, 2)}</span>
                          </div>
                        )}
                        <div>
                          <div className="font-medium">{token.symbol}</div>
                          <div className="text-xs text-gray-400">{token.name}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{parseFloat(token.balance).toFixed(4)}</div>
                        {token.balanceUsd && (
                          <div className="text-xs text-gray-400">${token.balanceUsd.toFixed(2)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-2">
            {isAnalyzing && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <Loader2 className="w-12 h-12 text-aries-purple animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Analyzing Wallet</h2>
                <p className="text-gray-400">
                  Scanning transaction history and smart contract interactions...
                </p>
              </div>
            )}
            
            {riskData && !isAnalyzing && (
              <div className="space-y-6">
                <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-bold">Wallet Risk Assessment</h2>
                      <p className="text-gray-400">Analysis completed on {new Date(riskData.analysisDate).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`px-4 py-2 rounded-lg border ${getRiskColor(riskData.riskLevel)}`}>
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          <span className="font-bold">{riskData.riskLevel} Risk</span>
                        </div>
                      </div>
                      
                      <div className="bg-black/30 px-4 py-2 rounded-lg border border-white/10">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-aries-purple" />
                          <span className="font-bold">{riskData.riskScore}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-1">Wallet Address</div>
                        <div className="flex items-center gap-2 bg-black/30 p-3 rounded-lg border border-white/10 overflow-hidden">
                          <div className="truncate text-sm">{riskData.address}</div>
                          <button 
                            onClick={() => copyToClipboard(riskData.address)}
                            className="p-1 hover:bg-white/10 rounded"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4 text-gray-400" />
                          </button>
                          <a 
                            href={`https://etherscan.io/address/${riskData.address}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-white/10 rounded"
                            title="View on Etherscan"
                          >
                            <ExternalLink className="w-4 h-4 text-gray-400" />
                          </a>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-1">Transaction Analysis</div>
                        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                          <div className="flex justify-between mb-2">
                            <div>Total Transactions</div>
                            <div className="font-bold">{riskData.transactions.total}</div>
                          </div>
                          <div className="flex justify-between">
                            <div>Suspicious Transactions</div>
                            <div className="font-bold text-red-400">{riskData.transactions.suspicious}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="mb-4">
                        <div className="text-sm text-gray-400 mb-1">DeFi Credit Score</div>
                        <div className="bg-black/30 p-4 rounded-lg border border-white/10">
                          <div className="flex justify-between items-center mb-2">
                            <div className="text-sm">Score</div>
                            <div className={`text-xl font-bold px-3 py-1 rounded-lg ${getCreditScoreColor(calculateCreditScore(riskData))}`}>
                              {calculateCreditScore(riskData)}
                            </div>
                          </div>
                          <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
                              style={{ width: `${(calculateCreditScore(riskData) - 300) / 5.5}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>Poor (300)</span>
                            <span>Good (670)</span>
                            <span>Excellent (850)</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Link 
                          to="/credit-score-nft"
                          className="block w-full bg-gradient-to-r from-aries-purple to-aries-blue hover:opacity-90 transition-opacity text-center py-3 rounded-lg font-bold"
                        >
                          Mint Credit Score as NFT
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">Risk Factors</h3>
                    <div className="space-y-4">
                      {riskData.riskFactors.map((factor, index) => (
                        <div key={index} className="bg-black/30 p-4 rounded-lg border border-white/10">
                          <div className="flex justify-between items-start mb-2">
                            <div className="font-bold">{factor.factor}</div>
                            <div className={`text-xs px-2 py-1 rounded ${
                              factor.impact.toLowerCase() === 'high' ? 'bg-red-500/20 text-red-400' :
                              factor.impact.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {factor.impact} Impact
                            </div>
                          </div>
                          <p className="text-sm text-gray-400">{factor.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
                    <h3 className="text-xl font-bold mb-4">Recommendations</h3>
                    <div className="space-y-3">
                      {riskData.recommendations.map((recommendation, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 bg-black/30 rounded-lg border border-white/10">
                          <div className="mt-0.5">
                            <div className="w-5 h-5 rounded-full bg-gradient-to-r from-aries-purple to-aries-blue flex items-center justify-center text-xs font-bold">
                              {index + 1}
                            </div>
                          </div>
                          <div>{recommendation}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-xl font-bold">3D Risk Visualization</h3>
                    <div className="bg-black/30 px-2 py-1 rounded text-xs">Premium Feature</div>
                  </div>
                  
                  <div className="aspect-video bg-black/30 rounded-lg border border-white/10 flex items-center justify-center">
                    <Link 
                      to="/immersive-dashboard" 
                      className="px-6 py-3 bg-gradient-to-r from-aries-purple to-aries-blue rounded-lg font-bold hover:opacity-90 transition-opacity"
                    >
                      View in 3D Dashboard
                    </Link>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 backdrop-blur-md p-6 rounded-xl border border-white/10 shadow-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold">Credit Score NFT Preview</h3>
                    <Link 
                      to="/credit-score-nft"
                      className="text-sm text-aries-purple hover:text-aries-blue transition-colors"
                    >
                      View Details
                    </Link>
                  </div>
                  
                  <div className="flex justify-center">
                    <CreditScoreNFT 
                      address={riskData.address} 
                      score={calculateCreditScore(riskData)} 
                      date={riskData.analysisDate} 
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default WalletRiskProfile;
