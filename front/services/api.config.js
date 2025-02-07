import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Use 10.0.2.2 for Android emulator and localhost for iOS
const API_URL = Platform.select({
    android: "http://10.0.2.2:8001/api",
    ios: "http://127.0.0.1:8000/api",
});

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
    timeout: 10000, // Add timeout of 10 seconds
});

// Add a request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        } catch (error) {
            return Promise.reject(error);
        }
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor with better error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ECONNABORTED') {
            // Handle timeout error
            console.error('Request timed out');
        } else if (!error.response) {
            // Network error
            console.error('Network error - make sure your API is running and reachable');
        } else {
            // Handle other errors
            console.error('API error:', error.response?.data);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance; 