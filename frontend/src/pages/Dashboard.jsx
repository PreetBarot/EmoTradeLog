import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, Target, Zap, Brain, Flame, DollarSign, TrendingUp, Inbox } from 'lucide-react';

import useTradeStore from '../store/useTradeStore';
import { useEffect, useMemo } from 'react';
import { calculateTradeStats } from '../utils/tradeStats';

const mockEquityData = [];

const mockOpenPositions = [];

const mockTopPerformers = [];

const mockHeatmap = [];

const StatCard = ({ title, value, subtext, icon, trend, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay }}
    className="glass-card p-6 relative overflow-hidden group"
  >
    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
      {icon}
    </div>
    <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
    <h3 className="text-3xl font-bold text-white mb-2">{value}</h3>
    <div className="flex items-center gap-2">
      <span className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
        {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
        {subtext}
      </span>
      <span className="text-gray-500 text-xs">vs last month</span>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { trades, fetchTrades } = useTradeStore();

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const stats = useMemo(() => calculateTradeStats(trades), [trades]);
  const recentTrades = trades.slice(0, 5);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Realized P&L" value={`$${stats.totalPnl.toFixed(2)}`} subtext="-" trend={stats.totalPnl >= 0 ? "up" : "down"} icon={<DollarSign size={48} />} delay={0.1} />
        <StatCard title="Unrealized P&L" value="$0.00" subtext="-" trend="up" icon={<TrendingUp size={48} />} delay={0.2} />
        <StatCard title="Win Rate" value={`${stats.winRate.toFixed(1)}%`} subtext="-" trend={stats.winRate >= 50 ? "up" : "down"} icon={<Target size={48} />} delay={0.3} />
        <StatCard title="Profit Factor" value={stats.profitFactor.toFixed(2)} subtext="-" trend={stats.profitFactor >= 1 ? "up" : "down"} icon={<Zap size={48} />} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Equity Curve */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Equity Growth</h3>
            <select className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-gray-300 focus:outline-none">
              <option>This Week</option>
              <option>This Month</option>
              <option>All Time</option>
            </select>
          </div>
          <div className="h-72 w-full">
            {mockEquityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockEquityData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#eab308' }}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#eab308" strokeWidth={3} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                <Activity size={32} className="mb-2 opacity-50" />
                <p className="text-sm">Not enough data to map equity growth.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* AI Insights & Open Positions */}
        <div className="flex flex-col gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-card p-6"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Brain className="text-yellow-500" size={20} />
              AI Insights
            </h3>
            <div className="flex flex-col items-center justify-center h-24 text-center">
              <p className="text-sm text-gray-500">Log more trades to unlock AI performance insights.</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="glass-card p-6 flex-1"
          >
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Activity className="text-blue-400" size={20} />
              Open Positions
            </h3>
            <div className="space-y-4">
              {mockOpenPositions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-gray-500 border border-dashed border-white/10 rounded-xl">
                  <p className="text-sm">No open positions.</p>
                </div>
              ) : (
                mockOpenPositions.map(pos => (
                  <div key={pos.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <span className="font-bold text-white block">{pos.pair}</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${pos.type === 'Long' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {pos.type}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold block ${pos.pnl.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>{pos.pnl}</span>
                      <span className="text-xs text-gray-500">{pos.entry} → {pos.current}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PnL Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="glass-card p-6 lg:col-span-2"
        >
          <h3 className="font-semibold text-lg mb-4">PnL Calendar Heatmap</h3>
          <div className="grid grid-cols-7 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
              <div key={d} className="text-center text-xs text-gray-500 font-medium mb-2">{d}</div>
            ))}
            {/* Empty slots for start of month offset */}
            <div className="p-2"></div>
            <div className="p-2"></div>
            
            {mockHeatmap.map(day => {
              let colorClass = 'bg-white/5 border-white/10';
              if (day.value > 1000) colorClass = 'bg-green-500 border-green-400';
              else if (day.value > 0) colorClass = 'bg-green-500/50 border-green-500/80';
              else if (day.value < -200) colorClass = 'bg-red-500 border-red-400';
              else if (day.value < 0) colorClass = 'bg-red-500/50 border-red-500/80';

              return (
                <div key={day.day} className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-1 relative group cursor-pointer ${colorClass} transition-all hover:scale-105`}>
                  <span className="text-xs font-bold opacity-50 group-hover:opacity-100">{day.day}</span>
                  <div className="absolute opacity-0 group-hover:opacity-100 bg-black/90 text-white text-xs p-2 rounded-lg -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none z-10 border border-white/10 transition-opacity">
                    ${day.value}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Top Performers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="glass-card p-6"
        >
          <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
            <Flame className="text-orange-500" size={20} />
            Top Performers
          </h3>
          <div className="space-y-4">
            {mockTopPerformers.length === 0 ? (
               <div className="flex flex-col items-center justify-center h-48 text-gray-500 border border-dashed border-white/10 rounded-xl">
                 <p className="text-sm">Log winning trades to populate.</p>
               </div>
            ) : (
              mockTopPerformers.map((perf, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold text-sm">
                      {i + 1}
                    </div>
                    <span className="font-bold text-white">{perf.pair}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-green-400 block">{perf.pnl}</span>
                    <span className="text-xs text-gray-400">WR: {perf.winRate}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Recent Trades Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.8 }}
        className="glass-card p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">Recent Trades</h3>
          <button className="text-sm text-yellow-500 hover:text-yellow-400 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          {recentTrades.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-xl mt-2">
              <Inbox size={32} className="mb-3 opacity-50 text-gray-500" />
              <p className="text-sm">No trades logged yet.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-gray-500 border-b border-white/5">
                  <th className="pb-3 font-medium text-sm">Pair</th>
                  <th className="pb-3 font-medium text-sm">Type</th>
                  <th className="pb-3 font-medium text-sm">Result</th>
                  <th className="pb-3 font-medium text-sm">P&L</th>
                  <th className="pb-3 font-medium text-sm">Emotion</th>
                  <th className="pb-3 font-medium text-sm">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentTrades.map((trade) => (
                  <tr key={trade._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                    <td className="py-4 font-semibold text-white">{trade.symbol}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${trade.type === 'Long' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${trade.isWinner ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {trade.isWinner ? 'Win' : 'Loss'}
                      </span>
                    </td>
                    <td className={`py-4 font-bold ${trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${trade.pnl}
                    </td>
                    <td className="py-4">
                      <span className="text-sm text-gray-300 bg-white/5 px-3 py-1 rounded-full border border-white/5">{trade.emotion || 'Neutral'}</span>
                    </td>
                    <td className="py-4 text-sm text-gray-500">{new Date(trade.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* News Ticker */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-950 border-t border-white/10 h-10 flex items-center overflow-hidden z-30 pointer-events-none">
        <div className="bg-yellow-500 text-black px-4 py-3 font-bold text-sm h-full flex items-center shrink-0 z-10 shadow-[5px_0_15px_rgba(0,0,0,0.5)]">
          Live News
        </div>
        <div className="flex-1 overflow-hidden relative">
          <motion.div 
            animate={{ x: ["100%", "-100%"] }}
            transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
            className="flex whitespace-nowrap gap-12 text-sm items-center h-full text-gray-300"
          >
            <span className="flex items-center gap-2"><span className="text-red-400 font-bold">10:00 AM</span> USD ISM Non-Manufacturing PMI (Act: 51.4, Exp: 52.0)</span>
            <span className="flex items-center gap-2"><span className="text-yellow-400 font-bold">11:30 AM</span> USD Crude Oil Inventories</span>
            <span className="flex items-center gap-2"><span className="text-red-400 font-bold">2:00 PM</span> USD FOMC Statement</span>
            <span className="flex items-center gap-2"><span className="text-green-400 font-bold">8:30 AM</span> EUR ECB President Lagarde Speaks</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
