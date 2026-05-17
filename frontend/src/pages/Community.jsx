import { useState, useEffect, useRef } from 'react';
import { Users, Send, Loader, Image as ImageIcon, X, Trash2 } from 'lucide-react';

const Community = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const fileInputRef = useRef(null);
  
  const messagesEndRef = useRef(null);

  const fetchMessages = async (showLoader = false) => {
    try {
      if (showLoader) setLoading(true);
      const userInfo = localStorage.getItem('userInfo');
      const token = userInfo ? JSON.parse(userInfo).token : null;
      if (userInfo) {
        setCurrentUserId(JSON.parse(userInfo)._id);
      }
      
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/community/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages(true);
    
    const interval = setInterval(() => {
      fetchMessages(false);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    
    try {
      const userInfo = localStorage.getItem('userInfo');
      const token = userInfo ? JSON.parse(userInfo).token : null;
      const API_URL = import.meta.env.VITE_API_URL || '';
      
      const response = await fetch(`${API_URL}/api/community/messages/${messageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        // Optimistically remove from UI
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
      } else {
        alert("Failed to delete message");
      }
    } catch (error) {
      console.error("Failed to delete message:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedImage) || sending || uploadingImage) return;

    setSending(true);
    try {
      const userInfo = localStorage.getItem('userInfo');
      const token = userInfo ? JSON.parse(userInfo).token : null;
      const API_URL = import.meta.env.VITE_API_URL || '';
      
      let imageUrl = null;
      
      // Upload image first if selected
      if (selectedImage) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', selectedImage);
        
        const uploadRes = await fetch(`${API_URL}/api/upload`, {
          method: 'POST',
          body: formData, // Don't set Content-Type header when using FormData
        });
        
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        } else {
          console.error("Image upload failed");
          setUploadingImage(false);
          setSending(false);
          return;
        }
        setUploadingImage(false);
      }
      
      const response = await fetch(`${API_URL}/api/community/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ text: newMessage, imageUrl })
      });
      
      if (response.ok) {
        const savedMessage = await response.json();
        setMessages(prev => [...prev, savedMessage]);
        setNewMessage('');
        clearImage();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setSending(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center gap-3 mb-6">
        <Users className="text-yellow-500" size={32} />
        <div>
          <h2 className="text-2xl font-bold text-white">Traders Lounge</h2>
          <p className="text-gray-400 text-sm">Live Community Chat</p>
        </div>
      </div>
      
      <div className="flex-1 glass-card flex flex-col overflow-hidden relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10 rounded-2xl">
            <Loader className="animate-spin text-yellow-500" size={32} />
          </div>
        ) : null}

        {/* Chat Messages Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && !loading ? (
            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
              Be the first to say hello!
            </div>
          ) : (
            messages.map((msg) => {
              const isMe = currentUserId === msg.user?._id;
              const senderName = msg.user ? `${msg.user.firstName || ''} ${msg.user.lastName || ''}`.trim() || 'Anonymous' : 'Deleted User';
              
              return (
                <div key={msg._id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 mb-1 mr-1">
                    {isMe && (
                      <button 
                        onClick={() => handleDeleteMessage(msg._id)}
                        className="text-gray-500 hover:text-red-500 transition-colors p-1"
                        title="Delete message"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                    <span className="text-xs text-gray-500">
                      {isMe ? 'You' : senderName} • {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <div className={`relative p-3 max-w-[80%] rounded-2xl text-sm flex flex-col gap-2 ${
                    isMe 
                      ? 'bg-yellow-500/20 border border-yellow-500/30 text-white rounded-tr-none' 
                      : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-none'
                  }`}>
                    {msg.imageUrl && (
                      <a href={msg.imageUrl} target="_blank" rel="noopener noreferrer">
                        <img src={msg.imageUrl} alt="Shared in chat" className="max-w-full max-h-[300px] rounded-lg object-contain cursor-pointer hover:opacity-90 transition-opacity" />
                      </a>
                    )}
                    {msg.text && <span>{msg.text}</span>}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input Area */}
        <div className="p-4 border-t border-white/10 bg-black/20 flex flex-col gap-3">
          {imagePreview && (
            <div className="relative inline-block self-start">
              <img src={imagePreview} alt="Preview" className="h-20 rounded-lg border border-white/20" />
              <button 
                onClick={clearImage}
                className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1 text-white hover:bg-red-600"
              >
                <X size={14} />
              </button>
            </div>
          )}
          <form onSubmit={handleSendMessage} className="relative flex gap-2 items-center">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageSelect}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={sending || uploadingImage}
              className="p-3 text-gray-400 hover:text-yellow-500 bg-white/5 hover:bg-white/10 rounded-xl transition-colors disabled:opacity-50"
            >
              <ImageIcon size={20} />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={sending || uploadingImage}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3 pl-4 pr-4 text-white focus:outline-none focus:border-yellow-500/50 disabled:opacity-50"
            />
            <button 
              type="submit" 
              disabled={(!newMessage.trim() && !selectedImage) || sending || uploadingImage}
              className="p-3 bg-yellow-500 text-black rounded-xl hover:bg-yellow-400 transition-colors disabled:opacity-50 flex items-center justify-center min-w-[50px]"
            >
              {sending || uploadingImage ? <Loader size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Community;
