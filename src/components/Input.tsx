import React, { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  error?: string;
  className?: string;
  containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon, error, className, containerClassName, ...props }, ref) => {
    return (
      <div className={cn("relative", containerClassName)}>
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {icon}
          </div>
        )}
        <input
          className={cn(
            "bg-black/30 border border-white/10 text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-aries-purple/50 transition-all",
            icon ? "pl-10 pr-4 py-3" : "px-4 py-3",
            error && "border-red-500 focus:ring-red-500/50",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
