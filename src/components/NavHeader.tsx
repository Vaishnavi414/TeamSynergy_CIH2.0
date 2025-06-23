import { useUser, useClerk } from "@clerk/clerk-react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, Settings } from "lucide-react";
import GlowingButton from "./GlowingButton";

type NavHeaderProps = {
  showBackButton?: boolean;
  backPath?: string;
  backText?: string;
  title?: string;
  subtitle?: string;
  showUserInfo?: boolean;
  showLogout?: boolean;
};

const NavHeader = ({
  showBackButton = true,
  backPath = "/dashboard",
  backText = "Back to Dashboard",
  title,
  subtitle,
  showUserInfo = true,
  showLogout = true,
}: NavHeaderProps) => {
  const { user } = useUser();
  const { signOut } = useClerk();

  return (
    <nav className="py-4 px-6 lg:px-8 flex justify-between items-center bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        {!showBackButton && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-aries-purple to-aries-blue flex items-center justify-center">
              <span className="font-bold text-white">A</span>
            </div>
            <span className="font-bold text-xl">Aries</span>
          </div>
        )}
        {showBackButton && (
          <Link to={backPath} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>{backText}</span>
          </Link>
        )}
        {title && (
          <div className="ml-4 md:ml-8">
            <h1 className="text-xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex gap-4 items-center">
        {showUserInfo && (
          <>
            <div className="hidden md:flex items-center gap-4">
              <button className="p-2 rounded-full hover:bg-white/5 transition-colors relative">
                <Bell className="w-5 h-5 text-gray-400" />
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></span>
              </button>
              <button className="p-2 rounded-full hover:bg-white/5 transition-colors">
                <Settings className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="hidden md:block text-right">
              <p className="text-sm text-gray-400">Welcome back,</p>
              <p className="font-medium">{user?.fullName || user?.username}</p>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-aries-purple to-aries-blue flex items-center justify-center cursor-pointer">
              <span className="font-bold text-sm">{user?.fullName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase() || 'U'}</span>
            </div>
          </>
        )}
        {showLogout && (
          <GlowingButton variant="secondary" size="sm" onClick={() => signOut()}>Logout</GlowingButton>
        )}
      </div>
    </nav>
  );
};

export default NavHeader;
