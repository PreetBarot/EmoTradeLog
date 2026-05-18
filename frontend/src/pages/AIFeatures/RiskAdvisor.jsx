import { useState, useEffect } from 'react';
import { ShieldAlert, Activity, Loader, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const RiskAdvisor = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        const userInfo = localStorage.getItem('userInfo');
        const token = userInfo ? JSON.parse(userInfo).token : null;
        const API_URL = import.meta.env.VITE_API_URL || '';
        
        const response = await fetch(`${API_URL}/api/ai/risk-advisor`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error("Failed to fetch risk advisor insights");
        
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchRiskData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader className="animate-spin text-yellow-500" size={48} />
        <p className="text-gray-400">AI is calculating your risk exposure...</p>
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
        <ShieldAlert size={48} className="mx-auto mb-4 text-gray-500" />
        <h3 className="text-xl font-semibold text-white mb-2">More Data Needed</h3>
        <p className="text-gray-400 mb-6">{data.message}</p>
        <Link to="/trades" className="btn-gold inline-flex">
          Log a Trade
        </Link>
      </div>
    );
  }

  const riskPercent = parseFloat(data?.currentRiskExposure) || 0;
  const riskColor = riskPercent > 3 ? 'border-red-500 text-red-500' : riskPercent > 1.5 ? 'border-orange-500 text-orange-500' : 'border-green-500 text-green-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="text-yellow-500" size={32} />
        <h2 className="text-2xl font-bold text-white">AI Risk Advisor</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
          <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center mb-4 relative ${riskColor}`}>
            <span className="text-2xl font-bold text-white">{data?.currentRiskExposure || 'N/A'}</span>
          </div>
          <h3 className="font-semibold text-lg text-white mb-1">Current Risk Exposure</h3>
          <p className="text-sm text-gray-400">{data?.exposureStatus || 'Calculated based on recent trades.'}</p>
        </div>

        <div className="glass-card p-6 md:col-span-2 border-orange-500/30">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Activity className="text-orange-400" /> Active Warnings
          </h3>
          <div className="space-y-3">
            {data?.warnings && data.warnings.length > 0 ? (
              data.warnings.map((warning, index) => (
                <div 
                  key={index} 
                  className={`p-4 rounded-xl border ${
                    warning.type === 'warning' 
                      ? 'bg-orange-500/10 border-orange-500/20' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <p className={`text-sm ${warning.type === 'warning' ? 'text-orange-200' : 'text-gray-300'}`}>
                    {warning.type === 'warning' && <span className="font-bold text-orange-400 mr-1">Warning:</span>}
                    {warning.message.replace(/^Warning:\s*/i, '').replace(/^Info:\s*/i, '')}
                  </p>
                </div>
              ))
            ) : (
              <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
                <p className="text-gray-300 text-sm">No active warnings. Safe to maintain current positions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskAdvisor;
