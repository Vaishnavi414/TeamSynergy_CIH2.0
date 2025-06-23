/**
 * Wallet Connection Service
 * Handles connections to various wallet providers including MetaMask, WalletConnect, Coinbase, and Phantom
 */

import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import blockchainConfig from '@/config/blockchain.config';

// Using global type declarations from src/types/global.d.ts

// Define supported wallet types
export type WalletType = 'metamask' | 'walletconnect' | 'coinbase' | 'phantom';

// Wallet connection state
export interface WalletConnectionState {
  connected: boolean;
  address: string | null;
  chainId: number | null;
  provider: any | null;
  walletType: WalletType | null;
  balance: string | null;
  network: string | null;
}

// Wallet connection events
export type WalletConnectionEvent = 
  | 'connected'
  | 'disconnected'
  | 'chainChanged'
  | 'accountsChanged';

// Event listener type
export type WalletEventListener = (state: WalletConnectionState) => void;

// Helper function to format ether balance safely
function formatEtherBalance(balance: any): string {
  try {
    // Convert the balance to a string and format it manually
    // This avoids ethers version compatibility issues
    const balanceStr = balance.toString();
    const ethValue = parseFloat(balanceStr) / 1e18; // Convert from wei to ether
    return ethValue.toFixed(6);
  } catch (error) {
    console.error('Error formatting balance:', error);
    return '0';
  }
}

export class WalletConnectionService {
  private state: WalletConnectionState = {
    connected: false,
    address: null,
    chainId: null,
    provider: null,
    walletType: null,
    balance: null,
    network: null,
  };

  private eventEmitter: EventEmitter;
  private web3Modal: any = null;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    // Initialize event emitter
    this.eventEmitter = new EventEmitter();
    
