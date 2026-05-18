import { useState, useEffect } from 'react';
import { MessageSquare, Award, TrendingUp, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

const TradeCoach = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoachData = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        const token = userInfo ? JSON.parse(userInfo).token : null;
        const API_URL = import.meta.env.VITE_API_URL || '';
        
        const response = await fetch(`${API_URL}/api/ai/trade-coach`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Failed to fetch AI insights");
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoachData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader className="animate-spin text-yellow-500" size={48} />
        <p className="text-gray-400">AI is analyzing your trades...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-card p-8 text-center text-red-400">
        <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
        <p>{error}</p>
      </div>
    );
  }

  if (data?.notEnoughData) {
    return (
      <div className="glass-card p-12 text-center">
        <MessageSquare size={48} className="mx-auto mb-4 text-gray-500" />
        <h3 className="text-xl font-semibold text-white mb-2">More Data Needed</h3>
        <p className="text-gray-400 mb-6">{data.message}</p>
        <Link to="/trades" className="btn-gold inline-flex">
          Log a Trade
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <MessageSquare className="text-yellow-500" size={32} />
        <h2 className="text-2xl font-bold text-white">AI Trade Coach</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-l-4 border-yellow-500/50">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Trade Score</h3>
            <span className={`text-3xl font-bold ${data?.tradeScore?.includes('A') ? 'text-green-400' : data?.tradeScore?.includes('B') ? 'text-yellow-400' : 'text-red-400'}`}>
              {data?.tradeScore || 'N/A'}
            </span>
          </div>
          <p className="text-gray-300">Based on your recent risk management and profitability.</p>
        </div>

        <div className="glass-card p-6 border-yellow-500/30 shadow-[0_0_15px_rgba(234,179,8,0.1)] md:row-span-2">
          <h3 className="text-lg font-semibold mb-4 text-yellow-500 flex items-center gap-2">
            <Award size={20} /> AI Recommendation
          </h3>
          <p className="text-gray-200 leading-relaxed">
            {data?.recommendation || 'No recommendation available.'}
          </p>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-green-400">
            <TrendingUp size={20} /> Strengths
          </h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {data?.strengths?.map((str, idx) => (
              <li key={idx}>{str}</li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-red-400">
            <AlertCircle size={20} /> Weaknesses
          </h3>
          <ul className="list-disc list-inside text-gray-300 space-y-2">
            {data?.weaknesses?.map((weak, idx) => (
              <li key={idx}>{weak}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TradeCoach;
