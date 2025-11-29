import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: false, // Using token-based authentication, not sessions
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

// Add Bearer token for API authentication and CSRF for login
api.interceptors.request.use(
  async (config) => {
    const token = Cookies.get('auth_token');
    const isLoginRequest = config.url?.includes('/login');
    
    if (isLoginRequest) {
      // For login requests, add CSRF protection
      config.withCredentials = true;
      
      // Get CSRF token
      const xsrfToken = Cookies.get('XSRF-TOKEN');
      if (!xsrfToken) {
        // Initialize CSRF if not available
        try {
          await initializeCSRF();
          const newXsrfToken = Cookies.get('XSRF-TOKEN');
          if (newXsrfToken) {
            const decodedToken = decodeURIComponent(newXsrfToken);
            config.headers['X-XSRF-TOKEN'] = decodedToken;
          }
        } catch (error) {
          console.warn('Failed to initialize CSRF:', error);
        }
      } else {
        const decodedToken = decodeURIComponent(xsrfToken);
        config.headers['X-XSRF-TOKEN'] = decodedToken;
      }
    } else if (token) {
      // For authenticated requests, add Bearer token
      config.headers.Authorization = `Bearer ${token}`;
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
  async (error) => {
    if (error.response?.status === 419) {
      // CSRF token mismatch - try to refresh and retry once for login requests
      const isLoginRequest = error.config?.url?.includes('/login');
      
      if (isLoginRequest) {
        try {
          await initializeCSRF();
          // Retry the original request
          const originalConfig = error.config;
          if (originalConfig && !originalConfig._retry) {
            originalConfig._retry = true;
            originalConfig.withCredentials = true;
            const xsrfToken = Cookies.get('XSRF-TOKEN');
            if (xsrfToken) {
              originalConfig.headers['X-XSRF-TOKEN'] = decodeURIComponent(xsrfToken);
            }
            return api.request(originalConfig);
          }
        } catch (retryError) {
          console.error('Failed to retry login request after CSRF refresh:', retryError);
        }
      }
    }
    
    if (error.response?.status === 401) {
      // Don't redirect to login if this is a login attempt failure
      const isLoginRequest = error.config?.url?.includes('/login');
      
      if (!isLoginRequest) {
        // Clear token and user data, redirect to appropriate login based on current route
        Cookies.remove('auth_token');
        Cookies.remove('user');
        if (typeof window !== 'undefined') {
          const currentPath = window.location.pathname;
          if (currentPath.startsWith('/admin')) {
            window.location.href = '/admin/auth/login';
          } else {
            window.location.href = '/login';
          }
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;