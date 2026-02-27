import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = 'https://employee-api-wcak.onrender.com/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token on every request
api.interceptors.request.use(async (config) => {
    try {
        const token = await SecureStore.getItemAsync('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } catch (e) {
        // SecureStore may fail on some environments
    }
    return config;
});

// Rewrite any localhost URLs in responses
api.interceptors.response.use((response) => {
    if (response.data) {
        try {
            const json = JSON.stringify(response.data);
            if (json.includes('localhost:5000')) {
                response.data = JSON.parse(
                    json.replace(/https?:\/\/localhost:5000/g, 'https://employee-api-wcak.onrender.com')
                );
            }
        } catch (e) { }
    }
    return response;
});

export default api;
