import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle, Check, X, Loader2, ExternalLink, Copy, CheckCircle } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import GlowingButton from "@/components/GlowingButton";
import { toast } from "sonner";

interface Vulnerability {
  type: string;
  severity: string;
  description: string;
  recommendation?: string;
  location?: string;
}

interface ScanResult {
  address: string;
  scanDate: string;
  vulnerabilities: Vulnerability[];
  overallRisk: string;
  scanMethod: string;
}

const ContractScanner = () => {
  const { user } = useUser();
  const [address, setAddress] = useState("");
  const [code, setCode] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async () => {
    if (!address) {
      toast.error("Contract address is required");
      return;
    }

    try {
      setIsScanning(true);
      setError(null);
      setScanResult(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = 'http://localhost:5000';
      
      // Get token from localStorage
      const token = localStorage.getItem('aries_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make the API call to scan the contract
      const response = await fetch(`${API_URL}/api/contracts/scan`, {
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
        throw new Error(data.message || 'Failed to scan contract');
      }
      
      // Set scan result
      setScanResult(data);
      toast.success("Contract scan completed");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to scan contract');
    } finally {
      setIsScanning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-500 bg-red-500/10 border-red-500/30';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/30';
      case 'low':
        return 'text-green-500 bg-green-500/10 border-green-500/30';
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk.toLowerCase()) {
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
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Smart Contract Scanner</h1>
          <p className="text-gray-400">Scan smart contracts for vulnerabilities and security issues</p>
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
                  onClick={handleScan}
                  disabled={isScanning || !address}
                  className="w-full"
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Scanning...
                    </>
                  ) : (
                    <>
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Scan for Vulnerabilities
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
            
            {isScanning && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <Loader2 className="w-12 h-12 text-aries-purple animate-spin mx-auto mb-4" />
                <h2 className="text-xl font-bold mb-2">Scanning Contract</h2>
                <p className="text-gray-400">
                  Analyzing smart contract for potential vulnerabilities and security issues...
                </p>
              </div>
            )}
            
            {scanResult && !isScanning && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold mb-1">Scan Results</h2>
                    <div className="flex items-center gap-2 text-gray-400 text-sm">
                      <span className="font-mono">{scanResult.address.slice(0, 8)}...{scanResult.address.slice(-6)}</span>
                      <button 
                        onClick={() => copyToClipboard(scanResult.address)}
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <a 
                        href={`https://etherscan.io/address/${scanResult.address}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-500 hover:text-white transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Scanned on {new Date(scanResult.scanDate).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-black/50 border border-white/10">
                    <div className={`font-bold ${getRiskColor(scanResult.overallRisk)}`}>
                      {scanResult.overallRisk} Risk
                    </div>
                    {scanResult.overallRisk.toLowerCase() === 'high' && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    {scanResult.overallRisk.toLowerCase() === 'medium' && (
                      <AlertTriangle className="w-5 h-5 text-yellow-500" />
                    )}
                    {scanResult.overallRisk.toLowerCase() === 'low' && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">Vulnerabilities Found ({scanResult.vulnerabilities.length})</h3>
                  
                  {scanResult.vulnerabilities.length === 0 ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-center gap-3">
                      <CheckCircle className="text-green-500 w-6 h-6" />
                      <div>
                        <p className="font-medium text-green-400">No vulnerabilities detected</p>
                        <p className="text-sm text-gray-400">This contract appears to be secure based on our analysis.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {scanResult.vulnerabilities.map((vuln, index) => (
                        <div 
                          key={index} 
                          className={`border rounded-lg p-4 ${getSeverityColor(vuln.severity)}`}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5" />
                                <h4 className="font-bold">{vuln.type}</h4>
                                <span className="px-2 py-0.5 text-xs rounded-full bg-black/30 border border-current">
                                  {vuln.severity}
                                </span>
                              </div>
                              <p className="mt-2">{vuln.description}</p>
                              {vuln.location && (
                                <p className="text-sm mt-1">
                                  <span className="opacity-70">Location:</span> {vuln.location}
                                </p>
                              )}
                              {vuln.recommendation && (
                                <div className="mt-3 pt-3 border-t border-current/20">
                                  <p className="text-sm">
                                    <span className="font-semibold">Recommendation:</span> {vuln.recommendation}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2 mt-6">
                  <a 
                    href={`https://etherscan.io/address/${scanResult.address}`} 
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
Contract Vulnerability Report
Address: ${scanResult.address}
Scan Date: ${new Date(scanResult.scanDate).toLocaleString()}
Overall Risk: ${scanResult.overallRisk}

Vulnerabilities (${scanResult.vulnerabilities.length}):
${scanResult.vulnerabilities.map(v => `- ${v.type} (${v.severity}): ${v.description}`).join('\n')}
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
            
            {!scanResult && !isScanning && !error && (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-aries-purple/30 to-aries-blue/30 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-white/70" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Scan Results</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Enter a contract address and optionally paste the contract code to scan for vulnerabilities.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContractScanner;
