import axios from 'axios';
import blockchainService, { Token, SupportedNetwork } from '../blockchain/BlockchainService';

// Risk profile types
export type RiskLevel = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

// Asset risk data
export interface AssetRisk {
  address: string;
  symbol: string;
  name: string;
  volatility: number; // Historical volatility (standard deviation)
  sharpeRatio: number; // Risk-adjusted return metric
  maxDrawdown: number; // Maximum observed loss from peak to trough
  var95: number; // 95% Value at Risk (percentage)
  var99: number; // 99% Value at Risk (percentage)
  riskLevel: RiskLevel;
  riskScore: number; // 0-100 score
  correlations?: Record<string, number>; // Correlation with other assets
}

// Portfolio risk profile
export interface PortfolioRisk {
  overallRiskLevel: RiskLevel;
  overallRiskScore: number; // 0-100 score
  diversificationScore: number; // 0-100 score
  volatility: number; // Portfolio volatility
  sharpeRatio: number; // Portfolio Sharpe ratio
  var95: number; // 95% Value at Risk for portfolio
  var99: number; // 99% Value at Risk for portfolio
  maxDrawdown: number; // Maximum portfolio drawdown
  assetAllocation: {
    symbol: string;
    percentage: number;
    riskContribution: number; // Percentage contribution to overall risk
  }[];
  riskFactors: {
    factor: string;
    impact: number; // -10 to 10 scale
    description: string;
  }[];
  simulationResults?: {
    scenario: string;
    expectedReturn: number;
    worstCase: number;
    bestCase: number;
    probability: number;
  }[];
}

// Monte Carlo simulation results
export interface MonteCarloSimulation {
  timeHorizon: number; // in days
  numSimulations: number;
  initialValue: number;
  percentiles: {
    p5: number[];
    p25: number[];
    p50: number[];
    p75: number[];
    p95: number[];
  };
  endValueStats: {
    mean: number;
    median: number;
    min: number;
    max: number;
    stdDev: number;
  };
}

class RiskAnalysisService {
  private apiBaseUrl: string;
  private historicalDataCache: Record<string, any> = {};
  
  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }
  
  // Get risk profile for a specific asset
  async getAssetRisk(assetAddress: string, network: SupportedNetwork = 'ethereum'): Promise<AssetRisk> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/risk/asset/${network}/${assetAddress}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching risk data for asset ${assetAddress}:`, error);
      throw error;
    }
  }
  
  // Get risk profiles for multiple assets
  async getMultipleAssetRisks(assetAddresses: string[], network: SupportedNetwork = 'ethereum'): Promise<Record<string, AssetRisk>> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/risk/assets/${network}`, {
        addresses: assetAddresses
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching risk data for multiple assets:', error);
      throw error;
    }
  }
  
  // Get wallet risk profile
  async getWalletRiskProfile(walletAddress: string, network: SupportedNetwork = 'ethereum'): Promise<PortfolioRisk> {
    try {
      // First get token balances from blockchain service
      const tokens = await blockchainService.getTokenBalances(walletAddress, network);
      
      // Then get risk data for those tokens
      const tokenAddresses = tokens
        .filter(token => token.address !== 'native') // Filter out native token
        .map(token => token.address);
      
      // Add the network's native token (like ETH) with a special identifier
      tokenAddresses.push(`native-${network}`);
      
      // Get risk data for all tokens
      const riskData = await this.getMultipleAssetRisks(tokenAddresses, network);
      
      // Calculate portfolio risk based on token balances and risk data
      const response = await axios.post(`${this.apiBaseUrl}/risk/portfolio/analyze`, {
        walletAddress,
        network,
        tokens: tokens.map(token => ({
          address: token.address,
          symbol: token.symbol,
          balance: token.balance,
          price: token.price || 0,
          riskData: riskData[token.address === 'native' ? `native-${network}` : token.address]
        }))
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error analyzing wallet risk for ${walletAddress}:`, error);
      throw error;
    }
  }
  
  // Run Monte Carlo simulation for a portfolio
  async runMonteCarloSimulation(
    walletAddress: string, 
    timeHorizonDays: number = 365, 
    numSimulations: number = 1000,
    network: SupportedNetwork = 'ethereum'
  ): Promise<MonteCarloSimulation> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/risk/portfolio/monte-carlo`, {
        walletAddress,
        network,
        timeHorizonDays,
        numSimulations
      });
      return response.data;
    } catch (error) {
      console.error(`Error running Monte Carlo simulation for ${walletAddress}:`, error);
      throw error;
    }
  }
  
  // Calculate Value at Risk (VaR) for a portfolio
  async calculateVaR(
    walletAddress: string, 
    confidenceLevel: 0.95 | 0.99 = 0.95,
    timeHorizonDays: number = 30,
    network: SupportedNetwork = 'ethereum'
  ): Promise<{ varPercentage: number; varValue: number }> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/risk/portfolio/var`, {
        walletAddress,
        network,
        confidenceLevel,
        timeHorizonDays
      });
      return response.data;
    } catch (error) {
      console.error(`Error calculating VaR for ${walletAddress}:`, error);
      throw error;
    }
  }
  
  // Get historical volatility for an asset
  async getHistoricalVolatility(
    assetAddress: string, 
    days: number = 30,
    network: SupportedNetwork = 'ethereum'
  ): Promise<{ volatility: number; dailyReturns: number[] }> {
    try {
      // Check cache first
      const cacheKey = `volatility-${assetAddress}-${days}-${network}`;
      if (this.historicalDataCache[cacheKey]) {
        return this.historicalDataCache[cacheKey];
      }
      
      const response = await axios.get(
        `${this.apiBaseUrl}/risk/asset/${network}/${assetAddress}/volatility`, 
        { params: { days } }
      );
      
      // Cache the result
      this.historicalDataCache[cacheKey] = response.data;
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching historical volatility for ${assetAddress}:`, error);
      throw error;
    }
  }
  
  // Get correlation matrix for multiple assets
  async getCorrelationMatrix(
    assetAddresses: string[], 
    days: number = 90,
    network: SupportedNetwork = 'ethereum'
  ): Promise<Record<string, Record<string, number>>> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/risk/correlation-matrix`, {
        addresses: assetAddresses,
        network,
        days
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching correlation matrix:', error);
      throw error;
    }
  }
  
  // Get risk-adjusted return metrics (Sharpe, Sortino, etc.)
  async getRiskAdjustedReturns(
    assetAddress: string, 
    days: number = 365,
    network: SupportedNetwork = 'ethereum'
  ): Promise<{ 
    sharpeRatio: number; 
    sortinoRatio: number; 
    treynorRatio: number; 
    informationRatio: number; 
  }> {
    try {
      const response = await axios.get(
        `${this.apiBaseUrl}/risk/asset/${network}/${assetAddress}/risk-adjusted-returns`, 
        { params: { days } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error fetching risk-adjusted returns for ${assetAddress}:`, error);
      throw error;
    }
  }
  
  // Generate a risk report with recommendations
  async generateRiskReport(
    walletAddress: string,
    network: SupportedNetwork = 'ethereum'
  ): Promise<{
    riskProfile: PortfolioRisk;
    recommendations: {
      type: 'diversification' | 'risk_reduction' | 'optimization';
      description: string;
      impact: 'low' | 'medium' | 'high';
      actions: string[];
    }[];
  }> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/risk/portfolio/report`, {
        walletAddress,
        network
      });
      return response.data;
    } catch (error) {
      console.error(`Error generating risk report for ${walletAddress}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const riskAnalysisService = new RiskAnalysisService(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');
export default riskAnalysisService;
