import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Home, 
  BarChart2, 
  FileText, 
  Shield, 
  AlertTriangle, 
  Award, 
  TrendingUp, 
  PieChart, 
  Briefcase, 
  Menu, 
  X, 
  LogOut 
} from "lucide-react";
import { useUser } from "@clerk/clerk-react";

interface SidebarItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  isActive: boolean;
  onClick?: () => void;
}

const SidebarItem = ({ icon, text, to, isActive, onClick }: SidebarItemProps) => {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive
          ? "bg-aries-purple/20 text-white"
          : "text-gray-400 hover:bg-white/5 hover:text-white"
      }`}
      onClick={onClick}
    >
      {icon}
      <span>{text}</span>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { signOut } = useClerk();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const closeSidebar = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-black/50 text-white hover:bg-black/70 transition-colors"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-black/80 backdrop-blur-xl border-r border-white/10 z-40 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-white/10">
            <Link to="/dashboard" className="flex items-center gap-2" onClick={closeSidebar}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-aries-purple to-aries-blue flex items-center justify-center">
                <span className="font-bold text-white">A</span>
              </div>
              <span className="text-xl font-bold text-white">Aries</span>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
            <SidebarItem
              icon={<Home size={20} />}
              text="Dashboard"
              to="/dashboard"
              isActive={isActive("/dashboard")}
              onClick={closeSidebar}
            />
            
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Analysis
              </div>
            </div>
            
            <SidebarItem
              icon={<Shield size={20} />}
              text="Smart Contracts"
              to="/contracts"
              isActive={isActive("/contracts") || isActive("/contract-scanner") || isActive("/compliance-checker") || isActive("/credit-score-nft")}
              onClick={closeSidebar}
            />
            
            <SidebarItem
              icon={<AlertTriangle size={20} />}
              text="Vulnerability Scanner"
              to="/contract-scanner"
              isActive={isActive("/contract-scanner")}
              onClick={closeSidebar}
            />
            
            <SidebarItem
              icon={<FileText size={20} />}
              text="Compliance Checker"
              to="/compliance-checker"
              isActive={isActive("/compliance-checker")}
              onClick={closeSidebar}
            />
            
            <SidebarItem
              icon={<Award size={20} />}
              text="Credit Score NFT"
              to="/credit-score-nft"
              isActive={isActive("/credit-score-nft")}
              onClick={closeSidebar}
            />
            
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Market
              </div>
            </div>
            
            <SidebarItem
              icon={<TrendingUp size={20} />}
              text="Price Trends"
              to="/price-trends"
              isActive={isActive("/price-trends")}
              onClick={closeSidebar}
            />
            
            <SidebarItem
              icon={<PieChart size={20} />}
              text="Risk Visualization"
              to="/risk-visualization"
              isActive={isActive("/risk-visualization")}
              onClick={closeSidebar}
            />
            
            <SidebarItem
              icon={<BarChart2 size={20} />}
              text="Hybrid Risk"
              to="/hybrid-risk"
              isActive={isActive("/hybrid-risk")}
              onClick={closeSidebar}
            />
            
            <div className="pt-4 pb-2">
              <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Personal
              </div>
            </div>
            
            <SidebarItem
              icon={<Briefcase size={20} />}
              text="Portfolio"
              to="/portfolio"
              isActive={isActive("/portfolio")}
              onClick={closeSidebar}
            />
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-white/10">
            <button
              className="flex items-center gap-3 px-4 py-3 rounded-lg w-full text-gray-400 hover:bg-white/5 hover:text-white transition-colors"
              onClick={() => {
                logout();
                closeSidebar();
              }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
