
import React from "react";
import { cn } from "@/lib/utils";

interface GlowingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
}

const GlowingButton = ({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: GlowingButtonProps) => {
  return (
    <button
      className={cn(
        "hero-button font-medium relative overflow-hidden flex items-center justify-center group transition-all",
        variant === "primary" 
          ? "bg-gradient-to-r from-aries-purple to-aries-blue text-white" 
          : "bg-white/10 text-white border border-white/20 hover:border-white/40",
        size === "sm" && "text-sm px-4 py-2 rounded",
        size === "md" && "px-6 py-3 rounded-md",
        size === "lg" && "text-lg px-8 py-4 rounded-lg",
        className
      )}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export default GlowingButton;
