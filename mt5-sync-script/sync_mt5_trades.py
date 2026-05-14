import MetaTrader5 as mt5
import requests
from config import MT5_LOGIN, MT5_PASSWORD, MT5_SERVER, MT5_PATH, API_KEY, WEBHOOK_URL
import time

# Connect to MetaTrader 5
if not mt5.initialize(login=MT5_LOGIN, password=MT5_PASSWORD, server=MT5_SERVER, path=MT5_PATH):
    print(f"Failed to initialize MT5: {mt5.last_error()}")
    quit()

print("Connected to MT5 account.")

# Fetch all deals (closed trades)
deals = mt5.history_deals_get(
    time.fromtimestamp(0),  # from epoch
    time.localtime()        # to now
)

if deals is None:
    print(f"No deals found or error: {mt5.last_error()}")
    mt5.shutdown()
    quit()

print(f"Found {len(deals)} trades. Sending to EmoTradeLog...")

for deal in deals:
    trade_data = {
        "symbol": deal.symbol,
        "type": "Long" if deal.type == 0 else "Short",
        "entry": deal.price,
        "size": deal.volume,
        "date": time.strftime('%Y-%m-%dT%H:%M:%S', time.localtime(deal.time)),
        "pnl": deal.profit,
        # Add more fields as needed
    }
    headers = {"x-api-key": API_KEY}
    try:
        resp = requests.post(WEBHOOK_URL, json=trade_data, headers=headers)
        if resp.status_code == 201:
            print(f"Trade {deal.ticket} synced.")
        else:
            print(f"Failed to sync trade {deal.ticket}: {resp.text}")
    except Exception as e:
        print(f"Error syncing trade {deal.ticket}: {e}")

mt5.shutdown()
print("Done.")
