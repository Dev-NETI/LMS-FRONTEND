export interface User {
  id: number;
  username?: string;
  name: string;
  email: string;
  f_name?: string;
  l_name?: string;
  user_type?: 'admin' | 'trainee' | 'instructor'; // Optional field to distinguish user types
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  loginAdmin: (credentials: LoginCredentials) => Promise<void>;
  loginInstructor: (credentials: LoginCredentials) => Promise<void>;
  logout: (userType?: 'admin' | 'trainee' | 'instructor') => Promise<void>;
  loading: boolean;
  isAuthenticated: boolean;
}