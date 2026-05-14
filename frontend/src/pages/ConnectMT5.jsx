import React from "react";

const ConnectMT5 = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Connect MetaTrader 5 (MT5)</h1>
        <p className="mb-6 text-gray-700 text-center">
          To sync your MT5 trades, use your unique API key and set up a webhook in your MT5 integration tool.<br/>
          Please see your account page for your API key after registration.
        </p>
        <div className="bg-gray-100 p-4 rounded text-sm text-gray-600">
          <strong>Webhook URL:</strong><br/>
          <code className="break-all">https://your-backend-domain/api/mt5/trade</code>
        </div>
        <div className="mt-6 text-xs text-gray-500 text-center">
          Make sure to keep your API key secret. Contact support if you need help.
        </div>
      </div>
    </div>
  );
};

export default ConnectMT5;
