/**
 * Enhanced Blockchain Service
 * Provides a unified interface for interacting with multiple blockchains
 * Supports Ethereum, Polygon, Arbitrum, Optimism, and Solana
 */

import { Alchemy, Network, TokenBalanceType, AssetTransfersResult } from 'alchemy-sdk';
import { ethers } from 'ethers';
import blockchainConfig, { NetworkConfig } from '@/config/blockchain.config';
import solanaService, { SolanaToken, SolanaTransaction, SolanaNetwork } from './SolanaService';

// Type assertion for ethers to avoid TypeScript errors
const ethersUtils = ethers as any;

// Define supported blockchain types
export type BlockchainType = 'ethereum' | 'polygon' | 'arbitrum' | 'optimism' | 'solana';

// Define network types
export type EvmNetwork = string; // e.g., 'mainnet', 'goerli', etc.

// Token interface
export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logo?: string;
  balance: string;
  balanceUsd?: number;
  price?: number;
  priceChange24h?: number;
  blockchain?: BlockchainType;
  network?: string;
}

// Transaction interface
export interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  gasUsed: string;
  gasPrice: string;
  status: 'success' | 'failed' | 'pending';
  blockchain: BlockchainType;
  network: string;
}

// Gas price data
export interface GasPrice {
  slow: number;
  average: number;
  fast: number;
  baseFee: number;
  timestamp: number;
}

