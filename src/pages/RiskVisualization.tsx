
import { useUser } from "@clerk/clerk-react";
import { ArrowLeft, Info, Download, Share2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const RiskVisualization = () => {
  const { user } = useUser();
  const [riskLevel, setRiskLevel] = useState(75);
  const [selectedRisk, setSelectedRisk] = useState<string | null>(null);

  // Sample risk factors
  const riskFactors = [
    { name: "Smart Contract Vulnerability", score: 85, impact: "High", description: "Risk of exploits due to unaudited code" },
    { name: "Market Volatility", score: 62, impact: "Medium", description: "Asset price fluctuations beyond normal market conditions" },
    { name: "Liquidity Risk", score: 45, impact: "Medium", description: "Difficulty in liquidating assets at market price" },
    { name: "Regulatory Risk", score: 70, impact: "High", description: "Exposure to changing regulations and compliance requirements" },
    { name: "Counterparty Risk", score: 38, impact: "Low", description: "Potential default risk from transaction counterparties" }
  ];

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
          <h1 className="text-3xl md:text-4xl font-bold gradient-text">XP Risk Visualization</h1>
          <p className="text-gray-400 mt-2">Visualize your risk exposure with interactive 3D models</p>
        </div>
        
        {/* Risk Score Overview */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-48 h-48">
              <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center border-8 border-gray-700">
                <div className="absolute inset-0 rounded-full overflow-hidden">
                  <div 
                    className={`absolute bottom-0 w-full bg-gradient-to-t ${
                      riskLevel > 75 ? "from-red-500 to-red-600" :
                      riskLevel > 50 ? "from-yellow-500 to-yellow-600" :
                      "from-green-500 to-green-600"
                    }`}
                    style={{ height: `${riskLevel}%` }}
                  ></div>
                </div>
                <div className="relative z-10 text-center">
                  <div className="text-4xl font-bold">{riskLevel}</div>
                  <div className="text-sm text-gray-300">Risk Score</div>
                </div>
              </div>
              {/* Animated pulse circles */}
              <div className="absolute inset-0 rounded-full border-4 border-aries-purple/30 animate-ping" style={{ animationDuration: '3s' }}></div>
              <div className="absolute inset-0 rounded-full border-2 border-aries-purple/20 animate-ping" style={{ animationDuration: '4s' }}></div>
            </div>
            
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-4">Portfolio Risk Assessment</h2>
              <p className="text-gray-300 mb-4">
                Your portfolio has a <span className="font-semibold text-yellow-400">moderate to high risk</span> profile based on the analysis of your smart contracts, market exposure, and liquidity factors. Consider diversifying your assets to reduce overall risk exposure.
              </p>
              <div className="flex gap-3 flex-wrap">
                <button className="px-3 py-1 bg-black/50 border border-white/10 rounded-lg text-sm hover:bg-black/70 transition-colors flex items-center gap-1">
                  <Download className="w-4 h-4" />
                  <span>Export Report</span>
                </button>
                <button className="px-3 py-1 bg-black/50 border border-white/10 rounded-lg text-sm hover:bg-black/70 transition-colors flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  <span>Share Analysis</span>
                </button>
                <button className="px-3 py-1 bg-aries-purple/20 border border-aries-purple/40 rounded-lg text-sm hover:bg-aries-purple/30 transition-colors flex items-center gap-1 text-aries-purple">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Risk Mitigation Plan</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Risk Factors */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Risk Factors</h2>
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-full">
              <div className="space-y-4">
                {riskFactors.map((factor) => (
                  <div 
                    key={factor.name}
                    className={`p-4 border rounded-lg transition-all cursor-pointer ${
                      selectedRisk === factor.name 
                        ? 'border-aries-purple bg-aries-purple/10' 
                        : 'border-white/10 hover:border-white/30'
                    }`}
                    onClick={() => setSelectedRisk(factor.name)}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{factor.name}</h3>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        factor.score > 75 ? "bg-red-500/20 text-red-400" :
                        factor.score > 50 ? "bg-yellow-500/20 text-yellow-400" :
                        "bg-green-500/20 text-green-400"
                      }`}>
                        {factor.impact} Impact
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full ${
                            factor.score > 75 ? "bg-red-500" :
                            factor.score > 50 ? "bg-yellow-500" :
                            "bg-green-500"
                          }`}
                          style={{ width: `${factor.score}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">Score: {factor.score}/100</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-300">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Risk Mitigation</h2>
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 h-full">
              <div className="flex items-center gap-2 mb-4 p-3 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/30">
                <Info className="w-5 h-5 flex-shrink-0" />
                <p className="text-sm">Select a risk factor to see mitigation strategies</p>
              </div>
              
              {selectedRisk ? (
                <div className="space-y-4">
                  <h3 className="font-medium">Mitigation Strategies for {selectedRisk}</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-aries-purple"></div>
                      <p className="text-sm text-gray-300">Diversify assets across multiple protocols</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-aries-purple"></div>
                      <p className="text-sm text-gray-300">Set up automated stop-loss mechanisms</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-aries-purple"></div>
                      <p className="text-sm text-gray-300">Use audited smart contracts only</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-aries-purple"></div>
                      <p className="text-sm text-gray-300">Regularly review portfolio allocation</p>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 px-4 py-2 bg-aries-purple hover:bg-aries-purple/80 transition-colors rounded-lg text-white">
                    Apply Mitigation Strategy
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-800/50 flex items-center justify-center mb-4">
                    <AlertTriangle className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-400">Select a risk factor from the list to see mitigation strategies</p>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* 3D Visualization Placeholder */}
        <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">3D Risk Visualization</h2>
          <div className="bg-gray-900/50 rounded-lg p-4 h-80 flex items-center justify-center border border-white/5">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto rounded-full bg-aries-purple/20 border border-aries-purple/40 flex items-center justify-center mb-4">
                <span className="text-3xl">🔮</span>
              </div>
              <p className="text-lg font-medium mb-2">3D Visualization Coming Soon</p>
              <p className="text-gray-400 max-w-md mx-auto">
                Our advanced 3D risk visualization model is being integrated. Soon you'll be able to explore and interact with your portfolio risks in a whole new dimension.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RiskVisualization;
