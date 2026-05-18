import axios from 'axios';
import 'dotenv/config';

async function test() {
  try {
    const tdResponse = await axios.get(`https://api.twelvedata.com/quote?symbol=EUR/USD,GBP/USD,USD/JPY,XAU/USD&apikey=${process.env.TWELVE_DATA_API_KEY}`);
    console.log("Twelve Data:", JSON.stringify(tdResponse.data, null, 2));

    const binanceResponse = await axios.get(`https://api.binance.com/api/v3/ticker/24hr?symbols=["BTCUSDT","ETHUSDT"]`);
    console.log("Binance:", JSON.stringify(binanceResponse.data, null, 2));
  } catch(e) {
    console.error(e.response?.data || e.message);
  }
}
test();
