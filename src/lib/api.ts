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
    const isTraineeRequest = config.url?.includes('/api/trainee');
    const isAdminRequest = config.url?.includes('/api/admin');
    const isInstructorRequest = config.url?.includes('/api/instructor');
    
    // For trainee requests, use pure token authentication (no credentials/CSRF)
    if (isTraineeRequest) {
        config.withCredentials = true;
        config.withXSRFToken = true;
        
        // Add Bearer token for authenticated trainee requests (not login)
        if (token && !isLoginRequest) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Remove CSRF token header if it exists
        delete config.headers['X-CSRF-TOKEN'];
        delete config.headers['X-Xsrf-Token'];
    } else if (isAdminRequest) {
        // For admin requests, enable credentials and CSRF
        config.withCredentials = true;
        config.withXSRFToken = true;
        
        // Add Bearer token for authenticated admin requests (not login)
        if (token && !isLoginRequest) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    } else if (isInstructorRequest) {
        // For instructor requests, use token authentication like trainee
        config.withCredentials = true;
        config.withXSRFToken = true;
        
        // Add Bearer token for authenticated instructor requests (not login)
        if (token && !isLoginRequest) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        
        // Remove CSRF token header if it exists
        delete config.headers['X-CSRF-TOKEN'];
        delete config.headers['X-Xsrf-Token'];
    } else {
        // For other requests (like CSRF cookie), enable credentials
        config.withCredentials = true;
        
        // Add Bearer token if available and not login
        if (token && !isLoginRequest) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    
    return config;
});

// Handle 401 errors
axios.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            const isLoginRequest = error.config?.url?.includes('/login');
            
            if (!isLoginRequest) {
                // Clear auth data and redirect
                Cookies.remove('auth_token');
                Cookies.remove('user');
                Cookies.remove('last_validation');
                
                const currentPath = window.location.pathname;
                if (currentPath.startsWith('/admin')) {
                    window.location.href = '/admin/auth/login';
                } else if (currentPath.startsWith('/instructor')) {
                    window.location.href = '/instructor/auth/login';
                } else {
                    window.location.href = '/login';
                }
            }
        }
        return Promise.reject(error);
    }
);

export default axios;
