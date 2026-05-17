import { useState, useEffect } from 'react';
import { Newspaper, Calendar, Loader } from 'lucide-react';

const NewsCorrelation = () => {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewsCorrelation = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/ai/news-correlation`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch news correlation');
        const data = await response.json();
        setNewsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNewsCorrelation();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <Newspaper className="text-yellow-500" size={32} />
        <h2 className="text-2xl font-bold text-white">News Correlation</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={20} /> Upcoming High Impact News
          </h3>
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center gap-2 text-gray-400">
                <Loader className="animate-spin" size={16} /> Fetching real-time news...
              </div>
            ) : error ? (
              <div className="text-red-400 text-sm">{error}</div>
            ) : newsData?.upcomingNews?.length > 0 ? (
              newsData.upcomingNews.map((newsItem, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <div>
                    <span className="text-red-400 font-bold text-sm block">
                      {new Date(newsItem.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                    </span>
                    <span className="text-white font-medium">{newsItem.title}</span>
                  </div>
                  <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded font-bold">{newsItem.country}</span>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm">No high impact USD news upcoming today.</div>
            )}
          </div>
        </div>

        <div className="glass-card p-6 border-blue-500/30 relative overflow-hidden">
          {loading && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
              <Loader className="animate-spin text-yellow-500" size={32} />
            </div>
          )}
          <h3 className="text-lg font-bold text-white mb-4">AI Correlation Insight</h3>
          <p className="text-gray-300 leading-relaxed">
            {newsData?.insight || "Waiting for AI insight..."}
          </p>
          <div className="mt-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <span className="text-yellow-500 font-semibold text-sm">Suggested Rule:</span>
            <p className="text-gray-400 text-sm mt-1">{newsData?.suggestedRule || "..."}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsCorrelation;
