import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  LineChart,
  BookOpen,
  PieChart,
  Globe,
  BrainCircuit,
  MessageSquare,
  FileText,
  Camera,
  Search,
  ShieldAlert,
  Newspaper,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Users,
  Trophy,
  History,
  Link2,
} from 'lucide-react';


import { X } from 'lucide-react';

const Sidebar = ({ onClose }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState({ name: 'Trader', email: 'trader@example.com' });
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    localStorage.removeItem('userInfo');
    navigate('/login');
  };

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      // Ensure we have a name property to avoid crashes
      if (!parsed.name) {
        parsed.name = `${parsed.firstName || ''} ${parsed.lastName || ''}`.trim() || 'Trader';
      }
      setUser(parsed);
    }
  }, []);

  const mainNavLinks = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Trades', path: '/trades', icon: <LineChart size={20} /> },
    { name: 'Journal', path: '/journal', icon: <BookOpen size={20} /> },
    { name: 'Analysis', path: '/analysis', icon: <PieChart size={20} /> },
    { name: 'Market', path: '/market', icon: <Globe size={20} /> },
    { name: 'Backtesting', path: '/backtesting', icon: <History size={20} /> },
  ];

  const communityLinks = [
    { name: 'Traders Lounge', path: '/community', icon: <Users size={20} /> },
    { name: 'Leaderboard', path: '/leaderboard', icon: <Trophy size={20} /> },
  ];

  const aiFeaturesLinks = [
    { name: 'Emotion Detector', path: '/ai/emotion-detector', icon: <BrainCircuit size={20} /> },
    { name: 'Trade Coach', path: '/ai/trade-coach', icon: <MessageSquare size={20} /> },
    { name: 'Weekly Report', path: '/ai/weekly-report', icon: <FileText size={20} /> },
    { name: 'Screenshot Analyzer', path: '/ai/screenshot-analyzer', icon: <Camera size={20} /> },
    { name: 'Chat With Data', path: '/ai/chat-with-data', icon: <MessageSquare size={20} /> },
    { name: 'Pattern Finder', path: '/ai/pattern-finder', icon: <Search size={20} /> },
    { name: 'Risk Advisor', path: '/ai/risk-advisor', icon: <ShieldAlert size={20} /> },
    { name: 'News Correlation', path: '/ai/news-correlation', icon: <Newspaper size={20} /> },
  ];

  const NavItem = ({ item }) => (
    <NavLink
      to={item.path}
      onClick={onClose}
      className={({ isActive }) =>
        `flex items-center px-4 py-3 mb-2 rounded-xl transition-all duration-300 group ${
          isActive
            ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30 shadow-[0_0_10px_rgba(234,179,8,0.1)]'
            : 'text-gray-400 hover:bg-white/5 hover:text-white'
        }`
      }
    >
      <span className="flex-shrink-0">{item.icon}</span>
      {!isCollapsed && (
        <motion.span
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="ml-3 font-medium whitespace-nowrap"
        >
          {item.name}
        </motion.span>
      )}
    </NavLink>
  );

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
      className="h-screen bg-gray-950/80 backdrop-blur-xl border-r border-white/5 flex flex-col relative"
    >
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="hidden lg:block absolute -right-3 top-8 bg-gray-900 border border-white/10 text-gray-400 hover:text-white rounded-full p-1 z-10 transition-colors"
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center flex-shrink-0 shadow-[0_0_15px_rgba(234,179,8,0.3)]">
            <span className="text-black font-bold text-xl">E</span>
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col"
            >
              <span className="font-bold text-lg tracking-wide gold-text">EmoTrade</span>
              <span className="text-xs text-gray-500 font-medium">Log System</span>
            </motion.div>
          )}
        </div>
        
        {/* Mobile Close Button */}
        <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-6 px-4 scrollbar-hide">
        <div className="mb-8">
          {!isCollapsed && <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Main Menu</p>}
          {mainNavLinks.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        <div>
          {!isCollapsed && <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">AI Features</p>}
          {aiFeaturesLinks.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>

        <div className="mt-4">
          {!isCollapsed && <p className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Community</p>}
          {communityLinks.map((item) => (
            <NavItem key={item.name} item={item} />
          ))}
        </div>
      </div>

      {/* Bottom Area */}
      <div className="p-4 border-t border-white/5">
        <NavLink
          to="/integrations"
          className="flex items-center px-4 py-3 mb-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300"
        >
          <Link2 size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 font-medium">Integrations</span>}
        </NavLink>
        <NavLink
          to="/settings"
          className="flex items-center px-4 py-3 mb-2 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white transition-all duration-300"
        >
          <Settings size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 font-medium">Settings</span>}
        </NavLink>
        <button 
          onClick={handleLogout} 
          className="w-full flex items-center px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all duration-300"
        >
          <LogOut size={20} className="flex-shrink-0" />
          {!isCollapsed && <span className="ml-3 font-medium">Logout</span>}
        </button>

        {/* User Profile Mini */}
        {!isCollapsed && (
          <div className="mt-4 flex items-center px-2 py-3 bg-white/5 rounded-xl border border-white/5">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center border border-white/10 flex-shrink-0">
              <span className="font-bold text-sm text-white">{user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
            </div>
            <div className="ml-3 overflow-hidden">
              <h3 className="font-bold text-white text-sm whitespace-nowrap">{user.name}</h3>
              <p className="text-xs text-gray-500 whitespace-nowrap">{user.email}</p>
            </div>
          </div>
        )}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
