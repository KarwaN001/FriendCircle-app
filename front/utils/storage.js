import AsyncStorage from '@react-native-async-storage/async-storage';

const storageKeys = {
  TOKEN: '@friend_circle_token',
  USER: '@friend_circle_user',
};

export const storage = {
  // Token methods
  setToken: async (token) => {
    try {
      if (token) {
        await AsyncStorage.setItem(storageKeys.TOKEN, token);
      }
    } catch (error) {
      console.error('Error saving token:', error);
    }
  },

  getToken: async () => {
    try {
      return await AsyncStorage.getItem(storageKeys.TOKEN);
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // User methods
  setUser: async (user) => {
    try {
      const jsonValue = JSON.stringify(user);
      await AsyncStorage.setItem(storageKeys.USER, jsonValue);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  },

  getUser: async () => {
    try {
      const jsonValue = await AsyncStorage.getItem(storageKeys.USER);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Clear all data
  clearAll: async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(storageKeys));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}; 