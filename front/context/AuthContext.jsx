import React, { createContext, useState, useContext, useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import api from '../apis/api';
import { storage } from '../utils/storage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
 //test tset
  // Check for stored token on startup
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = await storage.getToken();
      if (token) {
        // Token exists, try to get user data
        const userData = await api.getUser();
        setUser(userData);
      }
    } catch (error) {
      // If there's an error (invalid token, etc), clear storage
      await storage.clearAll();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      const response = await api.login(credentials);
      if (response.user) {
        setUser(response.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    try {
      // First clear the user state
      setUser(null);
      // Then clear storage and call API
      await storage.clearAll();
      await api.logout();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API call fails, we want to ensure user is logged out locally
      setUser(null);
      await storage.clearAll();
    }
  };

  const register = async (userData) => {
    const response = await api.register(userData);
    setUser(response.user);
    return response;
  };

  const value = {
    user,
    login,
    logout,
    register,
    isLoading,
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 