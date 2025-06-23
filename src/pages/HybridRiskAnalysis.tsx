import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, PieChart, Loader2, Info, Plus, Trash2, CreditCard, Coins } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import GlowingButton from "@/components/GlowingButton";
import { toast } from "sonner";

interface CryptoHolding {
  token: string;
  amount: number;
  value?: number;
  weight?: number;
  volatility?: number;
}

interface TraditionalAsset {
  type: string;
  ticker?: string;
  name?: string;
  value: number;
  weight?: number;
}

interface HybridRiskResult {
  totalPortfolioValue: number;
  cryptoAllocation: {
    value: number;
    percentage: number;
  };
  traditionalAllocation: {
    value: number;
    percentage: number;
  };
  riskMetrics: {
    combinedRisk: number;
    diversificationBenefit: number;
    correlation: number;
    riskLevel: string;
  };
  returnMetrics: {
    expectedAnnualReturn: number;
    sharpeRatio: number;
  };
  recommendations: string[];
  analysisDate: string;
  cryptoHoldings: CryptoHolding[];
  traditionalAssets: TraditionalAsset[];
}

const HybridRiskAnalysis = () => {
  const { user } = useUser();
  const [cryptoHoldings, setCryptoHoldings] = useState<CryptoHolding[]>([
    { token: "BTC", amount: 0.5 }
  ]);
  const [traditionalAssets, setTraditionalAssets] = useState<TraditionalAsset[]>([
    { type: "stock", ticker: "AAPL", name: "Apple Inc.", value: 10000 }
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [riskResult, setRiskResult] = useState<HybridRiskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const addCryptoHolding = () => {
    setCryptoHoldings([...cryptoHoldings, { token: "", amount: 0 }]);
  };

  const removeCryptoHolding = (index: number) => {
    const newHoldings = [...cryptoHoldings];
    newHoldings.splice(index, 1);
    setCryptoHoldings(newHoldings);
  };

  const updateCryptoHolding = (index: number, field: keyof CryptoHolding, value: string | number) => {
    const newHoldings = [...cryptoHoldings];
    if (field === 'token') {
      newHoldings[index][field] = value as string;
    } else if (field === 'amount') {
      newHoldings[index][field] = parseFloat(value as string) || 0;
    }
    setCryptoHoldings(newHoldings);
  };

  const addTraditionalAsset = () => {
    setTraditionalAssets([...traditionalAssets, { type: "stock", value: 0 }]);
  };

  const removeTraditionalAsset = (index: number) => {
    const newAssets = [...traditionalAssets];
    newAssets.splice(index, 1);
    setTraditionalAssets(newAssets);
  };

  const updateTraditionalAsset = (index: number, field: keyof TraditionalAsset, value: string | number) => {
    const newAssets = [...traditionalAssets];
    if (field === 'type' || field === 'ticker' || field === 'name') {
      newAssets[index][field] = value as string;
    } else if (field === 'value') {
      newAssets[index][field] = parseFloat(value as string) || 0;
    }
    setTraditionalAssets(newAssets);
  };

  const analyzeHybridRisk = async () => {
    // Validate inputs
    if (cryptoHoldings.length === 0) {
      toast.error("Add at least one crypto holding");
      return;
    }

    if (traditionalAssets.length === 0) {
      toast.error("Add at least one traditional asset");
      return;
    }

    // Check for empty or invalid values
    const invalidCrypto = cryptoHoldings.some(h => !h.token || h.amount <= 0);
    if (invalidCrypto) {
      toast.error("All crypto holdings must have a token and positive amount");
      return;
    }

    const invalidTraditional = traditionalAssets.some(a => !a.type || a.value <= 0);
    if (invalidTraditional) {
      toast.error("All traditional assets must have a type and positive value");
      return;
    }

    try {
      setIsAnalyzing(true);
      setError(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Get token from localStorage
      const authToken = localStorage.getItem('aries_token');
      
      if (!authToken) {
        throw new Error('Authentication token not found');
      }
      
      // Make the API call to analyze hybrid risk
      const response = await fetch(`${API_URL}/api/risk/hybrid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': authToken
        },
        body: JSON.stringify({ 
          cryptoHoldings, 
          traditionalAssets 
        })
      });
      
      // Parse the response
      const data = await response.json();
      
      // Handle error response
      if (!response.ok) {
        throw new Error(data.message || 'Failed to analyze hybrid risk');
      }
      
      // Set risk result
      setRiskResult(data);
      toast.success("Hybrid risk analysis completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to analyze hybrid risk');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-blue-500';
    }
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Hybrid Risk Analysis</h1>
          <p className="text-gray-400">Analyze combined risk across crypto and traditional assets</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Portfolio Composition</h2>
              
              <div className="space-y-6">
                {/* Crypto Holdings */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Coins className="w-5 h-5 text-aries-purple" />
                      Crypto Holdings
                    </h3>
                    <button 
                      onClick={addCryptoHolding}
                      className="p-1 rounded-full bg-aries-purple/10 text-aries-purple hover:bg-aries-purple/20 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {cryptoHoldings.map((holding, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={holding.token}
                          onChange={(e) => updateCryptoHolding(index, 'token', e.target.value.toUpperCase())}
                          placeholder="BTC"
                          className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-aries-purple/50"
                        />
                        <input
                          type="number"
                          value={holding.amount || ''}
                          onChange={(e) => updateCryptoHolding(index, 'amount', e.target.value)}
                          placeholder="Amount"
                          min="0"
                          step="0.01"
                          className="w-24 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-aries-purple/50"
                        />
                        <button 
                          onClick={() => removeCryptoHolding(index)}
                          className="p-1 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          disabled={cryptoHoldings.length <= 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Traditional Assets */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-aries-blue" />
                      Traditional Assets
                    </h3>
                    <button 
                      onClick={addTraditionalAsset}
                      className="p-1 rounded-full bg-aries-blue/10 text-aries-blue hover:bg-aries-blue/20 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {traditionalAssets.map((asset, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <select
                            value={asset.type}
                            onChange={(e) => updateTraditionalAsset(index, 'type', e.target.value)}
                            className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-aries-blue/50"
                          >
                            <option value="stock">Stock</option>
                            <option value="bond">Bond</option>
                            <option value="etf">ETF</option>
                            <option value="realestate">Real Estate</option>
                            <option value="cash">Cash</option>
                            <option value="other">Other</option>
                          </select>
                          <input
                            type="number"
                            value={asset.value || ''}
                            onChange={(e) => updateTraditionalAsset(index, 'value', e.target.value)}
                            placeholder="Value ($)"
                            min="0"
                            step="100"
                            className="w-24 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-aries-blue/50"
                          />
                          <button 
                            onClick={() => removeTraditionalAsset(index)}
                            className="p-1 rounded-full bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            disabled={traditionalAssets.length <= 1}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        
                        <div className="flex items-center gap-2 pl-1">
                          <input
                            type="text"
                            value={asset.ticker || ''}
                            onChange={(e) => updateTraditionalAsset(index, 'ticker', e.target.value.toUpperCase())}
                            placeholder="Ticker (e.g. AAPL)"
                            className="w-24 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-aries-blue/50"
                          />
                          <input
                            type="text"
                            value={asset.name || ''}
                            onChange={(e) => updateTraditionalAsset(index, 'name', e.target.value)}
                            placeholder="Asset name (optional)"
                            className="flex-1 bg-black/50 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-aries-blue/50"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <GlowingButton
                  onClick={analyzeHybridRisk}
                  disabled={isAnalyzing || cryptoHoldings.length === 0 || traditionalAssets.length === 0}
                  className="w-full mt-4"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <PieChart className="w-4 h-4 mr-2" />
                      Analyze Hybrid Risk
                    </>
                  )}
                </GlowingButton>
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
            
            {isAnalyzing && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <Loader2 className="w-12 h-12 text-aries-purple animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Analyzing Portfolio Risk</h2>
                <p className="text-gray-400">
                  Calculating combined risk metrics across crypto and traditional assets...
                </p>
              </div>
            )}
            
            {riskResult && !isAnalyzing && (
              <div className="space-y-6">
                <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                      <h2 className="text-xl font-bold mb-1">Hybrid Risk Analysis</h2>
                      <div className="text-sm text-gray-400">
                        Analyzed on {new Date(riskResult.analysisDate).toLocaleString()}
                      </div>
                    </div>
                    
                    <div className={`px-4 py-2 rounded-full border ${
                      riskResult.riskMetrics.riskLevel.toLowerCase() === 'high' ? 'bg-red-500/10 border-red-500/30' :
                      riskResult.riskMetrics.riskLevel.toLowerCase() === 'medium' ? 'bg-yellow-500/10 border-yellow-500/30' :
                      'bg-green-500/10 border-green-500/30'
                    }`}>
                      <div className={`font-bold ${getRiskLevelColor(riskResult.riskMetrics.riskLevel)}`}>
                        {riskResult.riskMetrics.riskLevel} Risk
                      </div>
                    </div>
                  </div>
                  
                  {/* Portfolio Allocation */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Portfolio Allocation</h3>
                    
                    <div className="bg-black/20 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <div className="text-sm text-gray-400">Total Portfolio Value</div>
                        <div className="text-xl font-bold">${riskResult.totalPortfolioValue.toLocaleString()}</div>
                      </div>
                      
                      <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                        <div className="flex h-full">
                          <div 
                            className="bg-aries-purple h-full"
                            style={{ width: `${riskResult.cryptoAllocation.percentage}%` }}
                          ></div>
                          <div 
                            className="bg-aries-blue h-full"
                            style={{ width: `${riskResult.traditionalAllocation.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between mt-2 text-xs">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-aries-purple"></div>
                          <span>Crypto: {riskResult.cryptoAllocation.percentage.toFixed(1)}% (${riskResult.cryptoAllocation.value.toLocaleString()})</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-aries-blue"></div>
                          <span>Traditional: {riskResult.traditionalAllocation.percentage.toFixed(1)}% (${riskResult.traditionalAllocation.value.toLocaleString()})</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Risk Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Combined Risk</div>
                      <div className={`text-xl font-bold ${getRiskLevelColor(riskResult.riskMetrics.riskLevel)}`}>
                        {riskResult.riskMetrics.combinedRisk.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Daily portfolio volatility</div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Expected Annual Return</div>
                      <div className="text-xl font-bold text-green-500">
                        {riskResult.returnMetrics.expectedAnnualReturn.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Based on historical performance</div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Diversification Benefit</div>
                      <div className="text-xl font-bold text-blue-500">
                        {riskResult.riskMetrics.diversificationBenefit.toFixed(2)}%
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Risk reduction from diversification</div>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-4">
                      <div className="text-sm text-gray-400 mb-1">Sharpe Ratio</div>
                      <div className="text-xl font-bold">
                        {riskResult.returnMetrics.sharpeRatio.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Risk-adjusted return (higher is better)</div>
                    </div>
                  </div>
                  
                  {/* Asset Details */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Asset Details</h3>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead>
                          <tr className="border-b border-white/10">
                            <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Asset</th>
                            <th className="text-right py-2 px-4 text-sm font-medium text-gray-400">Amount/Value</th>
                            <th className="text-right py-2 px-4 text-sm font-medium text-gray-400">Weight</th>
                            <th className="text-right py-2 px-4 text-sm font-medium text-gray-400">Volatility</th>
                          </tr>
                        </thead>
                        <tbody>
                          {/* Crypto Holdings */}
                          {riskResult.cryptoHoldings.map((holding, index) => (
                            <tr key={`crypto-${index}`} className="border-b border-white/5">
                              <td className="py-2 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-aries-purple/20 flex items-center justify-center">
                                    <Coins className="w-3 h-3 text-aries-purple" />
                                  </div>
                                  <span>{holding.token}</span>
                                </div>
                              </td>
                              <td className="text-right py-2 px-4">
                                {holding.amount} {holding.token} 
                                <span className="text-gray-500 text-xs ml-1">
                                  (${holding.value?.toLocaleString()})
                                </span>
                              </td>
                              <td className="text-right py-2 px-4">{holding.weight?.toFixed(1)}%</td>
                              <td className="text-right py-2 px-4 text-yellow-500">{holding.volatility?.toFixed(2)}%</td>
                            </tr>
                          ))}
                          
                          {/* Traditional Assets */}
                          {riskResult.traditionalAssets.map((asset, index) => (
                            <tr key={`trad-${index}`} className="border-b border-white/5">
                              <td className="py-2 px-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded-full bg-aries-blue/20 flex items-center justify-center">
                                    <CreditCard className="w-3 h-3 text-aries-blue" />
                                  </div>
                                  <div>
                                    <span>{asset.name || asset.ticker || asset.type}</span>
                                    {asset.ticker && <span className="text-xs text-gray-500 ml-1">({asset.ticker})</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="text-right py-2 px-4">${asset.value.toLocaleString()}</td>
                              <td className="text-right py-2 px-4">{asset.weight?.toFixed(1)}%</td>
                              <td className="text-right py-2 px-4 text-green-500">~5.00%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Recommendations</h3>
                    
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Info className="text-blue-500 w-5 h-5" />
                        <h4 className="font-bold text-blue-400">Portfolio Recommendations</h4>
                      </div>
                      
                      <ul className="space-y-2">
                        {riskResult.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2 text-gray-300">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {!riskResult && !isAnalyzing && !error && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-aries-purple/30 to-aries-blue/30 flex items-center justify-center">
                  <PieChart className="w-8 h-8 text-white/70" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Risk Analysis</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Enter your crypto holdings and traditional assets to analyze combined portfolio risk.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HybridRiskAnalysis;
