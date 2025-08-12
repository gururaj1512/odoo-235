import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  LogOut, 
  Settings, 
  ChevronDown,
  Building2,
  Calendar,
  Users as UsersIcon,
  BarChart3,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { AppDispatch, RootState } from '@/redux/store';
import { logoutUser } from '@/redux/slices/authSlice';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getDashboardPath = () => {
    if (!user) return '/dashboard';
    switch (user.role) {
      case 'Owner':
        return '/dashboard';
      case 'Admin':
        return '/dashboard';
      default:
        return '/dashboard';
    }
  };

  const getNavigationItems = () => {
    if (!user) return [];

    switch (user.role) {
      case 'Owner':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
          { name: 'My Facilities', path: '/facilities', icon: Building2 },
          { name: 'Bookings', path: '/bookings', icon: Calendar },
          { name: 'Nearby Sports', path: '/nearby-sports', icon: MapPin },
        ];
      case 'Admin':
        return [
          { name: 'Dashboard', path: '/admin-dashboard', icon: BarChart3 },
          { name: 'Users', path: '/admin/users', icon: UsersIcon },
          { name: 'Nearby Sports', path: '/nearby-sports', icon: MapPin },
        ];
      default:
        return [
          { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
          { name: 'Facilities', path: '/facilities', icon: Building2 },
          { name: 'My Bookings', path: '/bookings', icon: Calendar },
          { name: 'Nearby Sports', path: '/nearby-sports', icon: MapPin },
        ];
    }
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to={isAuthenticated ? getDashboardPath() : '/'}
            className="flex items-center gap-2 text-qc-primary font-bold text-xl hover:text-qc-primary/80 transition-colors"
          >
            <Building2 className="w-8 h-8" />
            <span>QuickCourt</span>
          </Link>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-qc-primary text-white'
                        : 'text-gray-600 hover:text-qc-primary hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                );
              })}
              
              {/* External Sports Hub Button */}
              <motion.button
                onClick={() => window.open('https://sports-befe.vercel.app', '_blank')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink className="w-4 h-4" />
                Sports Hub
              </motion.button>
            </nav>
          )}

          {/* User Menu */}
          {isAuthenticated && user && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="w-8 h-8 bg-qc-primary text-white rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700">
                  {user.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                  showUserMenu ? 'rotate-180' : ''
                }`} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50"
                  >
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-qc-primary font-medium capitalize">{user.role}</p>
                    </div>
                    
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </Link>
                    
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Auth Buttons for non-authenticated users */}
          {!isAuthenticated && (
            <div className="flex items-center gap-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-qc-primary transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-qc-primary text-white rounded-lg hover:bg-qc-primary/90 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for mobile menu */}
      <AnimatePresence>
        {showUserMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 md:hidden"
            onClick={() => setShowUserMenu(false)}
          />
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
