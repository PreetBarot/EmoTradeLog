import { Bell, Search, Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useState } from 'react';
import AddTradeModal from '../trades/AddTradeModal';

const Navbar = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const location = useLocation();
  const pathName = location.pathname.split('/').filter(Boolean).pop() || 'dashboard';
  const title = pathName.charAt(0).toUpperCase() + pathName.slice(1).replace('-', ' ');

  return (
    <header className="h-16 md:h-20 flex items-center justify-between px-4 md:px-8 bg-gray-950/50 backdrop-blur-md border-b border-white/5 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="relative group hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-yellow-500 transition-colors" size={18} />
          <input
            type="text"
            placeholder="Search trades, notes..."
            className="w-64 bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500/50 focus:bg-white/10 transition-all duration-300"
          />
        </div>

        <button className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-yellow-500 rounded-full shadow-[0_0_8px_rgba(234,179,8,0.8)]"></span>
        </button>

        <div className="h-8 w-[1px] bg-white/10"></div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">Prop Firm Acc</p>
            <p className="text-xs text-green-400 font-medium">+$1,240.50 Today</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="btn-gold py-2 px-3 md:px-4 text-xs md:text-sm font-bold flex items-center gap-2 rounded-xl ml-2 md:ml-4"
          >
            <Plus size={16} /> <span className="hidden sm:inline">Log Trade</span>
          </button>
        </div>
      </div>
      <AddTradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </header>
  );
};

export default Navbar;
