import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authService.getProfile(token);
          setUser(userData);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      return response;
    } catch (error) {
      console.error('Registration error in context:', error);
      throw error;
    }
  };

  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      if (response.token) {
        localStorage.setItem('token', response.token);
        setUser(response.user);
      }
      return response;
    } catch (error) {
      console.error('Login error in context:', error);
      throw error;
    }
  };

  const verifyLoginOTP = async (email, otp) => {
    try {
      console.log('Verifying OTP for:', email);
      const response = await authService.verifyLoginOTP(email, otp);
      console.log('OTP verification response:', response);
      
      if (response.token) {
        localStorage.setItem('token', response.token);
        console.log('User data:', response.user);
        setUser(response.user);
      } else {
        console.error('No token in response:', response);
        throw new Error('No token received from server');
      }
      return response;
    } catch (error) {
      console.error('OTP verification error in context:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      localStorage.removeItem('token');
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      const response = await authService.updateProfile(updatedUserData, localStorage.getItem('token'));
      setUser(response);
      return response;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    register,
    login,
    verifyLoginOTP,
    logout,
    updateUser
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext; 