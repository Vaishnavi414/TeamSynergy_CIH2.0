import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle, AlertTriangle, Loader2, ExternalLink, Copy, Shield } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import GlowingButton from "@/components/GlowingButton";
import { toast } from "sonner";

interface Standard {
  name: string;
  compliant: boolean | 'Partial';
  details: string;
  missingFunctions?: string[];
}

interface Regulation {
  name: string;
  compliant: boolean | 'Partial';
  details: string;
}

interface ComplianceResult {
  address: string;
  checkDate: string;
  standards: Standard[];
  regulations: Regulation[];
  overallCompliance: string;
}

const ComplianceChecker = () => {
  const { user } = useUser();
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [complianceResult, setComplianceResult] = useState<ComplianceResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!address) {
      toast.error("Contract address is required");
      return;
    }

    try {
      setIsChecking(true);
      setError(null);
      setComplianceResult(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = 'http://localhost:5000';
      
      // Get token from localStorage
      const token = localStorage.getItem('aries_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make the API call to check compliance
      const response = await fetch(`${API_URL}/api/contracts/compliance`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({ address, code: code.trim() || undefined })
      });
      
      // Parse the response
      const data = await response.json();
      
      // Handle error response
      if (!response.ok) {
        throw new Error(data.message || 'Failed to check compliance');
      }
      
      // Set compliance result
      setComplianceResult(data);
      toast.success("Compliance check completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to check compliance');
    } finally {
      setIsChecking(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getComplianceColor = (compliance: boolean | 'Partial') => {
    if (compliance === true) return 'text-green-500 bg-green-500/10 border-green-500/30';
    if (compliance === 'Partial') return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
    return 'text-red-500 bg-red-500/10 border-red-500/30';
  };

  const getComplianceIcon = (compliance: boolean | 'Partial') => {
    if (compliance === true) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (compliance === 'Partial') return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    return <AlertTriangle className="w-5 h-5 text-red-500" />;
  };

  const getOverallComplianceColor = (compliance: string) => {
    switch (compliance.toLowerCase()) {
      case 'high':
        return 'text-green-500';
      case 'moderate':
        return 'text-yellow-500';
      case 'low':
        return 'text-red-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <nav className="py-4 px-6 lg:px-8 flex justify-between items-center bg-black/30 backdrop-blur-lg border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg shadow-lg hover:-translate-y-1 transition-all duration-300 text-white">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Dashboard</span>
            </Link>
            <Link to="/contracts" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Contracts</span>
            </Link>
          </div>
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Compliance Checker</h1>
          <p className="text-gray-400">Verify smart contract compliance with standards and regulations</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Contract Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contract Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Contract Code (Optional)</label>
                  <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="// Paste Solidity code here..."
                    rows={10}
                    className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
                  />
                  <p className="text-xs text-gray-500 mt-1">If not provided, we'll attempt to fetch the code from the blockchain.</p>
                </div>
                
                <GlowingButton
                  onClick={handleCheck}
                  disabled={isChecking || !address}
                  className="w-full"
                >
                  {isChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Check Compliance
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
                  <AlertTriangle className="text-red-500" />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}
            
            {isChecking && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <Loader2 className="w-12 h-12 text-aries-purple animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Checking Compliance</h2>
                <p className="text-gray-400">
                  Analyzing smart contract for compliance with standards and regulations...
                </p>
              </div>
            )}
            
            {complianceResult && !isChecking && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Compliance Results</h2>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="font-mono">{complianceResult.address.slice(0, 8)}...{complianceResult.address.slice(-6)}</span>
                      <button 
                        onClick={() => copyToClipboard(complianceResult.address)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a 
                        href={`https://etherscan.io/address/${complianceResult.address}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Checked on {new Date(complianceResult.checkDate).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 border border-white/10">
                    <div className={`font-bold ${getOverallComplianceColor(complianceResult.overallCompliance)}`}>
                      {complianceResult.overallCompliance} Compliance
                    </div>
                    <Shield className={`w-5 h-5 ${getOverallComplianceColor(complianceResult.overallCompliance)}`} />
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Standards Compliance</h3>
                  
                  <div className="space-y-4">
                    {complianceResult.standards.map((standard, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-4 ${getComplianceColor(standard.compliant)}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {getComplianceIcon(standard.compliant)}
                              <h4 className="font-bold">{standard.name}</h4>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-black/30 border border-current">
                                {standard.compliant === true ? 'Compliant' : standard.compliant === 'Partial' ? 'Partial' : 'Non-compliant'}
                              </span>
                            </div>
                            <p className="mt-2">{standard.details}</p>
                            
                            {standard.missingFunctions && standard.missingFunctions.length > 0 && (
                              <div className="mt-3 pt-3 border-t border-current/20">
                                <p className="text-sm font-semibold mb-1">Missing Functions:</p>
                                <ul className="list-disc list-inside text-sm space-y-1">
                                  {standard.missingFunctions.map((func, i) => (
                                    <li key={i} className="font-mono">{func}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Regulatory Compliance</h3>
                  
                  <div className="space-y-4">
                    {complianceResult.regulations.map((regulation, index) => (
                      <div 
                        key={index} 
                        className={`border rounded-lg p-4 ${getComplianceColor(regulation.compliant)}`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              {getComplianceIcon(regulation.compliant)}
                              <h4 className="font-bold">{regulation.name}</h4>
                              <span className="px-2 py-0.5 text-xs rounded-full bg-black/30 border border-current">
                                {regulation.compliant === true ? 'Compliant' : regulation.compliant === 'Partial' ? 'Partial' : 'Non-compliant'}
                              </span>
                            </div>
                            <p className="mt-2">{regulation.details}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  <a 
                    href={`https://etherscan.io/address/${complianceResult.address}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded hover:bg-blue-500/20 transition-colors text-sm flex items-center gap-1"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Etherscan
                  </a>
                  <button
                    onClick={() => {
                      const reportText = `
Contract Compliance Report
Address: ${complianceResult.address}
Check Date: ${new Date(complianceResult.checkDate).toLocaleString()}
Overall Compliance: ${complianceResult.overallCompliance}

Standards:
${complianceResult.standards.map(s => `- ${s.name}: ${s.compliant === true ? 'Compliant' : s.compliant === 'Partial' ? 'Partial' : 'Non-compliant'} - ${s.details}`).join('\n')}

Regulations:
${complianceResult.regulations.map(r => `- ${r.name}: ${r.compliant === true ? 'Compliant' : r.compliant === 'Partial' ? 'Partial' : 'Non-compliant'} - ${r.details}`).join('\n')}
                      `;
                      copyToClipboard(reportText);
                    }}
                    className="px-3 py-1.5 bg-gray-500/10 text-gray-400 border border-gray-500/30 rounded hover:bg-gray-500/20 transition-colors text-sm flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    Copy Report
                  </button>
                </div>
              </div>
            )}
            
            {!complianceResult && !isChecking && !error && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-aries-purple/30 to-aries-blue/30 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-white/70" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Compliance Results</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Enter a contract address and optionally paste the contract code to check compliance with standards and regulations.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ComplianceChecker;
