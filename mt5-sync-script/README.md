# MT5 Trade Sync Script

This script fetches all trades from your MetaTrader 5 account using your investor password and sends them to your EmoTradeLog backend webhook.

## Requirements
- Python 3.8+
- MetaTrader5 Python package
- requests

## Setup
1. Install dependencies:
   ```bash
   pip install MetaTrader5 requests
   ```
2. Update the `config.py` file with your MT5 account details and EmoTradeLog API info.
3. Run the script:
   ```bash
   python sync_mt5_trades.py
   ```

**Never share your investor or master password with anyone. This script runs locally on your machine.**
