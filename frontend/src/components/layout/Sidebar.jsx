import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Receipt,
  Tag,
  UserCircle,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/expenses', icon: Receipt, label: 'Expenses' },
  { to: '/categories', icon: Tag, label: 'Categories' },
  { to: '/profile', icon: UserCircle, label: 'Profile' },
];

const Sidebar = ({ collapsed, onToggle, isMobile, onMobileClose }) => {
  const { user, logout } = useAuth();

  const initials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    if (onMobileClose) onMobileClose();
  };

  return (
    <div className="relative h-full flex flex-col">
      {/* Brand - with proper spacing */}
      <div className={`h-16 flex items-center border-b border-white/10 shrink-0 ${collapsed ? 'justify-center' : 'px-5'}`}>
        {!collapsed ? (
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                E
              </div>
              <span className="text-white text-sm font-semibold whitespace-nowrap">
                ExpenseTracker
              </span>
            </div>
            <button
              onClick={onToggle}
              className="text-white/40 hover:text-white/60 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          </div>
        ) : (
          <div className="relative w-full flex justify-center">
            <div className="w-7 h-7 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              E
            </div>
          </div>
        )}
      </div>

      {/* Expand button when collapsed - inside sidebar, below brand */}
      {collapsed && !isMobile && (
        <div className="relative">
          <button
            onClick={onToggle}
            className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-gray-700 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-gray-600 transition-all z-10"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar">
        {NAV.map(({ to, icon: Icon, label }) => (
          <div key={to} className="relative group">
            <NavLink
              to={to}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-150 ${
                  collapsed ? 'justify-center' : ''
                } ${
                  isActive
                    ? 'bg-violet-600/20 text-violet-300 font-medium'
                    : 'text-white/50 hover:text-white/70 hover:bg-white/5'
                }`
              }
            >
              <Icon size={18} className="shrink-0" />
              {!collapsed && (
                <span className="text-sm whitespace-nowrap">{label}</span>
              )}
            </NavLink>
            
            {/* Tooltip on hover when collapsed */}
            {collapsed && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg pointer-events-none">
                {label}
                {/* Tooltip arrow */}
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div className="border-t border-white/10 p-3 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-white/30 text-[10px] truncate">
                {user?.email}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-white/30 hover:text-white/50 transition-colors shrink-0"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <div className="relative group">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                {initials}
              </div>
              <button
                onClick={handleLogout}
                className="text-white/30 hover:text-white/50 transition-colors"
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            </div>
            {/* Tooltip for user name when collapsed */}
            <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-lg pointer-events-none">
              {user?.firstName} {user?.lastName}
              <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;