import { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, Key } from 'lucide-react';

const Settings = () => {
  const [user, setUser] = useState({ name: '', email: '' });
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      const userData = parsed.user || parsed;
      setUser({
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || 'Trader',
        email: userData.email || '',
        apiKey: userData.apiKey || 'Hidden for security',
      });
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-1">Settings</h2>
        <p className="text-gray-400 text-sm">Manage your account preferences and security</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-8">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 space-y-2">
          {[
            { id: 'profile', label: 'Profile', icon: <User size={18} /> },
            { id: 'security', label: 'Security', icon: <Lock size={18} /> },
            { id: 'api', label: 'API Keys', icon: <Key size={18} /> },
            { id: 'notifications', label: 'Notifications', icon: <Bell size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === tab.id
                  ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/30'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {tab.icon}
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 glass-card p-8">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Personal Information</h3>
              
              <div className="flex items-center gap-6 mb-8">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white border-2 border-white/10 shadow-lg">
                  {user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors mb-2">
                    Change Avatar
                  </button>
                  <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input type="text" disabled value={user.name} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white opacity-70 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" disabled value={user.email} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white opacity-70 cursor-not-allowed" />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Security Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none" />
                </div>
                <button className="mt-4 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors">
                  Update Password
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10">
                <h4 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2"><Shield size={18} /> Danger Zone</h4>
                <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors font-bold">
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">API Configuration</h3>
              <p className="text-sm text-gray-400 mb-6">Use your API key to access EmoTradeLog services from external applications like MetaTrader 5.</p>
              
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Your API Key</label>
                <div className="flex gap-2">
                  <input type="text" readOnly value={user.apiKey} className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-yellow-500 font-mono text-sm" />
                  <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors">
                    Copy
                  </button>
                </div>
                <p className="text-xs text-yellow-500/70 mt-3">Warning: Do not share your API key with anyone.</p>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Notification Preferences</h3>
              
              <div className="space-y-4">
                {[
                  { title: 'Trade Alerts', desc: 'Get notified when MT5 trades sync.' },
                  { title: 'Weekly Reports', desc: 'Receive AI performance reports every Sunday.' },
                  { title: 'Community Mentions', desc: 'Get notified when someone mentions you in the Lounge.' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                    </div>
                    <div className="w-12 h-6 bg-yellow-500 rounded-full relative cursor-pointer">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
