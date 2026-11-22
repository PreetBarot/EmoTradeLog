import { useState, useEffect } from 'react';
import { User, Lock, Bell, Shield, Key, Loader } from 'lucide-react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const BASE_URL = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

const Settings = () => {
  const [user, setUser] = useState({ 
    firstName: '', 
    lastName: '', 
    email: '', 
    apiKey: '', 
    avatar: '',
    notifications: { tradeAlerts: true, weeklyReports: true, communityMentions: true }
  });
  
  const [activeTab, setActiveTab] = useState('profile');
  
  // Profile state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');

  // API State
  const [copyStatus, setCopyStatus] = useState('Copy');

  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      const userData = parsed.user || parsed;
      setUser({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        apiKey: userData.apiKey || 'Hidden for security',
        avatar: userData.avatar || '',
        notifications: userData.notifications || { tradeAlerts: true, weeklyReports: true, communityMentions: true }
      });
      setFirstName(userData.firstName || '');
      setLastName(userData.lastName || '');
    }
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setIsUpdatingProfile(true);
      const uploadRes = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      const imageUrl = uploadRes.data.url;
      
      // Update profile with new avatar
      const updateRes = await axios.put(`${API_URL}/users/profile`, { avatar: imageUrl }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      updateLocalUser(updateRes.data.user);
      alert('Avatar updated successfully!');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Failed to upload avatar.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsUpdatingProfile(true);
      const updateRes = await axios.put(`${API_URL}/users/profile`, { firstName, lastName }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      updateLocalUser(updateRes.data.user);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleNotificationToggle = async (key) => {
    const newNotifications = {
      ...user.notifications,
      [key]: !user.notifications[key]
    };
    
    // Optimistic UI update
    updateLocalUser({ notifications: newNotifications });

    try {
      await axios.put(`${API_URL}/users/profile`, { notifications: newNotifications }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (error) {
      console.error('Error updating notifications:', error);
      alert('Failed to update notifications.');
      // Revert if failed
      updateLocalUser({ 
        notifications: {
          ...user.notifications,
          [key]: !newNotifications[key]
        }
      });
    }
  };

  const handleCopyApi = () => {
    navigator.clipboard.writeText(user.apiKey);
    setCopyStatus('Copied!');
    setTimeout(() => setCopyStatus('Copy'), 2000);
  };

  const updateLocalUser = (updatedUserData) => {
    setUser((prev) => ({ ...prev, ...updatedUserData }));
    
    // Update local storage
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      if (parsed.user) {
        parsed.user = { ...parsed.user, ...updatedUserData };
      } else {
        Object.assign(parsed, updatedUserData);
      }
      localStorage.setItem('userInfo', JSON.stringify(parsed));
    }
  };

  const handleUpdatePassword = async () => {
    setPasswordMessage('');
    if (!currentPassword || !newPassword) {
      setPasswordMessage('Both password fields are required.');
      return;
    }

    try {
      setIsUpdatingPassword(true);
      await axios.put(`${API_URL}/users/password`, { currentPassword, newPassword }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPasswordMessage('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      setPasswordMessage(error.response?.data?.message || 'Failed to update password.');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      try {
        await axios.delete(`${API_URL}/users/account`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        localStorage.removeItem('token');
        localStorage.removeItem('userInfo');
        navigate('/login');
      } catch (error) {
        console.error('Error deleting account:', error);
        alert('Failed to delete account.');
      }
    }
  };

  const notificationOptions = [
    { key: 'tradeAlerts', title: 'Trade Alerts', desc: 'Get notified when MT5 trades sync.' },
    { key: 'weeklyReports', title: 'Weekly Reports', desc: 'Receive AI performance reports every Sunday.' },
    { key: 'communityMentions', title: 'Community Mentions', desc: 'Get notified when someone mentions you in the Lounge.' }
  ];

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
                {user.avatar ? (
                  <img src={user.avatar.startsWith('http') ? user.avatar : `${BASE_URL}${user.avatar}`} alt="Profile" className="w-20 h-20 rounded-full border-2 border-white/10 object-cover shadow-lg" />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center text-3xl font-bold text-white border-2 border-white/10 shadow-lg">
                    {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                  </div>
                )}
                <div>
                  <input type="file" id="avatar-upload" accept="image/*" onChange={handleFileChange} className="hidden" />
                  <label 
                    htmlFor="avatar-upload"
                    className={`inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors mb-2 cursor-pointer ${isUpdatingProfile ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    {isUpdatingProfile && <Loader className="animate-spin" size={14} />} Change Avatar
                  </label>
                  <p className="text-xs text-gray-500">JPG, GIF or PNG. Max size of 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">First Name</label>
                  <input 
                    type="text" 
                    value={firstName} 
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Last Name</label>
                  <input 
                    type="text" 
                    value={lastName} 
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none" 
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" disabled value={user.email} className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white opacity-70 cursor-not-allowed" />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={handleSaveProfile}
                  disabled={isUpdatingProfile || (firstName === user.firstName && lastName === user.lastName)}
                  className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                   {isUpdatingProfile && <Loader className="animate-spin" size={16} />} Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-4">Security Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Current Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">New Password</label>
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:border-yellow-500/50 outline-none" 
                  />
                </div>
                {passwordMessage && (
                  <p className={`text-sm ${passwordMessage.includes('successfully') ? 'text-green-400' : 'text-red-400'}`}>
                    {passwordMessage}
                  </p>
                )}
                <button 
                  onClick={handleUpdatePassword}
                  disabled={isUpdatingPassword}
                  className="flex items-center gap-2 mt-4 px-6 py-3 bg-yellow-500 text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50"
                >
                  {isUpdatingPassword && <Loader className="animate-spin" size={16} />} Update Password
                </button>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10">
                <h4 className="text-lg font-bold text-red-400 mb-2 flex items-center gap-2"><Shield size={18} /> Danger Zone</h4>
                <p className="text-sm text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                <button 
                  onClick={handleDeleteAccount}
                  className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors font-bold"
                >
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
                  <button 
                    onClick={handleCopyApi}
                    className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors min-w-[100px]"
                  >
                    {copyStatus}
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
                {notificationOptions.map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div>
                      <h4 className="font-bold text-white text-sm">{item.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{item.desc}</p>
                    </div>
                    <div 
                      onClick={() => handleNotificationToggle(item.key)}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors duration-300 ${user.notifications?.[item.key] ? 'bg-yellow-500' : 'bg-gray-600'}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 shadow-sm transition-transform duration-300 ${user.notifications?.[item.key] ? 'right-1 translate-x-0' : 'left-1 translate-x-0'}`}></div>
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
