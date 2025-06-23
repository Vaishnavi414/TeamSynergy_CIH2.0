import { Link } from "react-router-dom";
import { AlertTriangle, CheckCircle, Award, ArrowRight, Shield, FileCode } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import GlowingButton from "@/components/GlowingButton";

const FeatureCard = ({ 
  title, 
  description, 
  icon, 
  linkTo, 
  gradient = "from-aries-purple to-aries-blue"
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
  gradient?: string;
}) => {
  return (
    <Link 
      to={linkTo}
      className="block group"
    >
      <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 h-full transition-all duration-300 hover:border-white/30 hover:shadow-lg hover:shadow-aries-purple/10">
        <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${gradient} flex items-center justify-center mb-4`}>
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 mb-4">{description}</p>
        <div className="flex items-center text-aries-purple group-hover:text-aries-blue transition-colors">
          <span className="mr-2">Learn more</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};

const RecentActivityCard = ({ 
  title, 
  date, 
  address,
  result,
  type
}: {
  title: string;
  date: string;
  address: string;
  result: string;
  type: 'vulnerability' | 'compliance' | 'nft';
}) => {
  const getIcon = () => {
    switch (type) {
      case 'vulnerability':
        return <AlertTriangle className="w-4 h-4" />;
      case 'compliance':
        return <Shield className="w-4 h-4" />;
      case 'nft':
        return <Award className="w-4 h-4" />;
    }
  };
  
  const getResultColor = () => {
    if (result.toLowerCase().includes('high')) return 'text-red-500';
    if (result.toLowerCase().includes('medium') || result.toLowerCase().includes('moderate')) return 'text-yellow-500';
    if (result.toLowerCase().includes('low')) return 'text-green-500';
    return 'text-blue-500';
  };
  
  return (
    <div className="bg-black/20 border border-white/10 rounded-lg p-4 hover:bg-black/30 transition-colors">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="font-medium mb-1">{title}</h4>
          <div className="text-xs text-gray-500 mb-2">{date}</div>
          <div className="text-xs font-mono text-gray-400 truncate max-w-[200px]">{address}</div>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 ${getResultColor()}`}>
          {getIcon()}
          <span>{result}</span>
        </div>
      </div>
    </div>
  );
};

const Contracts = () => {
  const { user } = useUser();
  
  // Mock recent activity data
  const recentActivity = [
    {
      id: 1,
      title: "USDT Contract Scan",
      date: "2 hours ago",
      address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
      result: "Low Risk",
      type: 'vulnerability' as const
    },
    {
      id: 2,
      title: "BAYC Compliance Check",
      date: "Yesterday",
      address: "0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D",
      result: "High Compliance",
      type: 'compliance' as const
    },
    {
      id: 3,
      title: "Credit Score NFT",
      date: "3 days ago",
      address: "0x8915BEab6cCaA2F486d8B1C36c7ec151F9C72F5E",
      result: "Score: 820",
      type: 'nft' as const
    },
    {
      id: 4,
      title: "Uniswap V3 Scan",
      date: "1 week ago",
      address: "0x1F98431c8aD98523631AE4a59f267346ea31F984",
      result: "Medium Risk",
      type: 'vulnerability' as const
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 gradient-text">Smart Contract Analysis</h1>
          <p className="text-gray-400">Analyze, verify, and secure your blockchain contracts</p>
        </div>
        
        {/* Main Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <FeatureCard
            title="Vulnerability Scanner"
            description="Scan smart contracts for security vulnerabilities and potential exploits"
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            linkTo="/contract-scanner"
            gradient="from-red-500 to-orange-500"
          />
          
          <FeatureCard
            title="Compliance Checker"
            description="Verify contract compliance with standards like ERC20, ERC721, and regulations"
            icon={<Shield className="w-6 h-6 text-white" />}
            linkTo="/compliance-checker"
            gradient="from-blue-500 to-cyan-500"
          />
          
          <FeatureCard
            title="Credit Score NFT"
            description="Mint NFTs representing credit scores for secure sharing and verification"
            icon={<Award className="w-6 h-6 text-white" />}
            linkTo="/credit-score-nft"
            gradient="from-green-500 to-emerald-500"
          />
        </div>
        
        {/* Dashboard Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Recent Activity</h2>
                <Link to="/activity" className="text-sm text-aries-purple hover:text-aries-blue transition-colors flex items-center gap-1">
                  <span>View all</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recentActivity.map(activity => (
                  <RecentActivityCard
                    key={activity.id}
                    title={activity.title}
                    date={activity.date}
                    address={activity.address}
                    result={activity.result}
                    type={activity.type}
                  />
                ))}
              </div>
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-black/30 backdrop-blur-sm border border-white/10 rounded-lg p-6 h-full">
              <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
              
              <div className="space-y-4">
                <Link to="/contract-scanner" className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-black/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="font-medium">Scan a Contract</div>
                    <div className="text-xs text-gray-400">Check for vulnerabilities</div>
                  </div>
                </Link>
                
                <Link to="/compliance-checker" className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-black/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <div className="font-medium">Verify Compliance</div>
                    <div className="text-xs text-gray-400">Check standard conformity</div>
                  </div>
                </Link>
                
                <Link to="/credit-score-nft" className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-black/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Award className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <div className="font-medium">Mint Credit NFT</div>
                    <div className="text-xs text-gray-400">Tokenize your credit score</div>
                  </div>
                </Link>
                
                <Link to="/contracts/import" className="flex items-center gap-3 p-3 rounded-lg bg-black/20 border border-white/10 hover:bg-black/40 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                    <FileCode className="w-5 h-5 text-purple-500" />
                  </div>
                  <div>
                    <div className="font-medium">Import Contract</div>
                    <div className="text-xs text-gray-400">Upload contract code</div>
                  </div>
                </Link>
              </div>
              
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="text-sm font-medium mb-2">Need Help?</div>
                <p className="text-xs text-gray-400 mb-4">
                  Learn more about our smart contract analysis tools and how they can help secure your blockchain assets.
                </p>
                <GlowingButton className="w-full">
                  View Documentation
                </GlowingButton>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Contracts;
