import { useState, useEffect } from 'react';
import { FileText, Download, Loader } from 'lucide-react';

const WeeklyReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeeklyReport = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_URL = import.meta.env.VITE_API_URL || '';
        const response = await fetch(`${API_URL}/api/ai/weekly-report`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch weekly report');
        const data = await response.json();
        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeeklyReport();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <FileText className="text-yellow-500" size={32} />
          <h2 className="text-2xl font-bold text-white">Weekly AI Report</h2>
        </div>
        <button className="btn-glass flex items-center gap-2">
          <Download size={18} />
          <span>Export PDF</span>
        </button>
      </div>

      <div className="glass-card p-8 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 flex-col gap-4">
             <Loader className="animate-spin text-yellow-500" size={32} />
             <span className="text-gray-400 font-medium">AI is analyzing your week...</span>
          </div>
        )}

        {error ? (
          <div className="text-red-400 text-center py-8">{error}</div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-6xl font-black text-white mb-2">{reportData?.grade || '-'}</h1>
              <p className="text-gray-400 font-medium">Weekly Grade</p>
            </div>

            <div className="space-y-6">
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-xl font-bold text-white mb-2">Executive Summary</h3>
                <p className="text-gray-300 leading-relaxed">
                  {reportData?.executiveSummary || 'Awaiting analysis...'}
                </p>
              </div>

              <div className="border-l-4 border-green-500 pl-4">
                <h3 className="text-xl font-bold text-white mb-2">Key Highlights</h3>
                <ul className="list-disc list-inside text-gray-300 space-y-2">
                  {reportData?.keyHighlights ? (
                    reportData.keyHighlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))
                  ) : (
                    <li>No highlights available.</li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default WeeklyReport;
