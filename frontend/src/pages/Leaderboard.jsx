import { useState, useEffect } from 'react';
import { Trophy, Medal, Loader } from 'lucide-react';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        const token = userInfo ? JSON.parse(userInfo).token : null;
        const API_URL = import.meta.env.VITE_API_URL || '';
        
        const response = await fetch(`${API_URL}/api/leaderboard`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setLeaderboardData(data);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Trophy className="text-yellow-500" size={32} />
        <h2 className="text-2xl font-bold text-white">Top Traders Leaderboard</h2>
      </div>
      <div className="glass-card p-6 min-h-[300px] relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="animate-spin text-yellow-500" size={32} />
          </div>
        ) : leaderboardData.length > 0 ? (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-gray-500 border-b border-white/5">
                <th className="pb-3 font-medium text-sm">Rank</th>
                <th className="pb-3 font-medium text-sm">Trader</th>
                <th className="pb-3 font-medium text-sm">Monthly P&L</th>
                <th className="pb-3 font-medium text-sm">Win Rate</th>
              </tr>
            </thead>
            <tbody>
              {leaderboardData.map((trader, index) => {
                const rank = index + 1;
                const traderName = trader.firstName || trader.lastName 
                  ? `${trader.firstName || ''} ${trader.lastName || ''}`.trim()
                  : 'Anonymous Trader';
                
                return (
                  <tr key={trader._id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-4 font-bold text-yellow-500 flex items-center gap-2">
                      {rank === 1 && <Medal size={16} />} #{rank}
                    </td>
                    <td className="py-4 font-semibold text-white">{traderName}</td>
                    <td className={`py-4 font-bold ${trader.totalPnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trader.totalPnl >= 0 ? '+' : '-'}${Math.abs(trader.totalPnl).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 text-gray-300">{trader.winRate ? trader.winRate.toFixed(1) : 0}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <p>No trading data available for this month yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
