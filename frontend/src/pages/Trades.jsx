import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download, Plus, Inbox, Trash2 } from 'lucide-react';
import useTradeStore from '../store/useTradeStore';
import { useEffect } from 'react';
import AddTradeModal from '../components/trades/AddTradeModal';

const Trades = () => {
  const { trades, fetchTrades, isLoading } = useTradeStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            <input
              type="text"
              placeholder="Search pairs, tickets..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-yellow-500/50"
            />
          </div>
          <button className="btn-glass flex items-center gap-2 py-2 px-4">
            <Filter size={18} />
            <span>Filters</span>
          </button>
        </div>

        <div className="flex gap-3 w-full md:w-auto">
          <button className="btn-glass flex items-center gap-2 py-2 px-4">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button className="btn-gold flex items-center gap-2 py-2 px-4" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            <span>Add Trade</span>
          </button>
        </div>
      </div>
      <AddTradeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <div className="glass-card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center p-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div></div>
        ) : trades.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
            <div className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-6">
              <Inbox size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No Trades Logged Yet</h3>
            <p className="text-gray-400 max-w-sm mb-8">
              Your trading journal is empty. Start tracking your positions to unlock powerful AI performance analytics.
            </p>
            <button className="btn-gold flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} /> Add Your First Trade
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-white/5 text-gray-400 text-sm border-b border-white/10">
                    <th className="px-6 py-4 font-medium">Ticket</th>
                    <th className="px-6 py-4 font-medium">Date</th>
                    <th className="px-6 py-4 font-medium">Pair</th>
                    <th className="px-6 py-4 font-medium">Type</th>
                    <th className="px-6 py-4 font-medium">Strategy</th>
                    <th className="px-6 py-4 font-medium">Entry/Exit</th>
                    <th className="px-6 py-4 font-medium">R:R</th>
                    <th className="px-6 py-4 font-medium">Result</th>
                    <th className="px-6 py-4 font-medium text-right">P&L</th>
                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trades.map((trade) => (
                    <tr key={trade._id} className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer">
                      <td className="px-6 py-4 text-gray-400 text-sm uppercase">{trade._id.slice(-6)}</td>
                      <td className="px-6 py-4 text-gray-300 text-sm">{new Date(trade.date).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-semibold text-white">{trade.symbol}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'Long' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs bg-white/5 border border-white/10 px-2 py-1 rounded text-gray-300">
                          Price Action
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="flex flex-col">
                          <span className="text-gray-300">{trade.entry}</span>
                          <span className="text-gray-500">{trade.exit || '-'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300 text-sm">-</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${trade.isWinner ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {trade.isWinner ? 'Win' : 'Loss'}
                        </span>
                      </td>
                      <td className={`px-6 py-4 font-bold text-right ${trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${trade.pnl}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if(window.confirm('Are you sure you want to delete this trade?')) {
                              useTradeStore.getState().deleteTrade(trade._id);
                            }
                          }}
                          className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-white/5 flex items-center justify-between text-sm text-gray-400">
              <span>Showing 1 to {trades.length} of {trades.length} entries</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/5 disabled:opacity-50" disabled>Prev</button>
                <button className="px-3 py-1 border border-white/10 rounded hover:bg-white/5 disabled:opacity-50" disabled>Next</button>
              </div>
            </div>
          </  >
        )}
      </div>
    </motion.div>
  );
};

export default Trades;
