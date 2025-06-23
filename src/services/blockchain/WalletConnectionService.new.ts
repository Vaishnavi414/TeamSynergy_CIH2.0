/**
 * Wallet Connection Service
 * Handles connections to various wallet providers including MetaMask, WalletConnect, and Phantom
 */

import { ethers } from 'ethers';
import { EventEmitter } from 'events';
import Web3Modal from 'web3modal';
import blockchainConfig from '@/config/blockchain.config';

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

class WalletConnectionService {
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
  private web3Modal: any;

  constructor() {
    // Initialize event emitter
    this.eventEmitter = new EventEmitter();
    
    // Initialize Web3Modal
    this.initializeWeb3Modal();
  }

  /**
   * Initialize Web3Modal for wallet connections
   */
  private initializeWeb3Modal() {
    try {
      // Import WalletConnect provider
      const WalletConnectProvider = require('@walletconnect/web3-provider').default;
      
      // Create Web3Modal config with provider options
      const providerOptions = {
        walletconnect: {
          package: WalletConnectProvider,
          options: {
            infuraId: import.meta.env.VITE_INFURA_API_KEY || '',
            rpc: {
              1: import.meta.env.VITE_ETHEREUM_RPC_URL || '',
              137: import.meta.env.VITE_POLYGON_RPC_URL || '',
              42161: import.meta.env.VITE_ARBITRUM_RPC_URL || '',
              10: import.meta.env.VITE_OPTIMISM_RPC_URL || '',
            },
          },
        },
      };

      // Initialize Web3Modal
      this.web3Modal = new Web3Modal({
        cacheProvider: true,
        providerOptions,
        theme: 'dark',
      });
    } catch (error) {
      console.error('Failed to initialize Web3Modal:', error);
      this.web3Modal = null;
    }
  }

  /**
   * Connect to a wallet
   * @param walletType Type of wallet to connect to
   * @returns Connection state
   */
  async connect(walletType: WalletType = 'metamask'): Promise<WalletConnectionState> {
    try {
      console.log(`Connecting to wallet type: ${walletType}`);
      
      // For Phantom (Solana) wallet
      if (walletType === 'phantom') {
        return this.connectPhantom();
      }
      
      // For Ethereum wallets (MetaMask, WalletConnect, Coinbase)
      let provider;
      
      if (walletType === 'metamask' && window.ethereum) {
        // Direct connection to MetaMask
        provider = window.ethereum;
      } else {
        // Use Web3Modal for other wallet types
        provider = await this.web3Modal.connect();
      }
      
      // Create ethers provider
      const ethersProvider = new ethers.providers.Web3Provider(provider);
      const signer = ethersProvider.getSigner();
      const address = await signer.getAddress();
      const network = await ethersProvider.getNetwork();
      const balance = await ethersProvider.getBalance(address);
      
      // Determine wallet type based on provider
      let detectedWalletType = walletType;
      if (provider.isMetaMask) {
        detectedWalletType = 'metamask';
      } else if (provider.isCoinbaseWallet) {
        detectedWalletType = 'coinbase';
      } else if (provider.isWalletConnect) {
        detectedWalletType = 'walletconnect';
      }
      
      // Update state
      this.state = {
        connected: true,
        address,
        chainId: network.chainId,
        provider: ethersProvider,
        walletType: detectedWalletType,
        balance: ethers.utils.formatEther(balance),
        network: network.name,
      };
      
      // Set up event listeners
      provider.on('accountsChanged', this.handleAccountsChanged.bind(this));
      provider.on('chainChanged', this.handleChainChanged.bind(this));
      provider.on('disconnect', this.disconnect.bind(this));
      
      // Emit connected event
      this.emitEvent('connected', this.state);
      
      return this.state;
    } catch (error) {
      console.error('Error connecting to wallet:', error);
      throw error;
    }
  }

  /**
   * Disconnect from the current wallet
   */
  async disconnect(): Promise<void> {
    if (this.state.connected && this.state.provider) {
      // For Phantom wallet
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
      
      // Emit disconnected event
      this.emitEvent('disconnected', this.state);
    }
  }

  /**
   * Get the current connection state
   */
  getState(): WalletConnectionState {
    return { ...this.state };
  }

  /**
   * Add an event listener
   * @param event Event to listen for
   * @param listener Callback function
   */
  addEventListener(event: WalletConnectionEvent, listener: WalletEventListener): void {
    this.eventEmitter.on(event, listener);
  }

  /**
   * Remove an event listener
   * @param event Event to stop listening for
   * @param listener Callback function to remove
   */
  removeEventListener(event: WalletConnectionEvent, listener: WalletEventListener): void {
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
      balance: ethers.utils.formatEther(balance),
    };

    this.emitEvent('accountsChanged', this.state);
  }

  /**
   * Connect to Phantom wallet for Solana
   * @returns Connection state
   */
  private async connectPhantom(): Promise<WalletConnectionState> {
    try {
      // Check if Phantom is installed
      if (!window.solana || !window.solana.isPhantom) {
        window.open('https://phantom.app/download', '_blank');
        throw new Error('Phantom wallet is not installed');
      }

      // Connect to Phantom
      const response = await window.solana.connect();
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
}

// Create and export a singleton instance
const walletConnectionService = new WalletConnectionService();
export default walletConnectionService;
