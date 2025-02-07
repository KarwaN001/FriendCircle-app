import AsyncStorage from '@react-native-async-storage/async-storage';

// Token management
export const setToken = async (token) => {
    try {
        await AsyncStorage.setItem('token', token);
    } catch (error) {
        console.error('Error storing token:', error);
        throw error;
    }
};

export const getToken = async () => {
    try {
        return await AsyncStorage.getItem('token');
    } catch (error) {
        console.error('Error getting token:', error);
        throw error;
    }
};

// User management
export const setUser = async (user) => {
    try {
        await AsyncStorage.setItem('user', JSON.stringify(user));
    } catch (error) {
        console.error('Error storing user:', error);
        throw error;
    }
};

export const getUser = async () => {
    try {
        const userStr = await AsyncStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error getting user:', error);
        throw error;
    }
};

// Clear all auth data (for logout)
export const clearAuthData = async () => {
    try {
        await AsyncStorage.multiRemove(['token', 'user']);
    } catch (error) {
        console.error('Error clearing auth data:', error);
        throw error;
    }
}; 