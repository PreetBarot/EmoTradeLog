import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, Loader } from 'lucide-react';

const ChatWithData = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Hi! I'm your AI trading assistant. Ask me anything about your trading data." }
  ]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;
    
    const userMessage = { role: 'user', text: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const userInfo = localStorage.getItem('userInfo');
      const token = userInfo ? JSON.parse(userInfo).token : null;
      const API_URL = import.meta.env.VITE_API_URL || '';
      const historyToSend = messages.slice(1); // Exclude the initial greeting
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ message: messageText, history: historyToSend })
      });

      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      
      setMessages(prev => [...prev, { role: 'assistant', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: 'Error connecting to the server.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <MessageSquare className="text-yellow-500" size={32} />
        <h2 className="text-2xl font-bold text-white">Chat With Data</h2>
      </div>

      <div className="flex-1 glass-card p-6 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`p-4 max-w-[80%] border ${msg.role === 'user' ? 'bg-yellow-500/20 border-yellow-500/30 rounded-2xl rounded-tr-none' : 'bg-white/10 border-white/5 rounded-2xl rounded-tl-none'}`}>
                <p className="text-gray-200 whitespace-pre-wrap">{msg.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl rounded-tl-none p-4 border border-white/5 flex items-center gap-2">
                 <Loader className="animate-spin text-yellow-500" size={16} />
                 <p className="text-gray-400 text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="mt-4 pt-4 border-t border-white/10">
          <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
            {['What is my best performing pair?', 'Why did I lose on Friday?', 'Summarize my week'].map((prompt) => (
              <button key={prompt} onClick={() => handleSend(prompt)} disabled={loading} className="whitespace-nowrap px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs text-gray-300 transition-colors flex items-center gap-1 disabled:opacity-50">
                <Sparkles size={12} className="text-yellow-500" />
                {prompt}
              </button>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask a question..."
              className="w-full bg-black/40 border border-white/20 rounded-xl py-4 pl-4 pr-12 text-white focus:outline-none focus:border-yellow-500/50 disabled:opacity-50"
            />
            <button type="submit" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors disabled:opacity-50">
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatWithData;
