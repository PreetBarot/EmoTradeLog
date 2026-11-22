import React from "react";

const ConnectMT5 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white">
      <div className="bg-gray-900 p-8 rounded-2xl shadow-xl w-full max-w-md border border-gray-800">
        
        <h1 className="text-3xl font-bold mb-4 text-center text-yellow-400">
          Connect MetaTrader 5
        </h1>

        <p className="mb-6 text-gray-300 text-center">
          Sync your MT5 trades securely using investor access.
          Trades from MT5 will automatically appear inside EmoTradeLog.
        </p>

        <div className="bg-black p-4 rounded-lg text-sm text-gray-300 border border-gray-700">
          <strong className="text-yellow-400">Webhook URL:</strong>

          <div className="mt-2 break-all text-green-400">
            https://emotradelog-backend.onrender.com/api/mt5/trade
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500 text-center">
          Your investor password is read-only.  
          EmoTradeLog cannot place trades on your MT5 account.
        </div>
      </div>
    </div>
  );
};

export default ConnectMT5;