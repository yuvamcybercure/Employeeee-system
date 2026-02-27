import axios from 'axios';

const getBaseURL = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;

    // Fallback for local network access
    if (typeof window !== 'undefined') {
        const hostname = window.location.hostname;
        if (hostname !== 'localhost' && hostname !== '127.0.0.1') {
            return `http://${hostname}:5000/api`;
        }
    }
    return 'http://localhost:5000/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Attach token from localStorage on every request
api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Rewrite localhost URLs in API responses to the actual backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

api.interceptors.response.use((response) => {
    if (response.data && BACKEND_URL) {
        try {
            const json = JSON.stringify(response.data);
            if (json.includes('localhost:5000')) {
                response.data = JSON.parse(
                    json.replace(/https?:\/\/localhost:5000/g, BACKEND_URL)
                );
            }
        } catch (e) {
            // If stringify/parse fails, leave data as-is
        }
    }
    return response;
});

export default api;
