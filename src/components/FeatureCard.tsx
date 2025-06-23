
import React from "react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode | React.ElementType;
  className?: string;
}

const FeatureCard = ({ title, description, icon, className }: FeatureCardProps) => {
  return (
    <div className={cn("feature-card relative", className)}>
      <div className="mb-4 text-aries-purple">
        {React.isValidElement(icon) ? (
          icon
        ) : (
          // If it's a component type, render it
          React.createElement(icon as React.ElementType, { size: 32 })
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
};

export default FeatureCard;
