import { useState, useEffect } from 'react';
import { Newspaper, Calendar, Loader, Brain, AlertTriangle, Folder } from 'lucide-react';

const NewsCorrelation = () => {
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Default to today
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const fetchNewsCorrelation = async () => {
      setLoading(true);
      setError(null);
      try {
        const userInfo = localStorage.getItem('userInfo');
        const token = userInfo ? JSON.parse(userInfo).token : null;
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/ai/news-correlation?date=${selectedDate}`, {
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
  }, [selectedDate]);

  const getImpactColor = (impact) => {
    switch(impact) {
      case 'High': return 'text-red-500';
      case 'Medium': return 'text-orange-500';
      case 'Low': return 'text-yellow-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Newspaper className="text-yellow-500" size={32} />
          <h2 className="text-2xl font-bold text-white">News Correlation</h2>
        </div>
        
        {/* Date Selector */}
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/10">
          <Calendar className="text-gray-400" size={20} />
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-white border-none outline-none focus:ring-0 [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert cursor-pointer"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main News Table */}
        <div className="lg:col-span-2 glass-card p-6 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Newspaper size={20} className="text-blue-400" /> Economic Calendar ({selectedDate})
          </h3>
          
          <div className="flex-1 overflow-x-auto">
            {loading ? (
              <div className="h-64 flex flex-col items-center justify-center text-gray-400 gap-3">
                <Loader className="animate-spin text-yellow-500" size={32} />
                <span>Fetching real-time calendar...</span>
              </div>
            ) : error ? (
              <div className="h-64 flex items-center justify-center text-red-400">
                {error}
              </div>
            ) : newsData?.dailyNews?.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-sm">
                    <th className="py-3 font-medium">Time</th>
                    <th className="py-3 font-medium">Currency</th>
                    <th className="py-3 font-medium">Impact</th>
                    <th className="py-3 font-medium">Event</th>
                  </tr>
                </thead>
                <tbody>
                  {newsData.dailyNews.map((newsItem, index) => (
                    <tr key={index} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="py-3 text-gray-300 whitespace-nowrap text-sm">
                        {new Date(newsItem.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' })}
                      </td>
                      <td className="py-3">
                        <span className="text-white font-medium text-sm">{newsItem.country}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                           <Folder className={`fill-current ${getImpactColor(newsItem.impact)}`} size={18} />
                           <span className="text-gray-400 text-xs hidden sm:inline">{newsItem.impact}</span>
                        </div>
                      </td>
                      <td className="py-3 text-gray-200 text-sm">{newsItem.title}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-400 text-sm text-center px-4">
                No economic news available for the selected date. Note: API data is limited to the current week.
              </div>
            )}
          </div>
        </div>

        {/* AI Correlation Insight Panel */}
        <div className="glass-card p-6 border-blue-500/30 relative flex flex-col h-full">
          {loading && (
            <div className="absolute inset-0 bg-[#0a0a0a]/50 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <Loader className="animate-spin text-yellow-500" size={32} />
            </div>
          )}
          
          <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Brain size={24} />
            <h3 className="text-lg font-bold text-white">AI Correlation Insight</h3>
          </div>
          
          <div className="flex-1">
            <p className="text-gray-300 leading-relaxed text-sm mb-6">
              {newsData?.insight || "Select a date with high/medium impact news to generate AI insights."}
            </p>
            
            {(newsData?.suggestedRule || !loading) && (
              <div className="p-4 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle size={16} className="text-yellow-500" />
                  <span className="text-yellow-500 font-bold text-sm">Suggested Rule</span>
                </div>
                <p className="text-gray-300 text-sm">
                  {newsData?.suggestedRule || "No specific rule suggested for this date."}
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default NewsCorrelation;
