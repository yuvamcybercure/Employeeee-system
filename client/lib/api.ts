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

function rewriteUrls(obj: any): any {
    if (!obj || !BACKEND_URL) return obj;
    if (typeof obj === 'string') {
        if (obj.includes('localhost:5000')) {
            return obj.replace(/https?:\/\/localhost:5000/g, BACKEND_URL);
        }
        return obj;
    }
    if (Array.isArray(obj)) return obj.map(rewriteUrls);
    if (typeof obj === 'object') {
        const result: any = {};
        for (const key in obj) {
            result[key] = rewriteUrls(obj[key]);
        }
        return result;
    }
    return obj;
}

api.interceptors.response.use((response) => {
    if (response.data) {
        response.data = rewriteUrls(response.data);
    }
    return response;
});

export default api;
