import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Shield, Lock, Eye, Trash2, Copy, Check, Plus, Loader2, AlertTriangle } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import GlowingButton from "@/components/GlowingButton";
import NavHeader from "@/components/NavHeader";
import { toast } from "sonner";

interface Proof {
  id: string;
  statement: {
    type: string;
    description: string;
  };
  publicOutput?: any;
  createdAt: string;
  expiresAt: string;
  shareableLink: string;
}

const PrivacyCenter = () => {
  const { user } = useUser();
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newProof, setNewProof] = useState({
    type: "equality",
    value: 750,
    min: 700,
    max: 850
  });

  useEffect(() => {
    fetchProofs();
  }, []);

  const fetchProofs = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Make the API call to get all user proofs - no token needed for hackathon demo
      const response = await fetch(`${API_URL}/api/privacy/proofs`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
          // The backend has authentication bypass for the hackathon demo
        }
      });
      
      // Parse the response
      const data = await response.json();
      
      // Handle error response
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch proofs');
      }
      
      // Set proofs
      setProofs(data.proofs || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch proofs');
    } finally {
      setIsLoading(false);
    }
  };

  const createProof = async () => {
    try {
      setIsCreating(true);
      setError(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Prepare the statement based on proof type
      const statement: any = {
        type: newProof.type,
        value: newProof.value
      };
      
      // Add min/max values for range proofs
      if (newProof.type === 'range') {
        statement.min = newProof.min;
        statement.max = newProof.max;
      }
      
      // Make the API call to create a proof - no token needed for hackathon demo
      const response = await fetch(`${API_URL}/api/privacy/generate-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
          // The backend has authentication bypass for the hackathon demo
        },
        body: JSON.stringify({ statement })
      });
      
      // Parse the response
      const data = await response.json();
      
      // Handle error response
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create proof');
      }
      
      // Show success message
      toast.success('Zero-Knowledge Proof created successfully');
      
      // Close modal and refresh proofs
      setShowCreateModal(false);
      fetchProofs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to create proof');
    } finally {
      setIsCreating(false);
    }
  };

  const revokeProof = async (proofId: string) => {
    if (!confirm('Are you sure you want to revoke this proof? This action cannot be undone.')) {
      return;
    }
    
    try {
      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Make the API call to revoke the proof - no token needed for hackathon demo
      const response = await fetch(`${API_URL}/api/privacy/revoke-proof/${proofId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
          // The backend has authentication bypass for the hackathon demo
        }
      });
      
      // Parse the response
      const data = await response.json();
      
      // Handle error response
      if (!response.ok) {
        throw new Error(data.message || 'Failed to revoke proof');
      }
      
      // Show success message
      toast.success('Proof revoked successfully');
      
      // Refresh proofs
      fetchProofs();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to revoke proof');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success('Link copied to clipboard');
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(null);
    }, 2000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatementDescription = (proof: Proof) => {
    // Simply return the description from the statement
    return proof.statement.description;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <NavHeader 
        title="Privacy Center" 
        subtitle="Generate and manage zero-knowledge proofs" 
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Privacy Center</h1>
          <p className="text-gray-400">Manage your privacy with Zero-Knowledge Proofs</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Privacy Tools</h2>
              
              <div className="space-y-4">
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg hover:bg-black/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-aries-purple/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-aries-purple" />
                    </div>
                    <div>
                      <div className="font-medium">Create ZK-Proof</div>
                      <div className="text-xs text-gray-400">Generate a new proof</div>
                    </div>
                  </div>
                </button>
                
                <Link 
                  to="/banking-accounts"
                  className="w-full flex items-center justify-between p-4 bg-black/20 border border-white/10 rounded-lg hover:bg-black/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-aries-blue/20 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-aries-blue" />
                    </div>
                    <div>
                      <div className="font-medium">Banking Privacy</div>
                      <div className="text-xs text-gray-400">Manage bank connections</div>
                    </div>
                  </div>
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="bg-aries-purple/10 border border-aries-purple/30 rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-aries-purple">What are ZK-Proofs?</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Zero-Knowledge Proofs allow you to prove a statement is true without revealing the underlying data.
                  </p>
                  <p className="text-sm text-gray-300">
                    For example, you can prove your credit score is above 700 without revealing the exact score.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500" />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}
            
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Your ZK-Proofs</h2>
                <GlowingButton
                  onClick={() => setShowCreateModal(true)}
                  className="px-3 py-1.5 text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New Proof
                </GlowingButton>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-aries-purple animate-spin" />
                </div>
              ) : proofs.length === 0 ? (
                <div className="bg-black/20 rounded-lg p-8 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-aries-purple/30 to-aries-blue/30 flex items-center justify-center">
                    <Shield className="w-8 h-8 text-white/70" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">No ZK-Proofs Yet</h3>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Create your first Zero-Knowledge Proof to share verifiable information without revealing sensitive data.
                  </p>
                  <GlowingButton
                    onClick={() => setShowCreateModal(true)}
                    className="mx-auto"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Your First Proof
                  </GlowingButton>
                </div>
              ) : (
                <div className="space-y-4">
                  {proofs.map((proof) => (
                    <div 
                      key={proof.id}
                      className="bg-black/20 border border-white/5 rounded-lg p-5"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Shield className="w-4 h-4 text-aries-purple" />
                            <h3 className="font-medium">{getStatementDescription(proof)}</h3>
                          </div>
                          <div className="text-sm text-gray-400 mb-3">
                            Created: {formatDate(proof.createdAt)} • Expires: {formatDate(proof.expiresAt)}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-xs bg-gray-800 rounded-md px-2 py-1 flex items-center gap-1 max-w-xs truncate">
                              <span className="truncate">{proof.shareableLink}</span>
                              <button
                                onClick={() => copyToClipboard(proof.shareableLink, proof.id)}
                                className="text-gray-400 hover:text-white"
                              >
                                {copied === proof.id ? (
                                  <Check className="w-3.5 h-3.5 text-green-500" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => window.open(proof.shareableLink, '_blank')}
                            className="p-2 rounded-lg bg-aries-blue/10 text-aries-blue hover:bg-aries-blue/20 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => revokeProof(proof.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      {/* Create Proof Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-white/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Create a Zero-Knowledge Proof</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Proof Type</label>
                <select
                  value={newProof.type}
                  onChange={(e) => setNewProof({ ...newProof, type: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
                >
                  <option value="equality">Equality Proof</option>
                  <option value="range">Range Proof</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Secret Value</label>
                <input
                  type="number"
                  value={newProof.value}
                  onChange={(e) => setNewProof({ ...newProof, value: parseInt(e.target.value) })}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
                />
                <p className="text-xs text-gray-500 mt-1">This value will be kept secret and not revealed in the proof</p>
              </div>
              
              {newProof.type === 'range' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Min Value</label>
                    <input
                      type="number"
                      value={newProof.min}
                      onChange={(e) => setNewProof({ ...newProof, min: parseInt(e.target.value) })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Max Value</label>
                    <input
                      type="number"
                      value={newProof.max}
                      onChange={(e) => setNewProof({ ...newProof, max: parseInt(e.target.value) })}
                      className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
                    />
                  </div>
                </div>
              )}
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-400">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>
                    This proof will be generated using your actual data. You can share the proof link with third parties without revealing your sensitive information.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <GlowingButton
                  onClick={createProof}
                  disabled={isCreating}
                  className="flex-1"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Create Proof
                    </>
                  )}
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrivacyCenter;
