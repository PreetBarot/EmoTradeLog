import { create } from 'zustand';

const useTradeStore = create((set, get) => ({
  trades: [],
  isLoading: false,
  error: null,

  fetchTrades: async () => {
    set({ isLoading: true });
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/trades`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        set({ trades: data, isLoading: false });
      } else {
        set({ error: data.message, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  addTrade: async (tradeData) => {
    set({ isLoading: true });
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/trades`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(tradeData)
      });
      const data = await res.json();
      if (res.ok) {
        set((state) => ({ trades: [data, ...state.trades], isLoading: false }));
        return data;
      } else {
        set({ error: data.message, isLoading: false });
        throw new Error(data.message);
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateTrade: async (id, updateData) => {
    set({ isLoading: true });
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/trades/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      if (res.ok) {
        set((state) => ({
          trades: state.trades.map(t => t._id === id ? data : t),
          isLoading: false
        }));
        return data;
      } else {
        set({ error: data.message, isLoading: false });
        throw new Error(data.message);
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteTrade: async (id) => {
    set({ isLoading: true });
    try {
      const userInfo = localStorage.getItem('userInfo');
      if (!userInfo) return;
      const { token } = JSON.parse(userInfo);

      const API_URL = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${API_URL}/api/trades/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (res.ok) {
        set((state) => ({
          trades: state.trades.filter(t => t._id !== id),
          isLoading: false
        }));
      } else {
        const data = await res.json();
        set({ error: data.message, isLoading: false });
      }
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  }
}));

export default useTradeStore;
