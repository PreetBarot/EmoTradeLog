import axios from 'axios';

export const getHistoricalData = async (req, res) => {
  try {
    const { symbol, interval, source, limit = 500 } = req.query;

    if (!symbol || !interval || !source) {
      return res.status(400).json({ message: "Missing required parameters: symbol, interval, source" });
    }

    let formattedData = [];

    if (source === 'binance') {
      // Binance Klines API
      // interval formats: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
      const binanceUrl = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`;
      const response = await axios.get(binanceUrl);
      
      // Binance response format:
      // [ [Open time, Open, High, Low, Close, Volume, Close time, ...], ... ]
      formattedData = response.data.map(kline => ({
        time: Math.floor(kline[0] / 1000), // lightweight-charts uses Unix timestamp in seconds
        open: parseFloat(kline[1]),
        high: parseFloat(kline[2]),
        low: parseFloat(kline[3]),
        close: parseFloat(kline[4]),
        volume: parseFloat(kline[5])
      }));

    } else if (source === 'twelvedata') {
      // Twelve Data Time Series API
      // interval formats: 1min, 5min, 15min, 30min, 45min, 1h, 2h, 4h, 1day, 1week, 1month
      const apiKey = process.env.TWELVE_DATA_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ message: "Twelve Data API key is not configured." });
      }

      const tdUrl = `https://api.twelvedata.com/time_series?symbol=${symbol}&interval=${interval}&outputsize=${limit}&apikey=${apiKey}`;
      const response = await axios.get(tdUrl);

      if (response.data.status === 'error') {
        throw new Error(response.data.message || "Twelve Data API error");
      }

      // Twelve Data response format: { values: [ { datetime, open, high, low, close, volume }, ... ] }
      // The array is usually returned in descending order (newest first). Lightweight charts needs ascending order.
      const values = response.data.values || [];
      formattedData = values.map(item => ({
        time: Math.floor(new Date(item.datetime).getTime() / 1000),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseFloat(item.volume || 0)
      })).reverse(); // Reverse to ascending order

    } else {
      return res.status(400).json({ message: "Invalid source. Use 'binance' or 'twelvedata'." });
    }

    res.status(200).json(formattedData);

  } catch (error) {
    console.error("Error fetching historical data:", error.response?.data || error.message);
    res.status(500).json({ 
      message: "Server error fetching historical data", 
      details: error.response?.data?.message || error.message 
    });
  }
};

export const getMarketQuotes = async (req, res) => {
  try {
    const quotes = [];

    // 1. Fetch Crypto from Binance (BTC, ETH)
    try {
      const binanceResponse = await axios.get(`https://api.binance.us/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]`);
      binanceResponse.data.forEach(item => {
        quotes.push({
          symbol: item.symbol.replace('USDT', '/USD'),
          price: parseFloat(item.lastPrice).toFixed(2),
          change: parseFloat(item.priceChangePercent).toFixed(2),
          type: 'crypto'
        });
      });
    } catch (binanceError) {
      console.error("Error fetching Binance quotes:", binanceError.message);
    }

    // 2. Fetch Forex/Commodities from Twelve Data
    try {
      const apiKey = process.env.TWELVE_DATA_API_KEY;
      if (apiKey) {
        const tdResponse = await axios.get(`https://api.twelvedata.com/quote?symbol=EUR/USD,GBP/USD,USD/JPY,XAU/USD&apikey=${apiKey}`);
        
        // Twelve Data returns an object with symbols as keys when requesting multiple symbols
        const tdData = tdResponse.data;
        if (!tdData.status || tdData.status !== 'error') {
          Object.values(tdData).forEach(item => {
            if (item && item.symbol) {
              quotes.push({
                symbol: item.symbol,
                price: parseFloat(item.close).toFixed(5),
                change: parseFloat(item.percent_change).toFixed(2),
                type: item.symbol === 'XAU/USD' ? 'commodity' : 'forex'
              });
            }
          });
        }
      }
    } catch (tdError) {
      console.error("Error fetching Twelve Data quotes:", tdError.message);
    }

    res.status(200).json(quotes);

  } catch (error) {
    console.error("Error in getMarketQuotes:", error);
    res.status(500).json({ message: "Server error fetching market quotes" });
  }
};
