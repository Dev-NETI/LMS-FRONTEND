import axios from '@/lib/api';
import Cookies from 'js-cookie';

// Initialize CSRF protection
export const csrf = () => axios.get('/sanctum/csrf-cookie');

// Auth service for clean authentication
export const authService = {
  // Initialize CSRF before making authenticated requests
  async initCSRF() {
    try {
      await csrf();
    } catch (error) {
      console.error('CSRF initialization failed:', error);
      throw error;
    }
  },

  // Admin login
  async loginAdmin(email: string, password: string) {
    await this.initCSRF();
    const response = await axios.post('/api/admin/login', { email, password });
    
    // Store token for subsequent requests
    if (response.data.token) {
      Cookies.set('auth_token', response.data.token, {
        expires: 1/24, // 1 hour
        secure: false,
        sameSite: 'lax',
      });
    }
    
    return response.data;
  },

  // Trainee login (token-based, no CSRF needed)
  async loginTrainee(email: string, password: string) {
    await this.initCSRF();
    const response = await axios.post('/api/trainee/login', { email, password });
    
    // Store token for subsequent requests
    if (response.data.token) {
      Cookies.set('auth_token', response.data.token, {
        expires: 1/24, // 1 hour
        secure: false,
        sameSite: 'lax',
      });
    }
    
    return response.data;
  },

  async loginInstructor(email: string, password: string) {
    await this.initCSRF();
    const response = await axios.post('/api/instructor/login', { email, password });
    
    // Store token for subsequent requests
    if (response.data.token) {
      Cookies.set('auth_token', response.data.token, {
        expires: 1/24, // 1 hour
        secure: false,
        sameSite: 'lax',
      });
    }
    
    return response.data;
  },

  // Get current user (admin)
  async getAdminUser() {
    const response = await axios.get('/api/admin/me');
    return response.data;
  },

  // Get current user (trainee)
  async getTraineeUser() {
    const response = await axios.get('/api/trainee/me');
    return response.data;
  },

  // Admin logout
  async logoutAdmin() {
    const response = await axios.post('/api/admin/logout');
    // Clear stored token
    Cookies.remove('auth_token');
    return response.data;
  },

  // Trainee logout
  async logoutTrainee() {
    const response = await axios.post('/api/trainee/logout');
    // Clear stored token
    Cookies.remove('auth_token');
    return response.data;
  },

  // Instructor logout
  async logoutInstructor() {
    const response = await axios.post('/api/instructor/logout');
    // Clear stored token
    Cookies.remove('auth_token');
    return response.data;
  },
};