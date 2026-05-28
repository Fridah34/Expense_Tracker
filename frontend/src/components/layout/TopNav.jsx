import { useState } from 'react';
import { Menu, LogOut, User, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

const TopNav = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  const handleProfileClick = () => {
    setShowUserMenu(false);
    navigate('/profile');
  };

  const handleLogoutClick = () => {
    setShowUserMenu(false);
    logout();
  };

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left section - Menu button + Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={onMenuClick}
              className="p-2 -ml-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden transition-colors"
            >
              <Menu size={20} />
            </button>
            
            {/* Brand - visible only on mobile when sidebar is hidden */}
            <div className="flex items-center gap-2 lg:hidden">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-sm">
                <span className="text-white text-sm font-bold">E</span>
              </div>
              <span className="font-semibold text-gray-900 text-base">
                ExpenseTracker
              </span>
            </div>
          </div>

          {/* Right section - User menu */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-medium text-gray-700">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-400">
                    {user?.email}
                  </p>
                </div>
                <ChevronDown size={14} className="hidden sm:block text-gray-400" />
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-100 overflow-hidden z-50 animate-slide-down">
                    <div className="p-3 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {user?.email}
                      </p>
                    </div>
                    
                    <div className="p-1">
                      <button
                        onClick={handleProfileClick}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
                      >
                        <User size={14} />
                        <span>Profile</span>
                      </button>
                    </div>
                    
                    <div className="border-t border-gray-100 p-1">
                      <button
                        onClick={handleLogoutClick}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      >
                        <LogOut size={14} />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-slide-down {
          animation: slide-down 0.15s ease-out;
        }
      `}</style>
    </nav>
  );
};

export default TopNav;