class BlockchainService {
  private alchemyInstances: Record<string, Alchemy> = {};
  private apiKey: string;
  private gasSubscribers: Array<(data: GasPrice) => void> = [];
  private gasPricePollingInterval: number | null = null;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize Alchemy instances for Ethereum networks
    this.initializeNetworkProviders('ethereum');
    // Initialize Alchemy instances for Polygon networks
    this.initializeNetworkProviders('polygon');
    // Initialize Alchemy instances for Arbitrum networks
    this.initializeNetworkProviders('arbitrum');
    // Initialize Alchemy instances for Optimism networks
    this.initializeNetworkProviders('optimism');
  }

  private initializeNetworkProviders(blockchain: BlockchainType) {
    if (blockchain === 'solana') return; // Solana uses a different provider

    const blockchainNetworks = blockchainConfig[blockchain].networks;
    
    Object.entries(blockchainNetworks).forEach(([networkKey, networkConfig]) => {
      // Create a unique key for each blockchain+network combination
      const key = `${blockchain}-${networkKey}`;
      
      // Map to Alchemy network enum
      let alchemyNetwork: Network;
      
      switch (blockchain) {
        case 'ethereum':
          alchemyNetwork = networkKey === 'mainnet' ? Network.ETH_MAINNET : Network.ETH_GOERLI;
          break;
        case 'polygon':
          alchemyNetwork = networkKey === 'mainnet' ? Network.MATIC_MAINNET : Network.MATIC_MUMBAI;
          break;
        case 'arbitrum':
          alchemyNetwork = networkKey === 'mainnet' ? Network.ARB_MAINNET : Network.ARB_GOERLI;
          break;
        case 'optimism':
          alchemyNetwork = networkKey === 'mainnet' ? Network.OPT_MAINNET : Network.OPT_GOERLI;
          break;
        default:
          alchemyNetwork = Network.ETH_MAINNET;
      }
      
      this.alchemyInstances[key] = new Alchemy({
        apiKey: this.apiKey,
        network: alchemyNetwork,
      });
    });
  }

  // Get token balances for an address across all supported blockchains
  async getTokenBalances(address: string, blockchain: BlockchainType, network: string): Promise<Token[]> {
    try {
      // For Solana, use the Solana service
      if (blockchain === 'solana') {
        const solanaTokens = await solanaService.getTokenBalances(address, network as SolanaNetwork);
        return solanaTokens.map(token => ({
          ...token,
          blockchain: 'solana',
          network
        }));
      }
      
      // For EVM chains, use Alchemy
      const key = `${blockchain}-${network}`;
      const alchemy = this.alchemyInstances[key];
      
      if (!alchemy) {
        throw new Error(`No provider found for ${blockchain} ${network}`);
      }
      
      const balances = await alchemy.core.getTokenBalances(address, {
        type: TokenBalanceType.ERC20,
      });

      const tokens: Token[] = [];
      const metadataPromises = balances.tokenBalances
        .filter(token => BigInt(token.tokenBalance || '0') > BigInt(0))
        .map(async token => {
          try {
            const metadata = await alchemy.core.getTokenMetadata(token.contractAddress);
            const balance = this.formatTokenBalance(token.tokenBalance || '0', metadata.decimals);
            
            tokens.push({
              address: token.contractAddress,
              symbol: metadata.symbol || 'UNKNOWN',
              name: metadata.name || 'Unknown Token',
              decimals: metadata.decimals || 18,
              logo: metadata.logo || undefined,
              balance,
              blockchain,
              network,
              // Price data would be fetched separately in a production app
            });
          } catch (error) {
            console.error(`Error fetching metadata for token ${token.contractAddress}:`, error);
          }
        });

      await Promise.all(metadataPromises);
      
      // Also get native token balance (ETH, MATIC, etc.)
      const nativeBalance = await alchemy.core.getBalance(address);
      const formattedNativeBalance = ethersUtils.utils.formatEther(nativeBalance.toString());
      
      // Get native token info from config
      const nativeToken = blockchainConfig[blockchain].networks[network];
      
      tokens.unshift({
        address: 'native',
        symbol: nativeToken.symbol,
        name: nativeToken.currency,
        decimals: nativeToken.decimals,
        logo: `/assets/tokens/${nativeToken.symbol.toLowerCase()}.png`,
        balance: formattedNativeBalance,
        blockchain,
        network,
      });

      return tokens;
    } catch (error) {
      console.error(`Error fetching token balances for ${blockchain} ${network}:`, error);
      throw error;
    }
  }

  // Get token balances across all blockchains
  async getAllTokenBalances(address: string): Promise<Token[]> {
    const allTokens: Token[] = [];
    
    // Process EVM chains
    for (const blockchain of ['ethereum', 'polygon', 'arbitrum', 'optimism'] as BlockchainType[]) {
      const defaultNetwork = blockchainConfig[blockchain].defaultNetwork;
      try {
        const tokens = await this.getTokenBalances(address, blockchain, defaultNetwork);
        allTokens.push(...tokens);
      } catch (error) {
        console.error(`Error fetching ${blockchain} tokens:`, error);
      }
    }
    
    // Process Solana
    try {
      const solanaTokens = await this.getTokenBalances(address, 'solana', 'mainnet');
      allTokens.push(...solanaTokens);
    } catch (error) {
      console.error('Error fetching Solana tokens:', error);
    }
    
    return allTokens;
  }

  // Get transaction history for an address
  async getTransactionHistory(address: string, blockchain: BlockchainType, network: string): Promise<Transaction[]> {
    try {
      // For Solana, use the Solana service
      if (blockchain === 'solana') {
        const solanaTransactions = await solanaService.getTransactionHistory(address, network as SolanaNetwork);
        return solanaTransactions.map(tx => ({
          hash: tx.signature,
          from: tx.from,
          to: tx.to,
          value: tx.value,
          timestamp: tx.timestamp,
          gasUsed: tx.fee, // Use fee for Solana
          gasPrice: '0', // Solana doesn't have gas price
          status: tx.status,
          blockchain: 'solana' as BlockchainType,
          network,
        }));
      }
      
      // For EVM chains, use Alchemy
      const key = `${blockchain}-${network}`;
      const alchemy = this.alchemyInstances[key];
      
      if (!alchemy) {
        throw new Error(`No provider found for ${blockchain} ${network}`);
      }
      
      // Get transfers for the address
      const transfers = await alchemy.core.getAssetTransfers({
        fromAddress: address,
        category: [
          'external',
          'internal',
          'erc20',
          'erc721',
          'erc1155',
        ] as any[], // Type assertion to avoid category type errors
        maxCount: 100,
      });

      const transactions: Transaction[] = await Promise.all(
        transfers.transfers.map(async (transfer) => {
          let status: 'success' | 'failed' | 'pending' = 'success';
          let gasUsed = '0';
          let gasPrice = '0';
          
          // Get full transaction details
          if (transfer.hash) {
            try {
              const receipt = await alchemy.core.getTransactionReceipt(transfer.hash);
              if (receipt) {
                status = receipt.status ? 'success' : 'failed';
                gasUsed = receipt.gasUsed?.toString() || '0';
                gasPrice = receipt.effectiveGasPrice?.toString() || '0';
              }
            } catch (error) {
              console.error(`Error fetching transaction receipt for ${transfer.hash}:`, error);
            }
          }
          
          // Handle timestamp - metadata might not be available in the type definition
          let timestamp = Date.now();
          try {
            // Access potentially missing properties safely
            const blockTimestamp = (transfer as any).metadata?.blockTimestamp;
            if (blockTimestamp) {
              timestamp = new Date(blockTimestamp).getTime();
            }
          } catch (e) {
            console.error('Error accessing transfer metadata:', e);
          }
          
          return {
            hash: transfer.hash || '',
            from: transfer.from || '',
            to: transfer.to || '',
            value: transfer.value?.toString() || '0',
            timestamp,
            gasUsed,
            gasPrice,
            status,
            blockchain,
            network,
          };
        })
      );

      return transactions;
    } catch (error) {
      console.error(`Error fetching transaction history for ${blockchain} ${network}:`, error);
      throw error;
    }
  }

  // Get transaction history across all blockchains
  async getAllTransactionHistory(address: string): Promise<Transaction[]> {
    const allTransactions: Transaction[] = [];
    
    // Process EVM chains
    for (const blockchain of ['ethereum', 'polygon', 'arbitrum', 'optimism'] as BlockchainType[]) {
      const defaultNetwork = blockchainConfig[blockchain].defaultNetwork;
      try {
        const transactions = await this.getTransactionHistory(address, blockchain, defaultNetwork);
        allTransactions.push(...transactions);
      } catch (error) {
        console.error(`Error fetching ${blockchain} transactions:`, error);
      }
    }
    
    // Process Solana
    try {
      const solanaTransactions = await this.getTransactionHistory(address, 'solana', 'mainnet');
      allTransactions.push(...solanaTransactions);
    } catch (error) {
      console.error('Error fetching Solana transactions:', error);
    }
    
    // Sort by timestamp (newest first)
    return allTransactions.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Get current gas prices
  async getGasPrices(blockchain: BlockchainType, network: string): Promise<GasPrice> {
    try {
      // Solana doesn't have gas prices in the same way as EVM chains
      if (blockchain === 'solana') {
        // For Solana, we return a simplified gas price object with just the average fee
        return {
          slow: 0.000005, // Simplified values for Solana fees
          average: 0.00001,
          fast: 0.000025,
          baseFee: 0,
          timestamp: Date.now(),
        };
      }
      
      // For EVM chains, use Alchemy
      const key = `${blockchain}-${network}`;
      const alchemy = this.alchemyInstances[key];
      
      if (!alchemy) {
        throw new Error(`No provider found for ${blockchain} ${network}`);
      }
      
      const feeData = await alchemy.core.getFeeData();
      
      // Format gas prices using ethers utils
      const baseFee = Number(ethersUtils.utils.formatUnits(feeData.lastBaseFeePerGas || '0', 'gwei'));
      
      // Calculate priority fees with fallbacks
      const priorityFee = feeData.maxPriorityFeePerGas || '0';
      const slowPriorityFee = ethersUtils.BigNumber.from(priorityFee).mul(80).div(100);
      const fastPriorityFee = ethersUtils.BigNumber.from(priorityFee).mul(130).div(100);
      
      const slow = baseFee + Number(ethersUtils.utils.formatUnits(slowPriorityFee, 'gwei'));
      const average = baseFee + Number(ethersUtils.utils.formatUnits(priorityFee, 'gwei'));
      const fast = baseFee + Number(ethersUtils.utils.formatUnits(fastPriorityFee, 'gwei'));
      
      return {
        slow,
        average,
        fast,
        baseFee,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error(`Error fetching gas prices for ${blockchain} ${network}:`, error);
      throw error;
    }
  }

  // Subscribe to gas price updates
  subscribeToGasPrices(callback: (data: GasPrice) => void, blockchain: BlockchainType, network: string, interval = 15000) {
    this.gasSubscribers.push(callback);
    
    // Start polling if not already started
    if (!this.gasPricePollingInterval) {
      this.gasPricePollingInterval = window.setInterval(async () => {
        try {
          const gasPrice = await this.getGasPrices(blockchain, network);
          this.gasSubscribers.forEach(subscriber => subscriber(gasPrice));
        } catch (error) {
          console.error('Error in gas price polling:', error);
        }
      }, interval);
    }
    
    // Return unsubscribe function
    return () => {
      this.gasSubscribers = this.gasSubscribers.filter(sub => sub !== callback);
      if (this.gasSubscribers.length === 0 && this.gasPricePollingInterval) {
        window.clearInterval(this.gasPricePollingInterval);
        this.gasPricePollingInterval = null;
      }
    };
  }

  // Get network details
  getNetworkInfo(blockchain: BlockchainType, network: string) {
    if (blockchain === 'solana') {
      return solanaService.getNetworkInfo(network as SolanaNetwork);
    }
    
    return blockchainConfig[blockchain].networks[network];
  }

  // Get all supported networks
  getSupportedNetworks() {
    const networks = [];
    
    // Add EVM networks
    for (const blockchain of ['ethereum', 'polygon', 'arbitrum', 'optimism'] as BlockchainType[]) {
      Object.entries(blockchainConfig[blockchain].networks).forEach(([networkKey, networkConfig]) => {
        networks.push({
          id: `${blockchain}-${networkKey}`,
          blockchain,
          network: networkKey,
          name: networkConfig.name,
          chainId: networkConfig.chainId,
          currency: networkConfig.currency,
          symbol: networkConfig.symbol,
          decimals: networkConfig.decimals,
          isTestnet: networkConfig.isTestnet,
        });
      });
    }
    
    // Add Solana networks
    Object.entries(blockchainConfig.solana.networks).forEach(([networkKey, networkConfig]) => {
      networks.push({
        id: `solana-${networkKey}`,
        blockchain: 'solana',
        network: networkKey,
        name: networkConfig.name,
        chainId: networkConfig.chainId,
        currency: networkConfig.currency,
        symbol: networkConfig.symbol,
        decimals: networkConfig.decimals,
        isTestnet: networkConfig.isTestnet,
      });
    });
    
    return networks;
  }

  // Helper function to format token balances
  private formatTokenBalance(balance: string, decimals: number): string {
    try {
      return ethersUtils.utils.formatUnits(balance, decimals || 18);
    } catch (error) {
      console.error('Error formatting token balance:', error);
      return '0';
    }
  }
}

// Create and export a singleton instance
const blockchainService = new BlockchainService(import.meta.env.VITE_ALCHEMY_API_KEY || '');
export default blockchainService;
