import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false,
});

// Initialize CSRF protection
export const initializeCSRF = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/sanctum/csrf-cookie`, {
      withCredentials: true,
    });
    
    return response;
  } catch (error) {
    console.warn('CSRF initialization failed:', error instanceof Error ? error.message : 'Unknown error');
    throw error; // Re-throw so we know initialization failed
  }
};

// Add Bearer token to requests
api.interceptors.request.use(
  async (config) => {
    // Add Bearer token for authentication (except login)
    const token = Cookies.get('auth_token');
    const isLoginRequest = config.url?.includes('/login');
    
    if (token && !isLoginRequest) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add CSRF token only for login request
    if (isLoginRequest && config.method?.toLowerCase() === 'post') {
      config.withCredentials = true; // Enable cookies for login
      const xsrfToken = Cookies.get('XSRF-TOKEN');
      if (xsrfToken) {
        const decodedToken = decodeURIComponent(xsrfToken);
        config.headers['X-XSRF-TOKEN'] = decodedToken;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Don't redirect to login if this is a login attempt failure
      const isLoginRequest = error.config?.url?.includes('/login');
      
      if (!isLoginRequest) {
        // Clear session data and redirect to login only for authenticated routes
        Cookies.remove('auth_token');
        Cookies.remove('user');
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;