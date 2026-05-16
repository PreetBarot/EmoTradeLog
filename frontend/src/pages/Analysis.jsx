import { useState } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Target, Zap, Clock, Calendar, BarChart2, DollarSign, Activity } from 'lucide-react';
import useTradeStore from '../store/useTradeStore';
import { useEffect, useMemo } from 'react';
import { calculateTradeStats } from '../utils/tradeStats';

const mockEquityData = [];

const mockDayPerformance = [];

const Analysis = () => {
  const { trades, fetchTrades } = useTradeStore();
  const [timePeriod, setTimePeriod] = useState('30 Days');
  const [filterBy, setFilterBy] = useState('All Trades');

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const journaledTrades = useMemo(() => trades.filter(t => t.status === 'Journaled'), [trades]);
  const stats = useMemo(() => calculateTradeStats(journaledTrades), [journaledTrades]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filters */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BarChart2 className="text-yellow-500" /> Performance Analytics
          </h2>
          <p className="text-gray-400 text-sm mt-1">Analyze your trading patterns and improve your strategy</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-6">
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Time Period</span>
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
              {['Today', '7 Days', '30 Days', '3 Months', '1 Year', 'All Time'].map(p => (
                <button
                  key={p}
                  onClick={() => setTimePeriod(p)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${timePeriod === p ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Filter By</span>
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5">
              {['All Trades', 'Winners', 'Losers'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilterBy(f)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all whitespace-nowrap ${filterBy === f ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 1: Big Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 border-t-4 border-t-blue-500">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mb-4"><DollarSign size={16} /></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total P&L</p>
          <h3 className="text-3xl font-bold text-blue-400 mb-2">${stats.totalPnl.toFixed(2)}</h3>
          <p className="text-xs text-gray-400">From {stats.totalTrades} closed trades</p>
        </div>
        
        <div className="glass-card p-6 border-t-4 border-t-green-500">
          <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mb-4"><Target size={16} /></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Win Rate</p>
          <h3 className="text-3xl font-bold text-green-400 mb-2">{stats.winRate.toFixed(1)}%</h3>
          <p className="text-xs text-gray-400">{stats.wins} wins • {stats.losses} losses</p>
        </div>

        <div className="glass-card p-6 border-t-4 border-t-purple-500">
          <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center mb-4"><Zap size={16} /></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Profit Factor</p>
          <h3 className="text-3xl font-bold text-purple-400 mb-2">{stats.profitFactor.toFixed(2)}</h3>
          <p className="text-xs text-gray-400">Gross profit ÷ Gross loss</p>
        </div>

        <div className="glass-card p-6 border-t-4 border-t-yellow-500">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center mb-4"><Clock size={16} /></div>
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Expectancy</p>
          <h3 className="text-3xl font-bold text-yellow-500 mb-2">${stats.expectancy.toFixed(2)}</h3>
          <p className="text-xs text-gray-400">Average profit per trade</p>
        </div>
      </div>

      {/* Row 2: Quick Stats & Equity Curve */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Stats Grid */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2"><Activity size={18} className="text-blue-400" /> Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Winner</span>
              <span className="text-lg font-bold text-green-400">${stats.avgWinner.toFixed(2)}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Avg Loser</span>
              <span className="text-lg font-bold text-red-400">${stats.avgLoser.toFixed(2)}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Best Trade</span>
              <span className="text-lg font-bold text-blue-400">${stats.bestTrade.toFixed(2)}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Worst Trade</span>
              <span className="text-lg font-bold text-red-400">${stats.worstTrade.toFixed(2)}</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Win Streak</span>
              <span className="text-lg font-bold text-white">-</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Loss Streak</span>
              <span className="text-lg font-bold text-white">-</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Risk:Reward</span>
              <span className="text-lg font-bold text-yellow-500">-</span>
            </div>
            <div className="bg-white/5 rounded-xl p-4 border border-white/5">
              <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Open Trades</span>
              <span className="text-lg font-bold text-white">-</span>
            </div>
          </div>
        </div>

        {/* Equity Curve */}
        <div className="glass-card p-6 lg:col-span-2 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-white flex items-center gap-2"><TrendingUp size={18} className="text-blue-400" /> Equity Curve</h3>
              <p className="text-xs text-gray-500 mt-1">Cumulative P&L progression</p>
            </div>
            <div className="flex bg-black/40 p-1 rounded-lg border border-white/5 text-xs font-bold">
              <button className="px-3 py-1 bg-blue-600 text-white rounded">Equity</button>
              <button className="px-3 py-1 text-gray-400 hover:text-white rounded">Drawdown</button>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            {mockEquityData.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-xl">
                <Activity size={32} className="mb-2 opacity-50 text-blue-400" />
                <p className="text-sm">Log your first trade to generate your equity curve.</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockEquityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.5)" tick={{fill: 'rgba(255,255,255,0.5)', fontSize: 12}} tickLine={false} axisLine={false} domain={['dataMin - 1000', 'dataMax + 1000']} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  />
                  <Line type="monotone" dataKey="equity" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 0}} activeDot={{r: 6, fill: '#eab308'}} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Mini Charts (Long vs Short, Day Performance, Top Symbols) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-6">Long vs Short</h3>
          <div className="space-y-4">
            <div className="border border-white/5 rounded-xl p-4 bg-white/5">
              <div className="flex items-center gap-2 text-blue-400 font-bold mb-4"><TrendingUp size={16} /> Long</div>
              <div className="flex justify-between text-center">
                <div><span className="block text-[10px] text-gray-500 font-bold mb-1">TRADES</span><span className="text-white font-bold">0</span></div>
                <div><span className="block text-[10px] text-gray-500 font-bold mb-1">P&L</span><span className="text-gray-400 font-bold">$0.00</span></div>
                <div><span className="block text-[10px] text-gray-500 font-bold mb-1">WIN %</span><span className="text-white font-bold">0%</span></div>
              </div>
            </div>
            <div className="border border-white/5 rounded-xl p-4 bg-white/5">
              <div className="flex items-center gap-2 text-red-400 font-bold mb-4"><TrendingUp size={16} className="rotate-180" /> Short</div>
              <div className="flex justify-between text-center">
                <div><span className="block text-[10px] text-gray-500 font-bold mb-1">TRADES</span><span className="text-white font-bold">0</span></div>
                <div><span className="block text-[10px] text-gray-500 font-bold mb-1">P&L</span><span className="text-gray-400 font-bold">$0.00</span></div>
                <div><span className="block text-[10px] text-gray-500 font-bold mb-1">WIN %</span><span className="text-white font-bold">0%</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-2">Day Performance</h3>
          <p className="text-xs text-gray-500 mb-6">Find your best trading days</p>
          <div className="h-48 flex items-center justify-center border border-dashed border-white/10 rounded-xl">
             <p className="text-sm text-gray-500">Not enough data.</p>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-bold text-white mb-2">Top Symbols</h3>
          <p className="text-xs text-gray-500 mb-6">Best performing assets</p>
          <div className="space-y-4">
             <div className="flex items-center justify-center h-32 border border-dashed border-white/10 rounded-xl">
               <p className="text-sm text-gray-500">No symbols traded yet.</p>
             </div>
          </div>
        </div>
      </div>

      {/* Row 4: Trading Calendar */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="font-bold text-white flex items-center gap-2"><Calendar size={18} className="text-blue-400" /> Trading Calendar</h3>
            <p className="text-xs text-gray-500 mt-1">Daily P&L heatmap - Click on days to see trades</p>
          </div>
          <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-lg border border-white/10">
            <button className="text-gray-400 hover:text-white">&lt;</button>
            <span className="font-bold text-white min-w-[100px] text-center">May 2026</span>
            <button className="text-gray-400 hover:text-white">&gt;</button>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-7 gap-2">
              {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-gray-500 py-2">{d}</div>
              ))}
              {/* Empty slots for start of month */}
              <div className="aspect-square"></div>
              <div className="aspect-square"></div>
              <div className="aspect-square"></div>
              <div className="aspect-square"></div>
              
              {Array.from({ length: 31 }, (_, i) => {
                const day = i + 1;
                return (
                  <div key={day} className="aspect-square rounded-xl flex flex-col items-center justify-center p-2 bg-white/5 border border-white/5">
                    <span className="text-sm font-bold text-gray-600">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>
          
          {/* Day Detail Sidebar */}
          <div className="w-full lg:w-72 bg-white/5 rounded-xl border border-white/5 p-6 flex flex-col items-center justify-center text-center">
             <Calendar size={48} className="text-gray-600 mb-4" />
             <h4 className="font-bold text-white mb-2">Day Trades</h4>
             <p className="text-xs text-gray-500">Click on a day with trades in the calendar to view details here.</p>
          </div>
        </div>
      </div>

      {/* Row 5: Detailed Stats Table */}
      <div className="glass-card p-6">
        <h3 className="font-bold text-white mb-6">Your Stats <span className="text-[10px] bg-white/10 px-2 py-1 rounded ml-2">30 DAYS</span></h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="block text-[10px] font-bold text-gray-500 uppercase mb-2">BEST MONTH</span>
            <div className="font-bold text-white text-xl">N/A</div>
            <span className="text-gray-500 text-xs font-bold">$0.00</span>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="block text-[10px] font-bold text-gray-500 uppercase mb-2">WORST MONTH</span>
            <div className="font-bold text-white text-xl">N/A</div>
            <span className="text-gray-500 text-xs font-bold">$0.00</span>
          </div>
          <div className="bg-white/5 p-4 rounded-xl border border-white/5">
            <span className="block text-[10px] font-bold text-gray-500 uppercase mb-2">AVERAGE per Month</span>
            <div className="font-bold text-gray-500 text-xl">$0.00</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0 text-sm">
          {[
            ['Total P&L', '$0.00', 'text-gray-400 font-bold'],
            ['Average daily volume', '0', 'font-bold text-gray-400'],
            ['Average winning trade', '$0.00', 'text-gray-400 font-bold'],
            ['Average losing trade', '$0.00', 'text-gray-400 font-bold'],
            ['Total number of trades', '0', 'font-bold text-gray-400'],
            ['Number of winning trades', '0', 'font-bold text-gray-400'],
            ['Number of losing trades', '0', 'font-bold text-gray-400'],
            ['Max consecutive wins', '0', 'font-bold text-gray-400'],
            ['Max consecutive losses', '0', 'font-bold text-gray-400'],
            ['Total commissions', '$0.00', 'font-bold text-gray-400'],
            ['Total swap', '$0.00', 'font-bold text-gray-400'],
            ['Largest profit', '$0.00', 'text-gray-400 font-bold'],
            ['Largest loss', '$0.00', 'text-gray-400 font-bold'],
            ['Avg hold time (Winners)', '-', 'font-bold text-gray-400'],
          ].map((stat, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400">{stat[0]}</span>
              <span className={stat[2]}>{stat[1]}</span>
            </div>
          ))}

          {[
            ['Open trades', '0', 'font-bold text-gray-400'],
            ['Total trading days', '0', 'font-bold text-gray-400'],
            ['Winning days', '0', 'font-bold text-gray-400'],
            ['Losing days', '0', 'font-bold text-gray-400'],
            ['Breakeven days', '0', 'font-bold text-gray-400'],
            ['Average daily P&L', '$0.00', 'text-gray-400 font-bold'],
            ['Average winning day P&L', '$0.00', 'text-gray-400 font-bold'],
            ['Average losing day P&L', '$0.00', 'text-gray-400 font-bold'],
            ['Largest profitable day', '$0.00', 'text-gray-400 font-bold'],
            ['Largest losing day', '$0.00', 'text-gray-400 font-bold'],
            ['Trade expectancy', '$0.00', 'text-gray-400 font-bold'],
            ['Max drawdown', '$0.00', 'text-gray-400 font-bold'],
            ['Max drawdown %', '0.0%', 'text-gray-400 font-bold'],
            ['Avg hold time (Losers)', '-', 'font-bold text-gray-400'],
          ].map((stat, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
              <span className="text-gray-400">{stat[0]}</span>
              <span className={stat[2]}>{stat[1]}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Analysis;
