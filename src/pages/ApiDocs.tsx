import { useState } from "react";
import { Link } from "react-router-dom";
import { Code, ChevronDown, ChevronRight, Copy, Check, ExternalLink } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import NavHeader from "@/components/NavHeader";

interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  authentication: boolean;
  requestBody?: {
    type: string;
    example: string;
  };
  responseBody?: {
    type: string;
    example: string;
  };
}

interface ApiCategory {
  id: string;
  name: string;
  description: string;
  endpoints: Endpoint[];
}

const ApiDocs = () => {
  const { user } = useUser();
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedEndpoints, setExpandedEndpoints] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // API documentation data
  const apiCategories: ApiCategory[] = [
    {
      id: "auth",
      name: "Authentication",
      description: "Endpoints for user authentication and registration",
      endpoints: [
        {
          id: "auth-register",
          method: "POST",
          path: "/api/auth/register",
          description: "Register a new user account",
          authentication: false,
          requestBody: {
            type: "application/json",
            example: JSON.stringify({
              name: "John Doe",
              email: "john@example.com",
              password: "securepassword123"
            }, null, 2)
          },
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              success: true,
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              user: {
                id: "60d21b4667d0d8992e610c85",
                name: "John Doe",
                email: "john@example.com"
              }
            }, null, 2)
          }
        },
        {
          id: "auth-login",
          method: "POST",
          path: "/api/auth/login",
          description: "Log in to an existing account",
          authentication: false,
          requestBody: {
            type: "application/json",
            example: JSON.stringify({
              email: "john@example.com",
              password: "securepassword123"
            }, null, 2)
          },
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              success: true,
              token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
              user: {
                id: "60d21b4667d0d8992e610c85",
                name: "John Doe",
                email: "john@example.com"
              }
            }, null, 2)
          }
        }
      ]
    },
    {
      id: "risk",
      name: "Risk Analysis",
      description: "Endpoints for analyzing risks in crypto and traditional finance",
      endpoints: [
        {
          id: "risk-wallet",
          method: "GET",
          path: "/api/risk/wallet/:address",
          description: "Get risk profile for a specific wallet address",
          authentication: true,
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              address: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
              riskScore: 85,
              riskLevel: "medium",
              factors: [
                { name: "Age of wallet", score: 90, impact: "positive" },
                { name: "Interaction with risky contracts", score: 60, impact: "negative" }
              ],
              recommendations: [
                "Avoid interacting with unverified smart contracts",
                "Enable multi-signature for large transactions"
              ]
            }, null, 2)
          }
        },
        {
          id: "risk-token",
          method: "GET",
          path: "/api/risk/token/:symbol",
          description: "Get volatility analysis for a specific token",
          authentication: true,
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              symbol: "ETH",
              volatility: {
                daily: 0.028,
                weekly: 0.072,
                monthly: 0.145
              },
              metrics: {
                sharpeRatio: 1.2,
                maxDrawdown: 0.35,
                beta: 1.5
              },
              trend: "upward",
              recommendation: "moderate exposure"
            }, null, 2)
          }
        },
        {
          id: "risk-var",
          method: "POST",
          path: "/api/risk/var",
          description: "Calculate Value at Risk (VaR) for a portfolio",
          authentication: true,
          requestBody: {
            type: "application/json",
            example: JSON.stringify({
              holdings: [
                { symbol: "BTC", amount: 0.5 },
                { symbol: "ETH", amount: 5 }
              ],
              confidenceLevel: 0.95
            }, null, 2)
          },
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              portfolioValue: 25000,
              valueAtRisk: 2125,
              confidenceLevel: 0.95,
              horizon: "1 day",
              breakdown: [
                { symbol: "BTC", var: 1500 },
                { symbol: "ETH", var: 625 }
              ]
            }, null, 2)
          }
        }
      ]
    },
    {
      id: "banking",
      name: "Banking Integration",
      description: "Endpoints for connecting and managing traditional banking accounts",
      endpoints: [
        {
          id: "banking-connect",
          method: "POST",
          path: "/api/banking/connect",
          description: "Connect to a banking provider",
          authentication: true,
          requestBody: {
            type: "application/json",
            example: JSON.stringify({
              provider: "fynapse",
              credentials: {
                username: "user123",
                password: "pass123"
              }
            }, null, 2)
          },
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              success: true,
              message: "Successfully connected to banking provider",
              connectionId: "conn_12345"
            }, null, 2)
          }
        },
        {
          id: "banking-accounts",
          method: "GET",
          path: "/api/banking/accounts",
          description: "Get all connected bank accounts",
          authentication: true,
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              accounts: [
                {
                  id: "acc_12345",
                  provider: "fynapse",
                  type: "checking",
                  name: "Primary Checking",
                  balance: 2500.75,
                  currency: "USD",
                  accountNumber: "****1234",
                  lastUpdated: "2023-05-15T10:30:00Z"
                },
                {
                  id: "acc_67890",
                  provider: "fynapse",
                  type: "savings",
                  name: "Emergency Fund",
                  balance: 10000.50,
                  currency: "USD",
                  accountNumber: "****5678",
                  lastUpdated: "2023-05-15T10:30:00Z"
                }
              ],
              summary: {
                totalAccounts: 2,
                totalBalance: 12501.25,
                currency: "USD"
              }
            }, null, 2)
          }
        },
        {
          id: "banking-transactions",
          method: "GET",
          path: "/api/banking/accounts/:accountId/transactions",
          description: "Get transactions for a specific account",
          authentication: true,
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              accountId: "acc_12345",
              transactions: [
                {
                  id: "tx_12345",
                  date: "2023-05-14T15:30:00Z",
                  description: "Grocery Store",
                  amount: 75.25,
                  type: "debit",
                  category: "groceries",
                  balance: 2500.75
                },
                {
                  id: "tx_67890",
                  date: "2023-05-12T10:15:00Z",
                  description: "Payroll Deposit",
                  amount: 2000.00,
                  type: "credit",
                  category: "income",
                  balance: 2576.00
                }
              ]
            }, null, 2)
          }
        }
      ]
    },
    {
      id: "privacy",
      name: "Privacy & ZK-Proofs",
      description: "Endpoints for privacy-preserving data sharing using Zero-Knowledge Proofs",
      endpoints: [
        {
          id: "privacy-generate",
          method: "POST",
          path: "/api/privacy/generate-proof",
          description: "Generate a Zero-Knowledge Proof",
          authentication: true,
          requestBody: {
            type: "application/json",
            example: JSON.stringify({
              statement: {
                type: "creditScore",
                condition: "greaterThan",
                threshold: 700
              }
            }, null, 2)
          },
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              success: true,
              proofId: "proof_12345",
              statement: {
                type: "creditScore",
                condition: "greaterThan",
                threshold: 700
              },
              createdAt: "2023-05-15T10:30:00Z",
              expiresAt: "2023-06-15T10:30:00Z",
              shareableLink: "https://aries.finance/verify/proof_12345"
            }, null, 2)
          }
        },
        {
          id: "privacy-verify",
          method: "GET",
          path: "/api/privacy/verify-proof/:proofId",
          description: "Verify a Zero-Knowledge Proof",
          authentication: false,
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              success: true,
              verified: true,
              statement: {
                type: "creditScore",
                condition: "greaterThan",
                threshold: 700
              },
              verifiedAt: "2023-05-15T11:30:00Z",
              expiresAt: "2023-06-15T10:30:00Z"
            }, null, 2)
          }
        },
        {
          id: "privacy-proofs",
          method: "GET",
          path: "/api/privacy/proofs",
          description: "Get all proofs for a user",
          authentication: true,
          responseBody: {
            type: "application/json",
            example: JSON.stringify({
              success: true,
              proofs: [
                {
                  id: "proof_12345",
                  statement: {
                    type: "creditScore",
                    condition: "greaterThan",
                    threshold: 700
                  },
                  createdAt: "2023-05-15T10:30:00Z",
                  expiresAt: "2023-06-15T10:30:00Z",
                  shareableLink: "https://aries.finance/verify/proof_12345"
                }
              ]
            }, null, 2)
          }
        }
      ]
    }
  ];

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleEndpoint = (endpointId: string) => {
    setExpandedEndpoints(prev => 
      prev.includes(endpointId)
        ? prev.filter(id => id !== endpointId)
        : [...prev, endpointId]
    );
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    
    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedCode(null);
    }, 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case "GET":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "POST":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PUT":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "DELETE":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      {/* Header/Navigation Bar */}
      <NavHeader 
        title="API Documentation" 
        subtitle="Explore and integrate with the Aries DeFi API" 
      />

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">API Documentation</h1>
          <p className="text-gray-400">Comprehensive guide to the Aries Finance API endpoints</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold mb-4">API Categories</h2>
              
              <div className="space-y-2">
                {apiCategories.map(category => (
                  <a 
                    key={category.id}
                    href={`#${category.id}`}
                    className="block px-3 py-2 rounded-lg hover:bg-black/20 transition-colors"
                  >
                    {category.name}
                  </a>
                ))}
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="bg-aries-purple/10 border border-aries-purple/30 rounded-lg p-4">
                  <h3 className="font-medium mb-2 text-aries-purple">Authentication</h3>
                  <p className="text-sm text-gray-300 mb-3">
                    Most API endpoints require authentication using a JWT token.
                  </p>
                  <p className="text-sm text-gray-300">
                    Include the token in the <code className="bg-black/30 px-1 py-0.5 rounded">x-auth-token</code> header of your requests.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="space-y-8">
              {apiCategories.map(category => (
                <div 
                  key={category.id}
                  id={category.id}
                  className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6"
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleCategory(category.id)}
                  >
                    <h2 className="text-xl font-bold">{category.name}</h2>
                    <div className="p-1 rounded-full hover:bg-black/20">
                      {expandedCategories.includes(category.id) ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </div>
                  </div>
                  
                  <p className="text-gray-400 mt-2">{category.description}</p>
                  
                  {expandedCategories.includes(category.id) && (
                    <div className="mt-6 space-y-6">
                      {category.endpoints.map(endpoint => (
                        <div 
                          key={endpoint.id}
                          className="border border-white/5 rounded-lg overflow-hidden"
                        >
                          <div 
                            className="flex items-center justify-between p-4 bg-black/20 cursor-pointer"
                            onClick={() => toggleEndpoint(endpoint.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`px-2 py-1 rounded text-xs font-medium border ${getMethodColor(endpoint.method)}`}>
                                {endpoint.method}
                              </div>
                              <div className="font-mono text-sm">{endpoint.path}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              {endpoint.authentication && (
                                <div className="text-xs bg-aries-purple/20 text-aries-purple px-2 py-1 rounded">
                                  Auth Required
                                </div>
                              )}
                              <div className="p-1 rounded-full hover:bg-black/30">
                                {expandedEndpoints.includes(endpoint.id) ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {expandedEndpoints.includes(endpoint.id) && (
                            <div className="p-4 border-t border-white/5 bg-black/10">
                              <p className="text-gray-300 mb-4">{endpoint.description}</p>
                              
                              {endpoint.requestBody && (
                                <div className="mb-6">
                                  <h4 className="text-sm font-medium text-gray-400 mb-2">Request Body ({endpoint.requestBody.type})</h4>
                                  <div className="relative">
                                    <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm">
                                      <code className="text-gray-300">{endpoint.requestBody.example}</code>
                                    </pre>
                                    <button
                                      onClick={() => copyToClipboard(endpoint.requestBody.example, `req-${endpoint.id}`)}
                                      className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 hover:bg-black/70 transition-colors"
                                    >
                                      {copiedCode === `req-${endpoint.id}` ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                              
                              {endpoint.responseBody && (
                                <div>
                                  <h4 className="text-sm font-medium text-gray-400 mb-2">Response Body ({endpoint.responseBody.type})</h4>
                                  <div className="relative">
                                    <pre className="bg-black/30 p-4 rounded-lg overflow-x-auto text-sm">
                                      <code className="text-gray-300">{endpoint.responseBody.example}</code>
                                    </pre>
                                    <button
                                      onClick={() => copyToClipboard(endpoint.responseBody.example, `res-${endpoint.id}`)}
                                      className="absolute top-2 right-2 p-1.5 rounded-md bg-black/50 hover:bg-black/70 transition-colors"
                                    >
                                      {copiedCode === `res-${endpoint.id}` ? (
                                        <Check className="w-4 h-4 text-green-500" />
                                      ) : (
                                        <Copy className="w-4 h-4 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-8 bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Need Help?</h2>
              <p className="text-gray-300 mb-4">
                If you need further assistance with our API, please check out these resources:
              </p>
              <div className="space-y-3">
                <a 
                  href="#" 
                  className="flex items-center gap-2 text-aries-blue hover:underline"
                >
                  <Code className="w-4 h-4" />
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a 
                  href="#" 
                  className="flex items-center gap-2 text-aries-blue hover:underline"
                >
                  <Code className="w-4 h-4" />
                  <span>Developer Forum</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ApiDocs;
