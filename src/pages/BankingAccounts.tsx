import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Wallet, Plus, Loader2, ExternalLink, DollarSign, PieChart, TrendingUp, AlertTriangle } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import GlowingButton from "@/components/GlowingButton";
import NavHeader from "@/components/NavHeader";
import { toast } from "sonner";

interface BankAccount {
  id: string;
  provider: string;
  type: string;
  name: string;
  balance: number;
  currency: string;
  accountNumber: string;
  lastUpdated: string;
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string;
  balance: number | null;
}

interface AccountSummary {
  totalAccounts: number;
  totalBalance: number;
  currency: string;
}

const BankingAccounts = () => {
  const { user } = useUser();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [connectionProvider, setConnectionProvider] = useState("fynapse");
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Make the API call to get all banking accounts - no token needed for hackathon demo
      const response = await fetch(`${API_URL}/api/banking/accounts`, {
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
        throw new Error(data.message || 'Failed to fetch banking accounts');
      }
      
      // Set accounts and summary
      setAccounts(data.accounts || []);
      setSummary(data.summary || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch banking accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTransactions = async (accountId: string) => {
    try {
      setIsLoadingTransactions(true);
      setError(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Make the API call to get account transactions - no token needed for hackathon demo
      const response = await fetch(`${API_URL}/api/banking/accounts/${accountId}/transactions`, {
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
        throw new Error(data.message || 'Failed to fetch transactions');
      }
      
      // Set transactions
      setTransactions(data.transactions || []);
      setSelectedAccount(accountId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const connectBank = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // API URL - use environment variable or default to localhost in development
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // Get token from localStorage
      const token = localStorage.getItem('aries_token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Make the API call to connect to Finicity banking provider
      const response = await fetch(`${API_URL}/api/banking/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token
        },
        body: JSON.stringify({
          firstName: user?.fullName || user?.username?.split(' ')[0] || 'John',
          lastName: user?.fullName || user?.username?.split(' ')[1] || 'Doe',
          redirectUri: window.location.origin + '/banking-accounts'
        })
      });
      
      // Parse the response
      const data = await response.json();
      
      // Handle error response
      if (!response.ok) {
        throw new Error(data.message || 'Failed to connect to banking provider');
      }
      
      // If we have a connect URL, open it in a new window
      if (data.connectUrl) {
        window.open(data.connectUrl, '_blank', 'width=800,height=800');
        toast.success('Bank connection window opened. Please complete the process there.');
      } else {
        // Show success message
        toast.success('Successfully connected to banking provider');
      }
      
      // Close modal and refresh accounts
      setShowConnectModal(false);
      fetchAccounts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error(err instanceof Error ? err.message : 'Failed to connect to banking provider');
    } finally {
      setIsConnecting(false);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getAccountTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checking':
        return <Wallet className="w-5 h-5 text-blue-500" />;
      case 'savings':
        return <DollarSign className="w-5 h-5 text-green-500" />;
      case 'credit':
        return <CreditCard className="w-5 h-5 text-purple-500" />;
      default:
        return <CreditCard className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTransactionColor = (type: string) => {
    return type === 'credit' ? 'text-green-500' : 'text-red-500';
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food':
        return <DollarSign className="w-4 h-4 text-green-500" />;
      case 'entertainment':
        return <DollarSign className="w-4 h-4 text-blue-500" />;
      case 'transportation':
        return <DollarSign className="w-4 h-4 text-yellow-500" />;
      case 'utilities':
        return <DollarSign className="w-4 h-4 text-purple-500" />;
      case 'shopping':
        return <DollarSign className="w-4 h-4 text-pink-500" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <NavHeader 
        title="Banking Accounts" 
        subtitle="Manage your connected financial accounts" 
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Banking Accounts</h1>
          <p className="text-gray-400">Connect and manage your traditional banking accounts</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Your Accounts</h2>
                <button 
                  onClick={() => setShowConnectModal(true)}
                  className="p-1 rounded-full bg-aries-purple/10 text-aries-purple hover:bg-aries-purple/20 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 text-aries-purple animate-spin" />
                </div>
              ) : accounts.length === 0 ? (
                <div className="bg-black/20 rounded-lg p-4 text-center">
                  <p className="text-gray-400 mb-4">No banking accounts connected yet.</p>
                  <GlowingButton
                    onClick={() => setShowConnectModal(true)}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Connect a Bank
                  </GlowingButton>
                </div>
              ) : (
                <div className="space-y-3">
                  {accounts.map((account) => (
                    <div 
                      key={account.id}
                      className={`bg-black/20 rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedAccount === account.id ? 'border border-aries-purple' : 'border border-white/5 hover:border-white/20'
                      }`}
                      onClick={() => fetchTransactions(account.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-black/40 flex items-center justify-center">
                          {getAccountTypeIcon(account.type)}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{account.name}</div>
                          <div className="text-xs text-gray-400">
                            {account.provider} • {account.type}
                          </div>
                        </div>
                      </div>
                      <div className="mt-2 flex justify-between items-center">
                        <div className={`font-bold ${account.balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(account.balance, account.currency)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {account.accountNumber}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {summary && (
                <div className="mt-6 pt-6 border-t border-white/10">
                  <div className="text-sm font-medium mb-3">Summary</div>
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-400">Total Balance</div>
                      <div className="font-bold text-lg">
                        {formatCurrency(summary.totalBalance, summary.currency)}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-400">Accounts</div>
                      <div>{summary.totalAccounts}</div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-6">
                <Link
                  to="/hybrid-risk"
                  className="flex items-center justify-center gap-2 px-4 py-2 bg-aries-purple/10 text-aries-purple border border-aries-purple/30 rounded-lg hover:bg-aries-purple/20 transition-colors"
                >
                  <PieChart className="w-4 h-4" />
                  <span>View Hybrid Risk Analysis</span>
                </Link>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-2">
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="text-red-500" />
                  <p className="text-red-400">{error}</p>
                </div>
              </div>
            )}
            
            {selectedAccount ? (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Transaction History</h2>
                
                {isLoadingTransactions ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 text-aries-purple animate-spin" />
                  </div>
                ) : transactions.length === 0 ? (
                  <div className="bg-black/20 rounded-lg p-4 text-center">
                    <p className="text-gray-400">No transactions found for this account.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px]">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Date</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Description</th>
                          <th className="text-left py-2 px-4 text-sm font-medium text-gray-400">Category</th>
                          <th className="text-right py-2 px-4 text-sm font-medium text-gray-400">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b border-white/5">
                            <td className="py-3 px-4 text-sm">
                              {new Date(transaction.date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-medium">{transaction.description}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1.5">
                                {getCategoryIcon(transaction.category)}
                                <span className="text-sm">{transaction.category}</span>
                              </div>
                            </td>
                            <td className={`py-3 px-4 text-right font-medium ${getTransactionColor(transaction.type)}`}>
                              {transaction.type === 'credit' ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-aries-purple/30 to-aries-blue/30 flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-white/70" />
                </div>
                <h2 className="text-2xl font-bold mb-2">No Account Selected</h2>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Select an account from the sidebar to view transaction history.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Connect Bank Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg border border-white/10 p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Connect a Bank Account</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Provider</label>
                <select
                  value={connectionProvider}
                  onChange={(e) => setConnectionProvider(e.target.value)}
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
                >
                  <option value="fynapse">Fynapse</option>
                  <option value="saltedge">SaltEdge</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Username</label>
                <input
                  type="text"
                  value={credentials.username}
                  onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                  placeholder="Enter your bank username"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Password</label>
                <input
                  type="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Enter your bank password"
                  className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-2 focus:ring-aries-purple/50"
                />
              </div>
              
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-400">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <p>
                    This is a demo application. In a real application, we would use OAuth or a secure third-party service for bank connections. Never share your actual bank credentials.
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConnectModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <GlowingButton
                  onClick={connectBank}
                  disabled={isConnecting || !credentials.username || !credentials.password}
                  className="flex-1"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Connect
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

export default BankingAccounts;
