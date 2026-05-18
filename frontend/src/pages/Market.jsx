import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

const Market = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuotes = async () => {
    try {
      setLoading(true);
      setError(null);
      const userInfo = localStorage.getItem('userInfo');
      const token = userInfo ? JSON.parse(userInfo).token : null;
      const API_URL = import.meta.env.VITE_API_URL || '';

      const response = await fetch(`${API_URL}/api/data/quotes`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch market quotes');
      }

      const data = await response.json();
      setQuotes(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuotes();
    // Refresh every 60 seconds
    const intervalId = setInterval(fetchQuotes, 60000);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Market Overview</h2>
        <button 
          onClick={fetchQuotes}
          disabled={loading}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400">
          {error}
        </div>
      )}

      {loading && quotes.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="glass-card p-6 animate-pulse">
               <div className="h-6 bg-white/10 rounded w-1/2 mb-4"></div>
               <div className="h-8 bg-white/10 rounded w-3/4"></div>
             </div>
           ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {quotes.map((quote, idx) => (
            <div key={idx} className="glass-card p-6 border-t-2 border-transparent hover:border-yellow-500 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-bold text-white">{quote.symbol}</h3>
                <span className="text-xs uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded">
                  {quote.type}
                </span>
              </div>
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold text-white">
                  ${quote.price}
                </p>
                <div className={`flex items-center text-sm font-bold ${parseFloat(quote.change) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {parseFloat(quote.change) >= 0 ? <TrendingUp size={16} className="mr-1"/> : <TrendingDown size={16} className="mr-1"/>}
                  {Math.abs(parseFloat(quote.change))}%
                </div>
              </div>
            </div>
          ))}
          {quotes.length === 0 && !loading && (
             <div className="col-span-full text-center text-gray-500 py-8">
               No market data available. Check your API keys.
             </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Market;
