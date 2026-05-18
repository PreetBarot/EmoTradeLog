import { useState, useEffect, useRef } from 'react';
import { PlayCircle, PauseCircle, SkipForward, TrendingUp, TrendingDown, DollarSign, Settings, Loader } from 'lucide-react';
import { createChart } from 'lightweight-charts';

const Backtesting = () => {
  const chartContainerRef = useRef();
  const chartRef = useRef(null);
  const candlestickSeriesRef = useRef(null);

  // Configuration State
  const [assetClass, setAssetClass] = useState('crypto'); // 'crypto' (Binance) or 'forex' (Twelve Data)
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [interval, setIntervalVal] = useState('1h');
  
  // Data State
  const [fullData, setFullData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Replay State
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500); // ms per candle
  const playIntervalRef = useRef(null);

  // Trading State
  const [balance, setBalance] = useState(10000);
  const [openPosition, setOpenPosition] = useState(null); // { type: 'LONG'|'SHORT', entryPrice, size }
  const [tradeHistory, setTradeHistory] = useState([]);

  // Initialize Chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;

    const handleResize = () => {
      chart.applyOptions({ width: chartContainerRef.current.clientWidth });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, []);

  const fetchHistoricalData = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsPlaying(false);
      
      const userInfo = localStorage.getItem('userInfo');
      const token = userInfo ? JSON.parse(userInfo).token : null;
      const API_URL = import.meta.env.VITE_API_URL || '';
      
      const source = assetClass === 'crypto' ? 'binance' : 'twelvedata';
      // Adjust interval mapping if needed for Twelve Data (e.g. 1h -> 1h)
      
      const response = await fetch(`${API_URL}/api/data/klines?symbol=${symbol}&interval=${interval}&source=${source}&limit=1000`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch data");
      }
      
      const data = await response.json();
      
      if (data.length === 0) {
        throw new Error("No data returned for this symbol/interval.");
      }

      setFullData(data);
      setCurrentIndex(Math.floor(data.length * 0.5)); // Start halfway through
      setBalance(10000);
      setOpenPosition(null);
      setTradeHistory([]);
      
      // Load initial visible data
      const initialVisibleData = data.slice(0, Math.floor(data.length * 0.5));
      candlestickSeriesRef.current.setData(initialVisibleData);
      
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const advanceCandle = () => {
    setCurrentIndex(prev => {
      if (prev >= fullData.length - 1) {
        setIsPlaying(false);
        return prev;
      }
      const nextIndex = prev + 1;
      candlestickSeriesRef.current.update(fullData[nextIndex]);
      return nextIndex;
    });
  };

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(advanceCandle, speed);
    } else {
      clearInterval(playIntervalRef.current);
    }
    return () => clearInterval(playIntervalRef.current);
  }, [isPlaying, speed, fullData]);

  const togglePlay = () => {
    if (fullData.length === 0) return;
    setIsPlaying(!isPlaying);
  };

  const handleTrade = (type) => {
    if (fullData.length === 0 || currentIndex >= fullData.length) return;
    
    const currentPrice = fullData[currentIndex].close;
    const size = balance * 0.1; // Risk 10% per trade (simplified)

    if (openPosition) {
      // Close existing position first
      const isWin = (openPosition.type === 'LONG' && currentPrice > openPosition.entryPrice) || 
                    (openPosition.type === 'SHORT' && currentPrice < openPosition.entryPrice);
      
      const pnlPercent = openPosition.type === 'LONG' 
        ? (currentPrice - openPosition.entryPrice) / openPosition.entryPrice
        : (openPosition.entryPrice - currentPrice) / openPosition.entryPrice;
        
      const pnlAmount = openPosition.size * pnlPercent;
      
      setBalance(prev => prev + pnlAmount);
      setTradeHistory(prev => [...prev, {
        type: openPosition.type,
        entry: openPosition.entryPrice,
        exit: currentPrice,
        pnl: pnlAmount,
        time: fullData[currentIndex].time
      }]);
      setOpenPosition(null);
    } else {
      // Open new position
      setOpenPosition({
        type,
        entryPrice: currentPrice,
        size
      });
    }
  };

  const currentPrice = fullData[currentIndex]?.close || 0;
  const floatingPnL = openPosition 
    ? (openPosition.type === 'LONG' 
        ? (currentPrice - openPosition.entryPrice) / openPosition.entryPrice 
        : (openPosition.entryPrice - currentPrice) / openPosition.entryPrice) * openPosition.size
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <History className="text-yellow-500" size={32} />
          <h2 className="text-2xl font-bold text-white">Backtesting Engine</h2>
        </div>
        
        <div className="flex items-center gap-4 bg-white/5 p-2 rounded-xl border border-white/10">
          <div className="text-right">
            <p className="text-xs text-gray-400">Simulated Balance</p>
            <p className={`font-bold ${balance + floatingPnL >= 10000 ? 'text-green-400' : 'text-red-400'}`}>
              ${(balance + floatingPnL).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card p-4 flex flex-wrap gap-4 items-end z-20 relative">
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Market</label>
          <select 
            value={assetClass} 
            onChange={(e) => setAssetClass(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-yellow-500 block"
          >
            <option value="crypto">Crypto (Binance)</option>
            <option value="forex">Forex/Stocks (Twelve Data)</option>
          </select>
        </div>
        
        <div className="space-y-1">
          <label className="text-xs text-gray-400">Symbol</label>
          <input 
            type="text" 
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-yellow-500 w-32 uppercase"
            placeholder={assetClass === 'crypto' ? 'BTCUSDT' : 'EUR/USD'}
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs text-gray-400">Interval</label>
          <select 
            value={interval} 
            onChange={(e) => setIntervalVal(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-yellow-500 block"
          >
            <option value="1m">1 Min</option>
            <option value="5m">5 Min</option>
            <option value="15m">15 Min</option>
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hour</option>
            <option value="1d">1 Day</option>
          </select>
        </div>

        <button 
          onClick={fetchHistoricalData}
          disabled={loading}
          className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-400 transition-colors flex items-center gap-2"
        >
          {loading ? <Loader size={16} className="animate-spin" /> : <Settings size={16} />}
          Load Data
        </button>

        {error && <span className="text-red-400 text-sm ml-auto">{error}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 glass-card p-1 overflow-hidden relative">
          {fullData.length === 0 && !loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-10">
              <History size={48} className="text-gray-600 mb-4" />
              <p className="text-gray-400">Configure settings and Load Data to begin.</p>
            </div>
          )}
          <div ref={chartContainerRef} className="w-full h-[500px]" />
          
          {/* Replay Controls Overlaid */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur-md border border-white/10 p-2 rounded-full z-10">
            <button 
              onClick={togglePlay}
              disabled={fullData.length === 0}
              className={`p-2 rounded-full transition-colors ${isPlaying ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-green-500/20 text-green-500 hover:bg-green-500/30'} disabled:opacity-50`}
            >
              {isPlaying ? <PauseCircle size={24} /> : <PlayCircle size={24} />}
            </button>
            <button 
              onClick={advanceCandle}
              disabled={isPlaying || fullData.length === 0}
              className="p-2 rounded-full bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white transition-colors disabled:opacity-50"
            >
              <SkipForward size={20} />
            </button>
            <div className="h-6 w-px bg-white/20 mx-2" />
            <span className="text-xs text-gray-400 mr-2">Speed</span>
            <input 
              type="range" 
              min="100" max="2000" step="100"
              value={2100 - speed} // Invert so right is faster
              onChange={(e) => setSpeed(2100 - parseInt(e.target.value))}
              className="w-24 accent-yellow-500"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h3 className="font-bold text-white mb-4">Trading Panel</h3>
            
            <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-6 text-center">
              <p className="text-sm text-gray-400 mb-1">Current Price</p>
              <p className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</p>
            </div>

            {openPosition ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border ${openPosition.type === 'LONG' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className={`font-bold ${openPosition.type === 'LONG' ? 'text-green-500' : 'text-red-500'}`}>
                      {openPosition.type}
                    </span>
                    <span className={`font-bold ${floatingPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {floatingPnL >= 0 ? '+' : ''}{floatingPnL.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">Entry: ${openPosition.entryPrice.toFixed(2)}</p>
                </div>
                
                <button 
                  onClick={() => handleTrade('CLOSE')}
                  className="w-full bg-yellow-500 text-black py-3 rounded-xl font-bold hover:bg-yellow-400 transition-colors"
                >
                  Close Position
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => handleTrade('LONG')}
                  disabled={fullData.length === 0}
                  className="bg-green-500/20 text-green-500 border border-green-500/50 py-3 rounded-xl font-bold hover:bg-green-500 hover:text-black transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                >
                  <TrendingUp size={20} />
                  Buy
                </button>
                <button 
                  onClick={() => handleTrade('SHORT')}
                  disabled={fullData.length === 0}
                  className="bg-red-500/20 text-red-500 border border-red-500/50 py-3 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50 flex flex-col items-center justify-center gap-1"
                >
                  <TrendingDown size={20} />
                  Sell
                </button>
              </div>
            )}
          </div>

          <div className="glass-card p-6 flex-1">
            <h3 className="font-bold text-white mb-4">Recent Trades</h3>
            <div className="space-y-3 max-h-[250px] overflow-y-auto">
              {tradeHistory.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No trades taken yet.</p>
              ) : (
                tradeHistory.slice().reverse().map((trade, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-black/40 rounded-lg border border-white/5">
                    <div>
                      <span className={`text-xs font-bold px-2 py-1 rounded-sm ${trade.type === 'LONG' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {trade.type}
                      </span>
                    </div>
                    <span className={`font-bold ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Backtesting;
