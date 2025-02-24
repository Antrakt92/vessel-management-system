import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('API URL configured as:', API_URL);

// Create a new axios instance with default config
const instance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('Making request to:', config.baseURL + config.url);
    return config;
  },
  error => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
instance.interceptors.response.use(
  response => {
    console.log('Response received:', {
      status: response.status,
      url: response.config.url
    });
    return response;
  },
  error => {
    console.error('Response error:', {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });

    if (error.response?.status === 401) {
      console.log('Unauthorized access, redirecting to login');
      localStorage.removeItem('authToken');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export default instance;
