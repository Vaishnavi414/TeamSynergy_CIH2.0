/**
 * Solana Blockchain Service
 * Handles Solana-specific blockchain operations
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL, ParsedAccountData, TokenAmount, TokenBalance } from '@solana/web3.js';
import blockchainConfig from '@/config/blockchain.config';

// Define token interface for Solana
export interface SolanaToken {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  balance: string;
  balanceUsd?: number;
  price?: number;
  priceChange24h?: number;
}

// Transaction interface for Solana
export interface SolanaTransaction {
  signature: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  fee: string;
  status: 'success' | 'failed' | 'pending';
  network: 'mainnet' | 'devnet' | 'testnet';
}

// Solana network type
export type SolanaNetwork = 'mainnet' | 'devnet' | 'testnet';

class SolanaService {
  private connections: Record<SolanaNetwork, Connection> = {} as Record<SolanaNetwork, Connection>;

  constructor() {
    this.initializeConnections();
  }

  /**
   * Initialize connections to Solana networks
   */
  private initializeConnections() {
    // Initialize connections for each Solana network
    const solanaNetworks = blockchainConfig.solana.networks;
    
    this.connections = {
      mainnet: new Connection(solanaNetworks.mainnet.rpcUrl),
      devnet: new Connection(solanaNetworks.devnet.rpcUrl),
      testnet: new Connection('https://api.testnet.solana.com'),
    };
  }

  /**
   * Get SOL balance for an address
   * @param address Solana wallet address
   * @param network Solana network to use
   * @returns Balance in SOL
   */
  async getSolBalance(address: string, network: SolanaNetwork = 'mainnet'): Promise<string> {
    try {
      const connection = this.connections[network];
      const publicKey = new PublicKey(address);
      const balance = await connection.getBalance(publicKey);
      return (balance / LAMPORTS_PER_SOL).toString();
    } catch (error) {
      console.error('Error fetching SOL balance:', error);
      throw error;
    }
  }

  /**
   * Get token balances for a Solana address
   * @param address Solana wallet address
   * @param network Solana network to use
   * @returns Array of tokens with balances
   */
  async getTokenBalances(address: string, network: SolanaNetwork = 'mainnet'): Promise<SolanaToken[]> {
    try {
      const connection = this.connections[network];
      const publicKey = new PublicKey(address);
      
      // Get token accounts
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        publicKey,
        { programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA') }
      );

      const tokens: SolanaToken[] = [];

      // Process token accounts
      for (const account of tokenAccounts.value) {
        // Use type assertion to access the parsed data structure
        const accountData = account.account.data.parsed as any;
        const tokenInfo = accountData.info;
        
        // Skip if we don't have the expected structure
        if (!tokenInfo || !tokenInfo.mint || !tokenInfo.tokenAmount) continue;
        
        const mintAddress = tokenInfo.mint;
        const balance = tokenInfo.tokenAmount.uiAmount;

        // Skip tokens with zero balance
        if (balance === 0) continue;

        // Get token metadata (in a production app, you would use a token registry)
        // For this demo, we'll use placeholder data
        tokens.push({
          address: mintAddress,
          symbol: 'Unknown', // Would be fetched from a token registry
          name: 'Unknown Token', // Would be fetched from a token registry
          decimals: tokenInfo.tokenAmount.decimals,
          balance: balance.toString(),
          // Price data would be fetched from an API in a production app
        });
      }

      // Also add SOL balance
      const solBalance = await this.getSolBalance(address, network);
      tokens.unshift({
        address: 'native',
        symbol: 'SOL',
        name: 'Solana',
        decimals: 9,
        logo: '/assets/tokens/sol.png',
        balance: solBalance,
      });

      return tokens;
    } catch (error) {
      console.error('Error fetching Solana token balances:', error);
      throw error;
    }
  }

  /**
   * Get transaction history for a Solana address
   * @param address Solana wallet address
   * @param network Solana network to use
   * @returns Array of transactions
   */
  async getTransactionHistory(address: string, network: SolanaNetwork = 'mainnet'): Promise<SolanaTransaction[]> {
    try {
      const connection = this.connections[network];
      const publicKey = new PublicKey(address);
      
      // Get recent transactions (limited to 20 for this demo)
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 20 });
      
      const transactions: SolanaTransaction[] = [];
      
      // Process each transaction
      for (const signatureInfo of signatures) {
        const signature = signatureInfo.signature;
        const transaction = await connection.getParsedTransaction(signature);
        
        if (!transaction) continue;
        
        // Extract transaction details
        const timestamp = transaction.blockTime ? transaction.blockTime * 1000 : Date.now();
        const fee = (transaction.meta?.fee || 0) / LAMPORTS_PER_SOL;
        const status = transaction.meta?.err ? 'failed' : 'success';
        
        // Extract from/to addresses (simplified for this demo)
        let from = '';
        let to = '';
        let value = '0';
        
        if (transaction.transaction.message.accountKeys.length > 0) {
          from = transaction.transaction.message.accountKeys[0].pubkey.toString();
          
          if (transaction.transaction.message.accountKeys.length > 1) {
            to = transaction.transaction.message.accountKeys[1].pubkey.toString();
          }
        }
        
        // Try to extract value (simplified for this demo)
        if (transaction.meta?.postBalances && transaction.meta?.preBalances && 
            transaction.meta.postBalances.length > 1 && transaction.meta.preBalances.length > 1) {
          const valueLamports = Math.abs(
            transaction.meta.postBalances[0] - transaction.meta.preBalances[0]
          ) - (transaction.meta?.fee || 0);
          
          value = (valueLamports / LAMPORTS_PER_SOL).toString();
        }
        
        transactions.push({
          signature,
          from,
          to,
          value,
          timestamp,
          fee: fee.toString(),
          status,
          network,
        });
      }
      
      return transactions;
    } catch (error) {
      console.error('Error fetching Solana transaction history:', error);
      throw error;
    }
  }

  /**
   * Get network details
   * @param network Solana network
   * @returns Network configuration
   */
  getNetworkInfo(network: SolanaNetwork = 'mainnet') {
    return blockchainConfig.solana.networks[network === 'mainnet' ? 'mainnet' : 'devnet'];
  }
}

// Create and export a singleton instance
const solanaService = new SolanaService();
export default solanaService;
