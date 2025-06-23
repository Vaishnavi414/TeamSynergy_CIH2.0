import axios from 'axios';

// Banking provider types
export type BankingProvider = 'plaid' | 'truelayer' | 'saltedge';

// Account types
export type AccountType = 'checking' | 'savings' | 'credit' | 'investment' | 'loan' | 'other';

// Transaction categories
export type TransactionCategory = 
  | 'income' 
  | 'transfer'
  | 'food_and_drink'
  | 'shopping'
  | 'housing'
  | 'transportation'
  | 'travel'
  | 'entertainment'
  | 'utilities'
  | 'healthcare'
  | 'education'
  | 'personal_care'
  | 'financial'
  | 'other';

// Bank account interface
export interface BankAccount {
  id: string;
  name: string;
  mask: string; // Last 4 digits of account number
  type: AccountType;
  subtype: string;
  balance: {
    available: number;
    current: number;
    limit?: number;
    isoCurrencyCode: string;
  };
  provider: BankingProvider;
  institutionName: string;
  institutionLogo?: string;
  lastUpdated: string;
}

// Transaction interface
export interface BankTransaction {
  id: string;
  accountId: string;
  amount: number;
  isoCurrencyCode: string;
  date: string;
  name: string;
  merchantName?: string;
  merchantLogo?: string;
  category: TransactionCategory;
  subcategory?: string;
  pending: boolean;
  paymentChannel: 'online' | 'in store' | 'other';
  location?: {
    address?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
    lat?: number;
    lon?: number;
  };
}

// OAuth link creation response
export interface LinkTokenResponse {
  linkToken: string;
  expiration: string;
}

// Exchange token response
export interface ExchangeTokenResponse {
  accessToken: string;
  itemId: string;
  userId: string;
}

class BankingService {
  private apiBaseUrl: string;
  private accessTokens: Record<BankingProvider, string | null> = {
    plaid: null,
    truelayer: null,
    saltedge: null
  };

  constructor(apiBaseUrl: string) {
    this.apiBaseUrl = apiBaseUrl;
  }

  // Create a link token for Plaid
  async createPlaidLinkToken(userId: string): Promise<LinkTokenResponse> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/banking/plaid/create-link-token`, {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Plaid link token:', error);
      throw error;
    }
  }

  // Exchange public token for access token (Plaid)
  async exchangePlaidToken(publicToken: string, userId: string): Promise<ExchangeTokenResponse> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/banking/plaid/exchange-token`, {
        publicToken,
        userId
      });
      this.accessTokens.plaid = response.data.accessToken;
      return response.data;
    } catch (error) {
      console.error('Error exchanging Plaid token:', error);
      throw error;
    }
  }

  // Create a link for TrueLayer
  async createTrueLayerLink(userId: string): Promise<LinkTokenResponse> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/banking/truelayer/create-link`, {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating TrueLayer link:', error);
      throw error;
    }
  }

  // Exchange TrueLayer code for access token
  async exchangeTrueLayerToken(code: string, userId: string): Promise<ExchangeTokenResponse> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/banking/truelayer/exchange-token`, {
        code,
        userId
      });
      this.accessTokens.truelayer = response.data.accessToken;
      return response.data;
    } catch (error) {
      console.error('Error exchanging TrueLayer token:', error);
      throw error;
    }
  }

  // Create a link for Salt Edge
  async createSaltEdgeLink(userId: string): Promise<LinkTokenResponse> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/banking/saltedge/create-link`, {
        userId
      });
      return response.data;
    } catch (error) {
      console.error('Error creating Salt Edge link:', error);
      throw error;
    }
  }

  // Exchange Salt Edge code for access token
  async exchangeSaltEdgeToken(code: string, userId: string): Promise<ExchangeTokenResponse> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/banking/saltedge/exchange-token`, {
        code,
        userId
      });
      this.accessTokens.saltedge = response.data.accessToken;
      return response.data;
    } catch (error) {
      console.error('Error exchanging Salt Edge token:', error);
      throw error;
    }
  }

  // Get all bank accounts for a user
  async getAccounts(userId: string, provider?: BankingProvider): Promise<BankAccount[]> {
    try {
      const url = provider 
        ? `${this.apiBaseUrl}/banking/accounts/${userId}?provider=${provider}` 
        : `${this.apiBaseUrl}/banking/accounts/${userId}`;
        
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching bank accounts:', error);
      throw error;
    }
  }

  // Get transactions for an account
  async getTransactions(
    accountId: string, 
    startDate: string, 
    endDate: string, 
    options?: { 
      limit?: number; 
      offset?: number; 
      categories?: TransactionCategory[] 
    }
  ): Promise<BankTransaction[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/banking/transactions/${accountId}`, {
        params: {
          startDate,
          endDate,
          ...options
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  }

  // Update transaction category
  async updateTransactionCategory(
    transactionId: string, 
    category: TransactionCategory, 
    subcategory?: string
  ): Promise<BankTransaction> {
    try {
      const response = await axios.patch(`${this.apiBaseUrl}/banking/transactions/${transactionId}/category`, {
        category,
        subcategory
      });
      return response.data;
    } catch (error) {
      console.error('Error updating transaction category:', error);
      throw error;
    }
  }

  // Get account balance history
  async getBalanceHistory(
    accountId: string, 
    startDate: string, 
    endDate: string
  ): Promise<{ date: string; balance: number }[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/banking/accounts/${accountId}/balance-history`, {
        params: {
          startDate,
          endDate
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching balance history:', error);
      throw error;
    }
  }

  // Get spending by category
  async getSpendingByCategory(
    userId: string, 
    startDate: string, 
    endDate: string,
    accountIds?: string[]
  ): Promise<{ category: TransactionCategory; amount: number }[]> {
    try {
      const response = await axios.get(`${this.apiBaseUrl}/banking/analysis/spending-by-category/${userId}`, {
        params: {
          startDate,
          endDate,
          accountIds: accountIds?.join(',')
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching spending by category:', error);
      throw error;
    }
  }

  // Disconnect a banking provider
  async disconnectProvider(userId: string, provider: BankingProvider): Promise<{ success: boolean }> {
    try {
      const response = await axios.post(`${this.apiBaseUrl}/banking/disconnect`, {
        userId,
        provider
      });
      this.accessTokens[provider] = null;
      return response.data;
    } catch (error) {
      console.error(`Error disconnecting ${provider}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const bankingService = new BankingService(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api');
export default bankingService;
