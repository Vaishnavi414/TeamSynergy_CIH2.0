import { useState } from "react";
import { Wallet, Loader2 } from "lucide-react";
import { useWeb3Auth, Web3Provider } from "@/services/auth/useWeb3Auth";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";

interface Web3WalletButtonProps {
  onSuccess?: (address: string) => void;
  className?: string;
}

const Web3WalletButton = ({ onSuccess, className }: Web3WalletButtonProps) => {
  const [open, setOpen] = useState(false);
  const { connect, isConnecting, isConnected, address, disconnect } = useWeb3Auth();
  const { isSignedIn } = useClerkAuth();
  
  const handleConnect = async (provider: Web3Provider) => {
    
    try {
      const { address } = await connect(provider);
      setOpen(false);
      if (onSuccess) {
        onSuccess(address);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to connect wallet";
      toast.error(message);
    }
  };
  
  const handleDisconnect = async () => {
    try {
      await disconnect();
      if (onSuccess) {
        onSuccess("");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to disconnect wallet";
      toast.error(message);
    }
  };
  
  return (
    <>
      {isConnected && address ? (
        <Button
          onClick={handleDisconnect}
          variant="outline"
          className={`flex items-center gap-2 ${className}`}
        >
          <Wallet className="w-4 h-4" />
          <span>{address.slice(0, 6)}...{address.slice(-4)}</span>
        </Button>
      ) : (
        <Button
          onClick={() => setOpen(true)}
          variant="outline"
          className={`flex items-center gap-2 ${className}`}
          disabled={isConnecting}
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </>
          )}
        </Button>
      )}
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-black/80 backdrop-blur-xl border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Connect Wallet</DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose a wallet provider to connect with Aries
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <Button
              onClick={() => handleConnect("metamask")}
              disabled={isConnecting}
              className="flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600"
            >
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
                alt="MetaMask" 
                className="w-6 h-6" 
              />
              <span className="font-semibold">MetaMask</span>
            </Button>
            
            <Button
              onClick={() => handleConnect("walletconnect")}
              disabled={isConnecting}
              className="flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800"
            >
              <img 
                src="https://avatars.githubusercontent.com/u/37784886" 
                alt="WalletConnect" 
                className="w-6 h-6 rounded-full" 
              />
              <span className="font-semibold">WalletConnect</span>
            </Button>
            
            <Button
              onClick={() => handleConnect("coinbase")}
              disabled={isConnecting}
              className="flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
            >
              <img 
                src="https://avatars.githubusercontent.com/u/1885080" 
                alt="Coinbase Wallet" 
                className="w-6 h-6 rounded-full" 
              />
              <span className="font-semibold">Coinbase Wallet</span>
            </Button>
            
            <Button
              onClick={() => handleConnect("okx")}
              disabled={isConnecting}
              className="flex items-center justify-center gap-3 py-6 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700"
            >
              <img 
                src="https://static.okx.com/cdn/assets/imgs/221/C66237B31F127C98.png" 
                alt="OKX Wallet" 
                className="w-6 h-6 rounded-full" 
              />
              <span className="font-semibold">OKX Wallet</span>
            </Button>
          </div>
          
          {isConnecting && (
            <div className="flex justify-center items-center py-2">
              <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full mr-2"></div>
              <span>Connecting...</span>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Web3WalletButton;
