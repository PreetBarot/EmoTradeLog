import { useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, CheckSquare, ImagePlus, Save, Frown, Meh, Smile, Target, Brain, ArrowRight, Activity, BarChart2, Plus, Clock, PlayCircle, Trash2 } from 'lucide-react';
import useTradeStore from '../store/useTradeStore';
import { useEffect } from 'react';



const Journal = () => {
  const { trades, fetchTrades, isLoading } = useTradeStore();
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  useEffect(() => {
    if (selectedTrade) {
      setFormData({
        preTradeAnalysis: selectedTrade.preTradeAnalysis || '',
        postTradeReview: selectedTrade.postTradeReview || '',
        emotions: selectedTrade.emotion || '',
        lessonsLearned: selectedTrade.lessonsLearned || '',
        tags: selectedTrade.tags ? selectedTrade.tags.join(', ') : '',
        screenshots: selectedTrade.screenshots || [],
        checklist: selectedTrade.checklist || [],
      });
      setRating(selectedTrade.rating || 5);
    }
  }, [selectedTrade]);

  const journaledTrades = trades.filter(t => t.status === 'Journaled');
  const pendingTrades = trades.filter(t => t.status === 'Pending');

  const filteredTrades = activeTab === 'All' ? trades 
    : activeTab === 'Journaled' ? journaledTrades 
    : pendingTrades;

  const handleSave = async () => {
    if (!selectedTrade) return;
    try {
      await useTradeStore.getState().updateTrade(selectedTrade._id, {
        status: 'Journaled',
        preTradeAnalysis: formData.preTradeAnalysis,
        postTradeReview: formData.postTradeReview,
        emotion: formData.emotions,
        lessonsLearned: formData.lessonsLearned,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        rating: Number(rating),
        screenshots: formData.screenshots,
        checklist: formData.checklist,
      });
      alert('Trade journal saved!');
      setSelectedTrade(prev => ({...prev, status: 'Journaled'}));
    } catch (err) {
      alert('Failed to save trade: ' + err.message);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileData = new FormData();
    fileData.append('image', file);

    setIsUploading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        body: fileData,
      });
      const data = await res.json();
      
      setFormData(prev => ({
        ...prev,
        screenshots: [...(prev.screenshots || []), data.url]
      }));
    } catch (err) {
      alert('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const checklistItems = [
    'Checked higher timeframe',
    'Risk within limits',
    'Fits my trading plan',
    'Key levels identified',
    'Economic calendar checked'
  ];

  const handleToggleChecklist = (item) => {
    setFormData(prev => {
      const currentList = prev.checklist || [];
      if (currentList.includes(item)) {
        return { ...prev, checklist: currentList.filter(i => i !== item) };
      } else {
        return { ...prev, checklist: [...currentList, item] };
      }
    });
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)]">
      
      {/* Left Column - Trade List */}
      <div className="w-full lg:w-96 flex flex-col glass-card overflow-hidden shrink-0">
        <div className="p-4 border-b border-white/5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-white">Trade Journal</h2>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5"><Activity size={12}/> Live</span>
              <span className="text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/5">{trades.length} entries</span>
            </div>
          </div>
          
          <div className="flex gap-2 p-1 bg-black/40 rounded-lg">
            {[{name: 'All', count: trades.length}, {name: 'Journaled', count: journaledTrades.length}, {name: 'Pending', count: pendingTrades.length}].map(tab => {
              const isActive = activeTab === tab.name;
              return (
                <button
                  key={tab.name}
                  onClick={() => setActiveTab(tab.name)}
                  className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${isActive ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
                >
                  {tab.name} <span className="ml-1 opacity-50">{tab.count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isLoading ? (
             <div className="flex justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div></div>
          ) : trades.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 mt-10">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-white/10">
                <CheckSquare size={24} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">No trades to journal. Sync your broker or add a trade manually.</p>
            </div>
          ) : (
            filteredTrades.map(trade => (
              <div 
                key={trade._id} 
                onClick={() => setSelectedTrade(trade)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedTrade?._id === trade._id ? 'bg-white/10 border-yellow-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-xs shadow-[0_0_10px_rgba(234,179,8,0.2)]">X</div>
                    <span className="font-bold text-white">{trade.symbol}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${trade.status === 'JOURNALED' ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {trade.status}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm mb-2">
                  <span className={`font-bold ${trade.type === 'Long' ? 'text-blue-400' : 'text-orange-400'}`}>{trade.type}</span>
                  <span className="text-gray-400">${trade.entry}</span>
                  <span className={`font-bold ml-auto ${trade.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>${trade.pnl}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>{new Date(trade.date).toLocaleDateString()}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(window.confirm('Are you sure you want to delete this trade?')) {
                        useTradeStore.getState().deleteTrade(trade._id);
                        if (selectedTrade?._id === trade._id) setSelectedTrade(null);
                      }
                    }}
                    className="p-1 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column - Journal Detail */}
      <div className="flex-1 glass-card flex flex-col overflow-hidden relative">
        {!selectedTrade ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
             <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center mb-6 border border-white/10">
                <BookOpen size={40} className="text-gray-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Select a Trade to Journal</h2>
              <p className="text-gray-400 max-w-sm">
                Click on a trade from the list to review it, add screenshots, track your emotions, and get AI coaching.
              </p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-sm shadow-[0_0_10px_rgba(234,179,8,0.2)]">X</div>
                  <h2 className="text-2xl font-bold text-white">{selectedTrade.symbol}</h2>
                  <span className={`text-xs font-bold px-2 py-1 rounded uppercase tracking-wider ${selectedTrade.isWinner ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'}`}>
                    {selectedTrade.isWinner ? 'Winner' : 'Loss'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <span className={`font-bold ${selectedTrade.type === 'Long' ? 'text-blue-400' : 'text-orange-400'}`}>{selectedTrade.type}</span>
                  <span>•</span>
                  <span>Entry ${selectedTrade.entry}</span>
                  <span>•</span>
                  <span>Size {selectedTrade.size}</span>
                  <span>•</span>
                  <span>{new Date(selectedTrade.date).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 transition-colors">
                  <Clock size={18} />
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white font-medium transition-colors">
                  <BarChart2 size={16} /> Analytics
                </button>
                <button 
                  onClick={() => {
                    if(window.confirm('Are you sure you want to delete this trade?')) {
                      useTradeStore.getState().deleteTrade(selectedTrade._id);
                      setSelectedTrade(null);
                    }
                  }}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-red-500/20"
                >
                  <Trash2 size={16} />
                </button>
                <button onClick={handleSave} className="btn-gold py-2 px-6 text-sm flex items-center gap-2">
                  <Save size={16} /> Save
                </button>
              </div>
            </div>

            {/* Scrollable Form Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
              
              <div className="space-y-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    <CheckSquare size={14} /> Pre-Trade Analysis
                  </label>
                  <textarea
                    rows={3}
                    value={formData.preTradeAnalysis || ''}
                    onChange={(e) => setFormData({...formData, preTradeAnalysis: e.target.value})}
                    placeholder="What did you see? Plan, thesis, levels, risk..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 focus:bg-white/5 transition-all resize-none"
                  ></textarea>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    <CheckSquare size={14} className="text-blue-400" /> Post-Trade Review
                  </label>
                  <textarea
                    rows={3}
                    value={formData.postTradeReview || ''}
                    onChange={(e) => setFormData({...formData, postTradeReview: e.target.value})}
                    placeholder="What happened? Execution, slippage, improvements..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-blue-500/50 focus:bg-white/5 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="flex items-center gap-4 border-y border-white/5 py-6">
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <Target size={14} className="text-blue-400" /> Risk : Reward
                </label>
                <div className="flex items-center gap-2">
                  <input type="text" defaultValue="1" className="w-16 bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white focus:outline-none focus:border-blue-500/50" />
                  <span className="text-gray-400 font-bold">:</span>
                  <input type="text" defaultValue="2" className="w-16 bg-white/5 border border-white/10 rounded-lg py-2 text-center text-white focus:outline-none focus:border-blue-500/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    <Smile size={14} className="text-blue-400" /> Emotions
                  </label>
                  <textarea
                    rows={2}
                    value={formData.emotions || ''}
                    onChange={(e) => setFormData({...formData, emotions: e.target.value})}
                    placeholder="Calm, anxious, FOMO, confident..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all resize-none"
                  ></textarea>
                </div>
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    <Brain size={14} className="text-blue-400" /> Lessons Learned
                  </label>
                  <textarea
                    rows={2}
                    value={formData.lessonsLearned || ''}
                    onChange={(e) => setFormData({...formData, lessonsLearned: e.target.value})}
                    placeholder="Key takeaways to repeat or avoid..."
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all resize-none"
                  ></textarea>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div>
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                    <Target size={14} className="text-blue-400" /> Tags
                  </label>
                  <input
                    type="text"
                    value={formData.tags || ''}
                    onChange={(e) => setFormData({...formData, tags: e.target.value})}
                    placeholder="breakout, trend, news (comma separated)"
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-all"
                  />
                </div>
                <div>
                  <label className="flex justify-between items-center mb-3">
                    <span className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      <Target size={14} className="text-blue-400" /> Rating
                    </span>
                    <span className="text-sm font-bold text-white">{rating}/10</span>
                  </label>
                  <div className="pt-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={rating}
                      onChange={(e) => setRating(e.target.value)}
                      className="w-full accent-yellow-500 h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-gray-500 mt-2 font-bold">
                      <span>1</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <CheckSquare size={14} className="text-blue-400" /> Execution Checklist
                  </label>
                  <span className="text-xs font-bold text-gray-500">{(formData.checklist || []).length}/{checklistItems.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {checklistItems.map((item, i) => {
                    const isChecked = (formData.checklist || []).includes(item);
                    return (
                      <label key={i} className="flex items-center gap-3 p-3 bg-white/5 border border-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            className="absolute opacity-0 cursor-pointer w-0 h-0" 
                            checked={isChecked}
                            onChange={() => handleToggleChecklist(item)}
                          />
                          <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-yellow-500 border-yellow-500' : 'border-gray-600 group-hover:border-yellow-500/50'}`}>
                            {isChecked && (
                              <svg className="w-3 h-3 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-300 select-none">{item}</span>
                      </label>
                    );
                  })}
                  <button className="flex items-center gap-3 p-3 border border-dashed border-white/20 rounded-xl hover:border-white/40 hover:bg-white/5 transition-colors text-gray-400 text-sm">
                    <Plus size={16} /> Add custom item...
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
                  <ImagePlus size={14} className="text-blue-400" /> Screenshots
                </label>
                <div className="flex flex-wrap gap-4 mt-2">
                  {formData.screenshots?.map((url, i) => {
                    const imgSrc = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL || ''}${url}`;
                    return (
                      <div key={i} className="relative w-32 h-32 border border-white/10 rounded-xl overflow-hidden">
                        <img src={imgSrc} alt="trade" className="w-full h-full object-cover" />
                      </div>
                    );
                  })}
                  <label className="w-32 h-32 border-2 border-dashed border-white/20 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-yellow-500/50 hover:bg-white/5 transition-colors text-gray-400 group cursor-pointer relative overflow-hidden">
                    {isUploading ? (
                      <span className="text-sm font-medium">Uploading...</span>
                    ) : (
                      <>
                        <Plus size={24} className="group-hover:text-yellow-500 transition-colors" />
                        <span className="text-sm font-medium">Add Image</span>
                        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleImageUpload} accept="image/*" />
                      </>
                    )}
                  </label>
                </div>
              </div>

              {/* Bottom Trade Summary Card */}
              <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-2xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-500 flex items-center justify-center font-bold text-sm">X</div>
                    <h3 className="font-bold text-white text-lg">{selectedTrade.symbol}</h3>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${selectedTrade.type === 'Long' ? 'bg-blue-500/20 text-blue-400' : 'bg-orange-500/20 text-orange-400'}`}>{selectedTrade.type}</span>
                  </div>
                  <div className="flex gap-6">
                    <div>
                      <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Entry</span>
                      <span className="font-bold text-white">${selectedTrade.entry}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Exit</span>
                      <span className="font-bold text-white">${selectedTrade.entry}</span> {/* Placeholder exit */}
                    </div>
                    <div>
                      <span className="block text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">P&L</span>
                      <span className={`font-bold ${selectedTrade.pnl > 0 ? 'text-green-400' : 'text-red-400'}`}>${selectedTrade.pnl}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg text-sm font-bold transition-colors">
                    <BarChart2 size={16} /> Analyze
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-lg text-sm font-bold transition-colors">
                    <PlayCircle size={16} className="text-blue-400" /> Replay
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Journal;
