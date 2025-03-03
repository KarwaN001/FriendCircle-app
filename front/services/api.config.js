import axios from 'axios';
import { getToken } from './storage';
import { Platform } from 'react-native';

//php artisan serve --host=192.168.1.200 --port=5000
//for table update : php artisan migrate
const API_URL = Platform.select({
    android: "http://192.168.224.4:5000/api",
    //android: "http://192.168.1.200:8000/api",
    // android: "http://192.168.174.51:8000/api",
    ios: "http://localhost:8000/api",
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
            const token = await getToken();
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