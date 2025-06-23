import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface DashboardCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  linkTo: string;
  highlight?: boolean;
  isExternalLink?: boolean;
}

const DashboardCard = ({ title, description, icon: Icon, linkTo, highlight = false, isExternalLink = false }: DashboardCardProps) => {
  const CardContent = (
    <div className={`${highlight ? 'bg-gradient-to-br from-aries-purple/20 to-aries-blue/20' : 'bg-black/30'} backdrop-blur-sm border ${highlight ? 'border-aries-purple/30 shadow-lg shadow-aries-purple/10' : 'border-white/10'} rounded-xl p-6 hover:border-aries-purple/40 transition-all hover:shadow-lg hover:shadow-aries-purple/5 hover:-translate-y-1`}>
      <div className="mb-4 text-aries-purple">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-4">{description}</p>
      <div className="flex items-center text-aries-purple text-sm font-medium">
        <span>Explore</span>
        <ArrowRight className="w-4 h-4 ml-1" />
      </div>
    </div>
  );
  
  return isExternalLink ? (
    <a href={linkTo} className="block" target="_blank" rel="noopener noreferrer">
      {CardContent}
    </a>
  ) : (
    <Link to={linkTo} className="block">
      {CardContent}
    </Link>
  );
};

export default DashboardCard;
