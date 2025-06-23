import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import walletConnectionService, { WalletConnectionState } from '@/services/blockchain/WalletConnectionService';
import blockchainService from '@/services/blockchain/BlockchainService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const WalletConnect: React.FC = () => {
  const [connectionState, setConnectionState] = useState<WalletConnectionState>(walletConnectionService.getState());
  const [tokens, setTokens] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [connectingWallet, setConnectingWallet] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Listen for wallet connection events
    const handleConnectionChange = (state: WalletConnectionState) => {
      setConnectionState(state);
      if (state.connected && state.address) {
        fetchData(state.address);
      } else {
        setTokens([]);
        setTransactions([]);
      }
    };

    walletConnectionService.addEventListener('connected', handleConnectionChange);
    walletConnectionService.addEventListener('disconnected', handleConnectionChange);

    return () => {
      walletConnectionService.removeEventListener('connected', handleConnectionChange);
      walletConnectionService.removeEventListener('disconnected', handleConnectionChange);
    };
  }, []);

  const fetchData = async (address: string) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch token balances
      const tokensData = await blockchainService.getAllTokenBalances(address);
      setTokens(tokensData);

      // Fetch transaction history
      const transactionsData = await blockchainService.getAllTransactionHistory(address);
      setTransactions(transactionsData);
    } catch (err: any) {
      console.error('Error fetching blockchain data:', err);
      setError(err.message || 'Failed to fetch blockchain data');
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async (walletType: 'metamask' | 'walletconnect' | 'coinbase' | 'phantom') => {
    try {
      // Reset error state
      setError(null);
      
      // Set which wallet is currently connecting (for UI state)
      setConnectingWallet(walletType);
      
      // Add a console log to track which wallet is being connected
      console.log(`Attempting to connect ${walletType} wallet...`);
      
      // Check if MetaMask is installed when trying to connect with MetaMask
      if (walletType === 'metamask' && !window.ethereum) {
        window.open('https://metamask.io/download/', '_blank');
        throw new Error('MetaMask is not installed. We opened the download page for you.');
      }
      
      // Check if Phantom is installed when trying to connect with Phantom
      if (walletType === 'phantom' && !window.solana?.isPhantom) {
        window.open('https://phantom.app/download', '_blank');
        throw new Error('Phantom wallet is not installed. We opened the download page for you.');
      }
      
      // Set a timeout to prevent the connecting state from getting stuck
      const connectionTimeout = setTimeout(() => {
        setConnectingWallet(null);
        setError('Connection timed out. Please try again.');
      }, 30000); // 30 seconds timeout (matching the service timeout)
      
      await walletConnectionService.connect(walletType);
      
      // Clear the timeout if connection is successful
      clearTimeout(connectionTimeout);
    } catch (err: any) {
      console.error('Error connecting wallet:', err);
      
      // Provide more user-friendly error messages
      if (err.message?.includes('User rejected')) {
        setError('Connection rejected. Please approve the connection request in your wallet.');
      } else if (err.message?.includes('not installed')) {
        setError(err.message);
      } else if (err.message?.includes('not available')) {
        setError(err.message);
      } else if (err.message?.includes('timeout')) {
        setError('Connection timed out. Please try again.');
      } else {
        setError(err.message || 'Failed to connect wallet. Please try again.');
      }
    } finally {
      // Always clear the connecting state when done (success or failure)
      setConnectingWallet(null);
    }
  };

  const disconnectWallet = async () => {
    try {
      await walletConnectionService.disconnect();
    } catch (err: any) {
      console.error('Error disconnecting wallet:', err);
      setError(err.message || 'Failed to disconnect wallet');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Wallet Connection</CardTitle>
          <CardDescription>Connect your wallet to view your blockchain assets</CardDescription>
        </CardHeader>
        <CardContent>
          {!connectionState.connected ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => connectWallet('metamask')} 
                  disabled={connectingWallet !== null || connectionState.connected}
                  className="flex items-center justify-center gap-2"
                >
                  {connectingWallet === 'metamask' ? 'Connecting...' : 'MetaMask'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => connectWallet('coinbase')} 
                  disabled={connectingWallet !== null || connectionState.connected}
                  className="flex items-center justify-center gap-2"
                >
                  {connectingWallet === 'coinbase' ? 'Connecting...' : 'Coinbase'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => connectWallet('walletconnect')} 
                  disabled={connectingWallet !== null || connectionState.connected}
                  className="flex items-center justify-center gap-2"
                >
                  {connectingWallet === 'walletconnect' ? 'Connecting...' : 'WalletConnect'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => connectWallet('phantom')} 
                  disabled={connectingWallet !== null || connectionState.connected}
                  className="flex items-center justify-center gap-2"
                >
                  {connectingWallet === 'phantom' ? 'Connecting...' : 'Phantom'}
                </Button>
              </div>
              
              <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                <p className="font-medium">Connect your preferred wallet</p>
                <p>Choose from multiple wallet options to interact with the Aries DeFi platform across different blockchains.</p>
              </div>
              
              <div className="text-sm text-muted-foreground">
                <p>• MetaMask and Coinbase Wallet for Ethereum, Polygon, Arbitrum, and Optimism</p>
                <p>• WalletConnect for mobile wallets</p>
                <p>• Phantom for Solana</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Connected Wallet</p>
                  <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                    {connectionState.address}
                  </p>
                </div>
                <Button onClick={disconnectWallet} variant="destructive" size="sm">
                  Disconnect
                </Button>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Wallet Type</div>
                  <div className="mt-1 font-mono text-xs capitalize">
                    {connectionState.walletType || 'Unknown'}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Network</div>
                  <div className="mt-1 font-mono text-xs capitalize">
                    {connectionState.network || 'Unknown'}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Balance</div>
                  <div className="mt-1 font-mono text-xs">
                    {connectionState.balance ? 
                      parseFloat(connectionState.balance).toFixed(4) + 
                      (connectionState.walletType === 'phantom' ? ' SOL' : ' ETH') 
                      : '0.0000'}
                  </div>
                </div>
                <div className="rounded-lg border p-3">
                  <div className="text-sm font-medium">Chain ID</div>
                  <div className="mt-1 font-mono text-xs">
                    {connectionState.chainId || 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="rounded-md bg-red-50 p-4 my-3 border border-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {connectionState.connected && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Token Balances</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading token balances...</p>
              ) : tokens.length > 0 ? (
                <div className="space-y-2">
                  {tokens.map((token, index) => (
                    <div key={index} className="flex justify-between items-center p-2 border rounded-md">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                          {token.symbol?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{token.symbol || 'Unknown'}</p>
                          <p className="text-xs text-muted-foreground">{token.blockchain} {token.network}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{parseFloat(token.balance).toFixed(4)}</p>
                        {token.balanceUsd && (
                          <p className="text-xs text-muted-foreground">${token.balanceUsd.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No tokens found</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading transactions...</p>
              ) : transactions.length > 0 ? (
                <div className="space-y-2">
                  {transactions.slice(0, 5).map((tx, index) => (
                    <div key={index} className="p-2 border rounded-md">
                      <div className="flex justify-between items-center">
                        <Badge variant={tx.status === 'success' ? 'outline' : 'destructive'}>
                          {tx.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="mt-1">
                        <p className="text-xs truncate">From: {tx.from}</p>
                        <p className="text-xs truncate">To: {tx.to}</p>
                        <div className="flex justify-between mt-1">
                          <p className="text-xs">{tx.blockchain} {tx.network}</p>
                          <p className="text-xs font-medium">{parseFloat(tx.value).toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No transactions found</p>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default WalletConnect;
