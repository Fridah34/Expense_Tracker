import { Link, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const links = [
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/expenses', label: 'Expenses' },
    { to: '/categories', label: 'Categories' },
    { to: '/profile', label: 'Profile' },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">E</span>
            </div>
            <span className="font-semibold text-gray-900">ExpenseTracker</span>
          </Link>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors
                  ${location.pathname === link.to
                    ? 'bg-violet-50 text-violet-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User + Logout */}
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-600 hidden md:block">
              {user?.firstName} {user?.lastName}
            </span>
            <Button variant="secondary" size="sm" onClick={logout}>
              Logout
            </Button>
          </div>

        </div>
      </div>
    </nav>
  );
};

export default Navbar;