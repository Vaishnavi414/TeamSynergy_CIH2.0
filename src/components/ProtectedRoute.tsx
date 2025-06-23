
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const [initialized, setInitialized] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  
  useEffect(() => {
    // Wait for auth to be initialized and not in loading state
    if (!loading) {
      setInitialized(true);
      
      // Add a small delay before checking authentication status
      // This gives time for the auth state to fully update
      const timer = setTimeout(() => {
        setSessionChecked(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [loading]);
  
  // Don't render anything until authentication is initialized
  if (!initialized || !sessionChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black to-gray-900">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-aries-purple/30 border-t-aries-purple animate-spin"></div>
          <p className="text-white/70">Loading your session...</p>
        </div>
      </div>
    );
  }
  
  console.log("Auth state:", { isAuthenticated, loading, initialized, sessionChecked });
  
  // If user isn't authenticated, redirect to login
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
