import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Shield, Check, AlertTriangle } from "lucide-react";
import GlowingButton from "@/components/GlowingButton";
import { toast } from "sonner";

interface CreditScoreNFTProps {
  creditScore: number;
  onMintSuccess?: (data: any) => void;
}

const CreditScoreNFT = ({ creditScore, onMintSuccess }: CreditScoreNFTProps) => {
  const { user } = useAuth();
  const [walletAddress, setWalletAddress] = useState(user?.walletAddress || "");
  const [isMinting, setIsMinting] = useState(false);
  const [mintedNFT, setMintedNFT] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Get credit score category and color
  const getCreditScoreCategory = (score: number) => {
    if (score >= 800) return { category: "Excellent", color: "text-green-500" };
    if (score >= 740) return { category: "Very Good", color: "text-emerald-500" };
    if (score >= 670) return { category: "Good", color: "text-blue-500" };
    if (score >= 580) return { category: "Fair", color: "text-yellow-500" };
    return { category: "Poor", color: "text-red-500" };
  };

  const { category, color } = getCreditScoreCategory(creditScore);

  const validateWalletAddress = (address: string) => {
    // Basic Ethereum address validation
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  };

  const mintNFT = async () => {
    try {
      // Validate wallet address
      if (!validateWalletAddress(walletAddress)) {
        setError("Please enter a valid Ethereum wallet address");
        return;
      }

      setIsMinting(true);
      setError(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Get token from localStorage
      const token = localStorage.getItem('aries_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make the API call to mint the NFT
      const response = await fetch(`${API_URL}/api/blockchain/mint-credit-score-nft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          walletAddress,
          creditScore,
          additionalData: {
            category,
            mintedBy: user?.name || 'Anonymous',
            platform: 'Aries Finance'
          }
        })
      });
      
      // Parse the response
      const data = await response.json();
      
      // Handle error response
      if (!response.ok) {
        throw new Error(data.message || 'Failed to mint NFT');
      }
      
      // Show success message
      toast.success('Successfully minted Credit Score NFT!');
      
      // Set minted NFT data
      setMintedNFT(data);
      
      // Call onMintSuccess callback if provided
      if (onMintSuccess) {
        onMintSuccess(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to mint NFT');
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4">Mint Your Credit Score as NFT</h2>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-400">Your Credit Score:</span>
          <span className={`text-2xl font-bold ${color}`}>{creditScore}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-400">Category:</span>
          <span className={`font-medium ${color}`}>{category}</span>
        </div>
      </div>
      
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        </div>
      )}
      
      {mintedNFT ? (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-5 h-5 text-green-500" />
            <h3 className="font-medium text-green-400">NFT Minted Successfully!</h3>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Token ID:</span>
              <span className="font-mono">{mintedNFT.tokenId}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Transaction:</span>
              <a 
                href={`https://sepolia.etherscan.io/tx/${mintedNFT.txHash}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-mono text-aries-blue hover:underline truncate max-w-[200px]"
              >
                {mintedNFT.txHash.substring(0, 10)}...
              </a>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <label className="block text-sm text-gray-400 mb-1">Wallet Address</label>
            <input
              type="text"
              value={walletAddress}
              onChange={(e) => setWalletAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
            />
          </div>
          
          <GlowingButton
            onClick={mintNFT}
            disabled={isMinting}
            className="w-full"
          >
            {isMinting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Minting...
              </>
            ) : (
              <>
                <Shield className="w-4 h-4 mr-2" />
                Mint as NFT
              </>
            )}
          </GlowingButton>
        </>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        <p>This will create an NFT representing your credit score on the Ethereum blockchain.</p>
        <p className="mt-1">The NFT will be minted on the Sepolia testnet and sent to your wallet address.</p>
      </div>
    </div>
  );
};

export default CreditScoreNFT;
