import Axios from 'axios';
import Cookies from 'js-cookie';

const axios = Axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
    },
    withCredentials: true,
    withXSRFToken: true
});

// Add token to requests for authenticated endpoints
axios.interceptors.request.use((config) => {
    const token = Cookies.get('auth_token');
    const isLoginRequest = config.url?.includes('/login');
    
    // Add Bearer token for authenticated requests (not login)
    if (token && !isLoginRequest) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
});

// Handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            const isLoginRequest = error.config?.url?.includes('/login');
            
            if (!isLoginRequest) {
                // Clear auth data and redirect
                Cookies.remove('auth_token');
                Cookies.remove('user');
                
                const currentPath = window.location.pathname;
                if (currentPath.startsWith('/admin')) {
                    window.location.href = '/admin/auth/login';
                } else {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
