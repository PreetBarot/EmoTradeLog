import { Link2, RefreshCw } from 'lucide-react';
import { useState } from 'react';

const Integrations = () => {

  const [loading, setLoading] = useState(false);

  const handleSync = async () => {

    try {

      setLoading(true);

      const API_URL = import.meta.env.VITE_API_URL;

      if (!API_URL) {
        alert('VITE_API_URL is missing');
        return;
      }

      console.log('Calling:', `${API_URL}/api/mt5/sync`);

      const response = await fetch(`${API_URL}/api/mt5/sync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      console.log(data);

      if (response.ok) {
        alert(data.message || 'MT5 sync successful');
      } else {
        alert(data.message || 'MT5 sync failed');
      }

    } catch (error) {

      console.error(error);

      alert('Server connection failed');

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="space-y-6">

      <div className="flex items-center gap-3 mb-8">
        <Link2 className="text-yellow-500" size={32} />

        <h2 className="text-2xl font-bold text-white">
          Platform Integrations
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* MT5 */}

        <div className="glass-card p-6 border-l-4 border-l-blue-500">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-xl font-bold text-white">
              MetaTrader 5
            </h3>

            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full font-bold">
              Connected
            </span>

          </div>

          <p className="text-gray-400 text-sm mb-6">
            Automatically sync your live trades,
            historical data, and account balance directly
            from your MT5 broker.
          </p>

          <button
            onClick={handleSync}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors"
          >

            <RefreshCw
              size={16}
              className={loading ? 'animate-spin' : ''}
            />

            {loading ? 'Syncing...' : 'Sync Now'}

          </button>

        </div>

        {/* CTRADER */}

        <div className="glass-card p-6 border-l-4 border-l-gray-600">

          <div className="flex justify-between items-center mb-4">

            <h3 className="text-xl font-bold text-white">
              cTrader
            </h3>

            <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full font-bold">
              Not Connected
            </span>

          </div>

          <p className="text-gray-400 text-sm mb-6">
            Link your cTrader account using OpenAPI
            to fetch trades seamlessly.
          </p>

          <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30 rounded-lg text-sm transition-colors font-medium">

            <Link2 size={16} />

            Connect Account

          </button>

        </div>

      </div>
    </div>
  );
};

export default Integrations;