    // Initialize Web3Modal asynchronously
    this.initializationPromise = this.initializeWeb3Modal().catch(error => {
      console.error('Failed to initialize wallet connection service:', error);
    });
  }

  /**
   * Initialize Web3Modal with provider options
   */
  private async initializeWeb3Modal(): Promise<void> {
    try {
      // Dynamically import libraries to avoid SSR issues
      const Web3Modal = (await import('web3modal')).default;
      const WalletConnectProvider = (await import('@walletconnect/web3-provider')).default;
      const CoinbaseWalletSDK = (await import('@coinbase/wallet-sdk')).default;
      
      // Define RPC URLs for different networks
      const rpcUrls: Record<number, string> = {
        1: `https://mainnet.infura.io/v3/${blockchainConfig.infuraId || 'YOUR_INFURA_ID'}`,
        5: `https://goerli.infura.io/v3/${blockchainConfig.infuraId || 'YOUR_INFURA_ID'}`,
        137: `https://polygon-mainnet.infura.io/v3/${blockchainConfig.infuraId || 'YOUR_INFURA_ID'}`,
        80001: `https://polygon-mumbai.infura.io/v3/${blockchainConfig.infuraId || 'YOUR_INFURA_ID'}`,
      };
      
      // Configure provider options for Web3Modal
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: blockchainConfig.infuraId || 'YOUR_INFURA_ID',
            rpc: rpcUrls,
            qrcodeModalOptions: {
              mobileLinks: ['metamask', 'trust', 'rainbow', 'argent', 'imtoken'],
            },
          },
        },
        coinbasewallet: {
          package: CoinbaseWalletSDK,
          options: {
            appName: 'Aries',
            infuraId: blockchainConfig.infuraId || 'YOUR_INFURA_ID',
            rpc: rpcUrls,
            chainId: 1, // Default to Ethereum Mainnet
            darkMode: true,
          },
        },
      };
      
      // Initialize Web3Modal with provider options
      this.web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
        theme: 'dark',
        disableInjectedProvider: false,
      });
      
      // Validate Web3Modal initialization
      if (!this.web3Modal || typeof this.web3Modal.connect !== 'function') {
        this.web3Modal = null;
        throw new Error('Web3Modal connect method not available');
      }
    } catch (error) {
      this.web3Modal = null;
      throw error;
    }
  }

  /**
   * Connect to a wallet
   * @param walletType Type of wallet to connect to
   * @returns Connection state
   */
  public async connect(walletType: WalletType = 'metamask'): Promise<WalletConnectionState> {
    try {
      // Wait for initialization to complete
      if (this.initializationPromise) {
        await this.initializationPromise;
      }
      
      // Special handling for Phantom wallet (Solana)
      if (walletType === 'phantom') {
        return this.connectPhantom();
      }
      
      // Check if Web3Modal is initialized
      if (!this.web3Modal) {
        throw new Error('Web3Modal not initialized');
      }
      
      // Connect to wallet with timeout
      const provider = await Promise.race([
        this.web3Modal.connect(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout. Please try again.')), 30000)
        )
      ]);
      
      // Create ethers provider
      const ethersProvider = new ethers.BrowserProvider(provider);
      
      // Get connected accounts
      const accounts = await ethersProvider.listAccounts();
      if (!accounts || accounts.length === 0) {
        throw new Error('No accounts found');
      }
      
      const address = accounts[0].address;
      const network = await ethersProvider.getNetwork();
      const chainId = Number(network.chainId);
      const balance = await ethersProvider.getBalance(address);
      
      // Update state
      this.state = {
        connected: true,
        address,
        chainId,
        provider: ethersProvider,
        walletType,
        balance: formatEtherBalance(balance),
        network: network.name,
      };
      
      // Setup event listeners
      this.setupEventListeners(provider);
      
      // Emit connected event
      this.emitEvent('connected', this.state);
      
      return this.state;
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners for the provider
   * @param provider Web3 provider
   */
  private setupEventListeners(provider: any): void {
    if (!provider) return;
    
    // Handle account changes
    if (provider.on) {
      provider.on('accountsChanged', this.handleAccountsChanged.bind(this));
      provider.on('chainChanged', this.handleChainChanged.bind(this));
      provider.on('disconnect', this.disconnect.bind(this));
    }
  }

  /**
   * Connect to Phantom wallet for Solana
   * @returns Connection state
   */
  private async connectPhantom(): Promise<WalletConnectionState> {
    try {
      // Wait for initialization to complete
      if (this.initializationPromise) {
        await this.initializationPromise;
      }
      
      // Check if Phantom is installed
      if (!window.solana || !window.solana.isPhantom) {
        window.open('https://phantom.app/download', '_blank');
        throw new Error('Phantom wallet is not installed. Please install Phantom and refresh the page.');
      }

      // Connect to Phantom with timeout
      const response = await Promise.race([
        window.solana.connect(),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error('Phantom connection timeout. Please try again.')), 30000)
        )
      ]);
      
      if (!response || !response.publicKey) {
        throw new Error('Failed to connect to Phantom wallet. No public key returned.');
      }
      
      const address = response.publicKey.toString();

      // Update state
      this.state = {
        connected: true,
        address,
        chainId: 101, // Solana mainnet chain ID
        provider: window.solana,
        walletType: 'phantom',
        balance: '0', // Simplified for demo
        network: 'mainnet',
      };

      // Set up event listeners
      window.solana.on('disconnect', this.disconnect.bind(this));
      window.solana.on('accountChanged', async () => {
        // Reconnect with new account
        await this.connectPhantom();
      });

      // Emit connected event
      this.emitEvent('connected', this.state);

      return this.state;
    } catch (error) {
      console.error('Error connecting to Phantom wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the current wallet
   */
  public async disconnect(): Promise<void> {
    try {
      // Handle Phantom wallet disconnection
      if (this.state.walletType === 'phantom' && window.solana) {
        await window.solana.disconnect();
      }
      
      // Reset state
      this.state = {
        connected: false,
        address: null,
        chainId: null,
        provider: null,
        walletType: null,
        balance: null,
        network: null,
      };
      
      // Clear cached provider
      if (this.web3Modal) {
        this.web3Modal.clearCachedProvider();
      }
      
      // Emit disconnected event
      this.emitEvent('disconnected', this.state);
    } catch (error) {
      console.error('Error disconnecting wallet:', error);
      throw error;
    }
  }

  /**
   * Get the current connection state
   */
  public getState(): WalletConnectionState {
    return { ...this.state };
  }

  /**
   * Add an event listener
   * @param event Event to listen for
   * @param listener Callback function
   */
  public addEventListener(event: WalletConnectionEvent, listener: WalletEventListener): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove an event listener
   * @param event Event to stop listening for
   * @param listener Callback function to remove
   */
  public removeEventListener(event: WalletConnectionEvent, listener: WalletEventListener): void {
    this.eventEmitter.off(event, listener);
  }

  /**
   * Emit an event to all listeners
   * @param event Event to emit
   * @param state Current state
   */
  private emitEvent(event: WalletConnectionEvent, state: WalletConnectionState): void {
    this.eventEmitter.emit(event, state);
  }

  /**
   * Handle chain changed event from wallet
   * @param chainId New chain ID (hex string)
   */
  private async handleChainChanged(chainId: string): Promise<void> {
    if (!this.state.connected || !this.state.provider) return;

    const chainIdNumber = parseInt(chainId, 16);
    const network = await this.state.provider.getNetwork();

    this.state = {
      ...this.state,
      chainId: chainIdNumber,
      network: network.name,
    };

    this.emitEvent('chainChanged', this.state);
  }

  /**
   * Handle accounts changed event from wallet
   * @param accounts Array of accounts
   */
  private async handleAccountsChanged(accounts: string[]): Promise<void> {
    if (!this.state.connected || !this.state.provider) return;

    if (accounts.length === 0) {
      // User disconnected their wallet
      await this.disconnect();
      return;
    }

    const address = accounts[0];
    const balance = await this.state.provider.getBalance(address);

    this.state = {
      ...this.state,
      address,
      balance: formatEtherBalance(balance),
    };

    this.emitEvent('accountsChanged', this.state);
  }
}

// Create and export a singleton instance
const walletConnectionService = new WalletConnectionService();
export default walletConnectionService;
