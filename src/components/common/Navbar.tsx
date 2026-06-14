import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Plus, User, Menu, X, Building2, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const navLinks = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/properties', label: 'Properties', icon: Search },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
<nav data-role="navbar" className="fixed top-0 left-0 right-0 z-50 bg-cream-50/95 backdrop-blur-md border-b border-walnut-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 lg:h-20">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-teak-600 to-walnut-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-all duration-300">
              <Building2 className="w-6 h-6 text-cream-50" />
            </div>
            <span className="text-xl lg:text-2xl font-serif font-semibold text-walnut-800">
              Estate<span className="text-teak-600">Vista</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                  isActive(link.path)
                    ? 'text-teak-700'
                    : 'text-walnut-600 hover:text-teak-600'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
                {isActive(link.path) && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teak-600 rounded-full" />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">

            {user ? (
              <>
                {user.role === 'user' ? (
                  <Link
                    to="/user-dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-walnut-600 hover:text-teak-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-walnut-600 hover:text-teak-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>
                )}

                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (

              <>
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-walnut-600 hover:text-teak-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 text-sm font-semibold text-cream-50 bg-gradient-to-r from-teak-600 to-walnut-700 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg text-walnut-600 hover:bg-walnut-100 transition-colors"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 space-y-3 animate-fadeIn">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-teak-50 text-teak-700'
                    : 'text-walnut-600 hover:bg-walnut-50'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
            ))}
            <div className="pt-3 border-t border-walnut-100 space-y-3">
              {user?.role === 'realtor' && (
                <Link
                  to="/add-property"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-walnut-600 hover:bg-walnut-50"
                >
                  <Plus className="w-5 h-5" />
                  List Property
                </Link>
              )}

              <Link
                to="/login"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-walnut-600 hover:bg-walnut-50"
              >
                <User className="w-5 h-5" />
                Login
              </Link>

              {user ? (
                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-5 h-5" />
                  Logout
                </button>
              ) : (
                <Link
                  to="/signup"
                  onClick={() => setIsMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 rounded-xl text-cream-50 bg-gradient-to-r from-teak-600 to-walnut-700 font-semibold"
                >
                  Sign Up
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
