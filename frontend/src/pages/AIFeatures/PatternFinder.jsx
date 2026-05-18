import { useState, useEffect } from 'react';
import { Search, Loader, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const PatternFinder = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPatternData = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        const token = userInfo ? JSON.parse(userInfo).token : null;
        const API_URL = import.meta.env.VITE_API_URL || '';
        
        const response = await fetch(`${API_URL}/api/ai/pattern-finder`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Failed to fetch AI patterns");
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPatternData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader className="animate-spin text-yellow-500" size={48} />
        <p className="text-gray-400">AI is hunting for hidden patterns...</p>
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
        <Search size={48} className="mx-auto mb-4 text-gray-500" />
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
        <Search className="text-yellow-500" size={32} />
        <h2 className="text-2xl font-bold text-white">AI Pattern Finder</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border-l-4 border-l-green-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white">{data?.profitablePattern?.title || 'Profitable Pattern'}</h3>
            <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded whitespace-nowrap ml-2">
              {data?.profitablePattern?.confidence || 'High Confidence'}
            </span>
          </div>
          <p className="text-gray-300 mb-4">{data?.profitablePattern?.description || 'No profitable patterns found yet.'}</p>
        </div>

        <div className="glass-card p-6 border-l-4 border-l-red-500">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-white">{data?.losingPattern?.title || 'Losing Pattern'}</h3>
            <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded whitespace-nowrap ml-2">
              {data?.losingPattern?.actionRequired || 'Action Required'}
            </span>
          </div>
          <p className="text-gray-300 mb-4">{data?.losingPattern?.description || 'No losing patterns found yet.'}</p>
        </div>
      </div>
    </div>
  );
};

export default PatternFinder;
