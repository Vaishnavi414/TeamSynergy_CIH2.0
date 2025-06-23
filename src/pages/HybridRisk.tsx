
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, PlusCircle, Info, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import GlowingButton from "@/components/GlowingButton";

const CurrencyDisplay = ({ symbol, name, amount, color }: { 
  symbol: string; 
  name: string; 
  amount: string;
  color: string;
}) => {
  return (
    <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg mb-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-bold`}>
          {symbol.charAt(0)}
        </div>
        <div>
          <div className="font-medium">{name}</div>
          <div className="text-gray-400 text-sm">{symbol}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium">{amount}</div>
      </div>
    </div>
  );
};

const RiskSegment = ({ title, percentage, color }: { title: string; percentage: number; color: string }) => {
  return (
    <div className="mb-4">
      <div className="flex justify-between mb-1">
        <span className="text-sm">{title}</span>
        <span className="text-sm">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
    </div>
  );
};

const HybridRisk = () => {
  const { user } = useUser();
  const [bankConnected, setBankConnected] = useState(false);
  
  const handleConnectBank = async () => {
    // Simulate bank connection process
    setBankConnected(true);
  };

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
            <span className="font-bold text-sm">{user?.fullName || user?.username?.[0]?.toUpperCase() || 'U'}</span>
          </div>
          <span className="hidden md:inline text-sm">{user?.fullName || user?.username}</span>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">Hybrid Risk Profiler</h1>
          <p className="text-gray-400 mt-2">Combine traditional and crypto portfolios for comprehensive risk analysis</p>
        </div>
        
        {/* Connect Traditional Account */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2 bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Account Overview</h2>
            
            {bankConnected ? (
              <div>
                <div className="flex items-center gap-2 mb-6 p-3 bg-green-500/10 text-green-400 rounded-lg border border-green-500/30">
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">Traditional accounts connected successfully</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Traditional Assets</h3>
                  <CurrencyDisplay 
                    symbol="USD" 
                    name="US Dollar" 
                    amount="$25,450.00"
                    color="bg-green-600"
                  />
                  <CurrencyDisplay 
                    symbol="EUR" 
                    name="Euro" 
                    amount="€5,200.00"
                    color="bg-blue-600"
                  />
                  <CurrencyDisplay 
                    symbol="JPY" 
                    name="Japanese Yen" 
                    amount="¥152,000.00"
                    color="bg-red-600"
                  />
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Crypto Assets</h3>
                  <CurrencyDisplay 
                    symbol="BTC" 
                    name="Bitcoin" 
                    amount="0.82 BTC ($33,986.52)"
                    color="bg-orange-500"
                  />
                  <CurrencyDisplay 
                    symbol="ETH" 
                    name="Ethereum" 
                    amount="12.5 ETH ($24,975.00)"
                    color="bg-indigo-600"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center gap-2 mb-6 p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/30">
                  <Info className="w-5 h-5 flex-shrink-0" />
                  <p className="text-sm">Connect your traditional banking accounts to analyze hybrid risk profile</p>
                </div>
                
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                    <PlusCircle className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Connect Your Bank Account</h3>
                  <p className="text-gray-400 max-w-md mb-6">
                    Link your traditional banking accounts to get a comprehensive view of your entire portfolio and generate hybrid risk analysis.
                  </p>
                  <GlowingButton onClick={handleConnectBank}>
                    Connect Bank Account
                  </GlowingButton>
                  <p className="text-xs text-gray-500 mt-4">
                    Your banking information is securely encrypted and never stored on our servers.
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Risk Exposure</h2>
            
            {bankConnected ? (
              <div>
                <div className="mb-6">
                  <div className="text-center mb-4">
                    <div className="text-4xl font-bold text-yellow-500">72/100</div>
                    <div className="text-sm text-gray-400 mt-1">Hybrid Risk Score</div>
                  </div>
                  
                  <div className="h-4 bg-gray-800 rounded-full overflow-hidden mb-4">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500" 
                      style={{ width: '72%' }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Low Risk</span>
                    <span>Medium Risk</span>
                    <span>High Risk</span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-md font-medium mb-3">Risk Breakdown</h3>
                  <RiskSegment title="Market Risk" percentage={65} color="bg-yellow-500" />
                  <RiskSegment title="Liquidity Risk" percentage={45} color="bg-green-500" />
                  <RiskSegment title="Smart Contract Risk" percentage={85} color="bg-red-500" />
                  <RiskSegment title="Regulatory Risk" percentage={70} color="bg-yellow-500" />
                  <RiskSegment title="Currency Risk" percentage={50} color="bg-yellow-500" />
                </div>
                
                <div className="p-4 bg-aries-purple/10 rounded-lg border border-aries-purple/30">
                  <h3 className="font-medium mb-2">Recommendations</h3>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-yellow-500 mt-1"></div>
                      <span>Reduce smart contract exposure by 20%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-green-500 mt-1"></div>
                      <span>Increase stablecoin allocation to 15%</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <div className="w-4 h-4 rounded-full bg-red-500 mt-1"></div>
                      <span>Consider hedging against currency volatility</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                  <AlertTriangle className="w-8 h-8 text-gray-500" />
                </div>
                <p className="text-gray-400">Connect your banking accounts to view risk analysis</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Portfolio Distribution */}
        {bankConnected && (
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-6">Hybrid Portfolio Distribution</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-4">Asset Class Breakdown</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Cryptocurrencies</span>
                      <span className="text-sm">58%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-aries-purple" style={{ width: '58%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Fiat Currencies</span>
                      <span className="text-sm">29%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: '29%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Stocks</span>
                      <span className="text-sm">8%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Bonds</span>
                      <span className="text-sm">5%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500" style={{ width: '5%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-4">Risk vs. Return</h3>
                <div className="bg-gray-900/50 rounded-lg p-4 h-64 flex items-center justify-center border border-white/5">
                  <div className="text-center">
                    <p className="text-lg font-medium mb-2">Advanced Analysis Coming Soon</p>
                    <p className="text-gray-400 max-w-md mx-auto">
                      Our advanced risk/return visualization tool is being integrated. Soon you'll be able to optimize your portfolio for the best risk-adjusted returns.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Rebalancing Suggestions */}
        {bankConnected && (
          <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Rebalancing Suggestions</h2>
              <GlowingButton size="sm">Apply Rebalancing</GlowingButton>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border border-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Reduce Bitcoin (BTC) Exposure</div>
                  <div className="text-sm text-red-400">-12%</div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Bitcoin currently makes up 45% of your portfolio. Consider reducing exposure to limit volatility risk.
                </p>
                <div className="text-xs text-aries-purple flex items-center gap-1">
                  <span>View suggested trading pairs</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
              
              <div className="p-4 border border-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Increase Stablecoin Allocation</div>
                  <div className="text-sm text-green-400">+15%</div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Adding stablecoins can reduce portfolio volatility and provide a hedge against market downturns.
                </p>
                <div className="text-xs text-aries-purple flex items-center gap-1">
                  <span>View suggested trading pairs</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
              
              <div className="p-4 border border-white/10 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">Add Traditional Fixed Income</div>
                  <div className="text-sm text-green-400">+10%</div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  Incorporating low-risk bonds or treasury bills into your portfolio can provide stability.
                </p>
                <div className="text-xs text-aries-purple flex items-center gap-1">
                  <span>View suggested options</span>
                  <ExternalLink className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default HybridRisk;
