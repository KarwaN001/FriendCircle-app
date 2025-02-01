import { storage } from '../utils/storage';

const API_URL = "http://192.168.1.200:8000/api";

const api = {
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      if (data.token) {
        await storage.setToken(data.token);
        if (data.user) {
          await storage.setUser(data.user);
        }
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      console.log(data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
      
      if (data.token) {
        await storage.setToken(data.token);
        if (data.user) {
          await storage.setUser(data.user);
        }
      }
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  async logout() {
    try {
      const token = await storage.getToken();
      const response = await fetch(`${API_URL}/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Logout failed');
      }
      
      await storage.clearAll();
      return data;
    } catch (error) {
      throw error;
    }
  },

  async getUser() {
    try {
      const token = await storage.getToken();
      const response = await fetch(`${API_URL}/user`, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user data');
      }
      
      await storage.setUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default api; 