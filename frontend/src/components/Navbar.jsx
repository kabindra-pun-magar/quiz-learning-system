import React, { memo, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { FiHome, FiGrid, FiBarChart2, FiAward, FiSettings, FiLogOut, FiMenu, FiX } from 'react-icons/fi';

const Navbar = memo(() => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };
  
  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };
  
  const navItems = [
    { path: '/', icon: FiHome, label: 'Dashboard' },
    { path: '/quiz', icon: FiGrid, label: 'Quiz' },
    { path: '/analytics', icon: FiBarChart2, label: 'Analytics' },
    { path: '/leaderboard', icon: FiAward, label: 'Leaderboard' },
    ...(user.role === 'admin' ? [{ path: '/admin', icon: FiSettings, label: 'Admin' }] : []),
  ];
  
  const isActive = (path) => location.pathname === path;
  
  return (
    <nav className="glass mx-4 mt-4 px-6 py-3 sticky top-4 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo */}
        <div 
          onClick={() => handleNavigation('/')} 
          className="flex items-center gap-2 group cursor-pointer"
        >
          <div className="text-3xl">📚</div>
          <span className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
            QuizMaster
          </span>
        </div>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 cursor-pointer ${
                  isActive(item.path)
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="text-lg" />
                <span>{item.label}</span>
              </button>
            );
          })}
          
          {/* User Profile */}
          <div className="ml-4 flex items-center gap-3 pl-4 border-l border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-white/90 hidden lg:inline">{user.name || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white transition-all duration-300 cursor-pointer"
            >
              <FiLogOut />
              <span className="hidden lg:inline">Logout</span>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-white text-2xl cursor-pointer"
        >
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-white/20">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => handleNavigation(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-2 transition-all cursor-pointer ${
                  isActive(item.path)
                    ? 'bg-white/20 text-white'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon />
                <span>{item.label}</span>
              </button>
            );
          })}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/20">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="text-white">{user.name || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 text-white cursor-pointer"
            >
              <FiLogOut />
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;