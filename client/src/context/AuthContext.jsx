import React, { useState, useEffect, createContext, useContext } from 'react';
import api, { authService, userService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const AuthContext = createContext();

const ROLES = {
    ADMIN: 'System Admin',
    ORGANIZER: 'Organizer',
    USER: 'Standard User'
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    
    const [user, setUser] = useState(null);
    const [pendingUser, setPendingUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [resetEmail, setResetEmail] = useState(null);
    const [error, setError] = useState(null);
    const [loginLoading, setLoginLoading] = useState(false);
    const [registerLoading, setRegisterLoading] = useState(false);
    const [verifyLoading, setVerifyLoading] = useState(false);


    // Auto login on reload
    useEffect(() => {
        const restoreUser = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const userData = await userService.getUserProfile();
                    setUser(userData);
                    setRole(userData.role);
                } catch (error) {
                    console.error("Failed to load your data", error);
                    localStorage.removeItem('token');
                }
            }
            setLoading(false);
        };
        restoreUser();
    }, []);

    const register = async (userData) => {
        setRegisterLoading(true);
        try {
            await authService.register(userData);
            // Set pending user and navigate after successful registration
            setPendingUser({ email: userData.email });
            toast.success("Verify your OTP  🎈 ");
            
            // Add a small delay to ensure state is updated
            setTimeout(() => {
                navigate('/verify', { 
                    state: { 
                        type: 'register',
                        email: userData.email 
                    } 
                });
            }, 100);
            
        } catch (error) {
            console.error('Registration error:', error);
            toast.error(error.response?.data?.message || 'Registration failed');
            throw error;
        } finally {
            setRegisterLoading(false);
        }
    };

    const login = async (email, password) => {
        setLoginLoading(true);
        try {
            const response = await api.post('/login', { email, password });
            setPendingUser({ email });
            toast.success("Verify your OTP  🎈 ");
            navigate('/verify', { 
                state: { 
                    type: 'login',
                    email: email 
                } 
            });
            return response.data;
        } catch (error) {
            throw error;
        } finally {
            setLoginLoading(false);
        }
    };

    const verifyOTPLogin = async (otp) => {
        setVerifyLoading(true);
        try {
            if (!pendingUser) throw new Error("No pending user found");
            const response = await authService.verifyOTPLogin({ email: pendingUser.email, otp });
            localStorage.setItem('token', response.token);
            const userData = await userService.getUserProfile();
            setUser(userData);
            setRole(userData.role);
            setPendingUser(null);
            toast.success("Verification completed 🎇 ");
            return response;
        } catch (error) {
            throw error;
        } finally {
            setVerifyLoading(false);
        }
    };

    const verifyOTPRegister = async (otp) => {
        setVerifyLoading(true);
        if (!pendingUser) throw new Error("No pending user found");

        const response = await authService.verifyOTPRegister({ email: pendingUser.email, otp:otp });
        localStorage.setItem('token', response.token);
        const userData = await userService.getUserProfile();
        setUser(userData);
        setRole(userData.role);
        setPendingUser(null);
        toast.success("Verification completed 🎇 ");
        return response;
    };

    const verifyOTPForgotPassword = async ({ email, otp, newPassword }) => {
        setVerifyLoading(true);
        try {
            const response = await authService.verifyOTPForgotPassword({ 
                email, 
                otp,
                newPassword 
            });
            toast.success("Password reset successful! Please login with your new password.");
            navigate('/login');
            return response;
        } catch (error) {
            console.error('OTP verification error:', error);
            toast.error(error.response?.data?.message || 'Verification failed');
            throw error;
        } finally {
            setVerifyLoading(false);
        }
    };

    const logout = async () => {
        try {
            // Call the logout endpoint
            const response = await authService.logout();
            
            // Clear all auth-related state
            localStorage.removeItem('token');
            setUser(null);
            setRole(null);
            setPendingUser(null);
            setError(null);
            
            // Show success message
            toast.success("Logged out successfully!");
            
            // Navigate to login page
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
            toast.error('Failed to logout properly');
            
            // Even if the API call fails, clear local state
            localStorage.removeItem('token');
            setUser(null);
            setRole(null);
            setPendingUser(null);
            navigate('/login');
        }
    };

    const forgotPassword = async (email) => { 
        try {
            console.log('Sending forgot password request for:', email);
            const response = await authService.forgotPassword(email);
            console.log('Got response:', response);
            
            // Set resetEmail state
            setResetEmail(email);
            
            // Show success message
            toast.success("Verify your OTP  🎈 ");
            
            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error(error.response?.data?.message || 'Failed to send OTP');
            throw error;
        }
    };

    const isAuthenticated = !!user;
    const isAdmin = role === ROLES.ADMIN;
    const isOrganizer = role === ROLES.ORGANIZER;
    const isUser = role === ROLES.USER;

    return (
        <AuthContext.Provider
            value={{
                user,
                role,
                pendingUser,
                loading,
                error,
                loginLoading,
                registerLoading,
                verifyLoading,
                isAuthenticated,
                isAdmin,
                isOrganizer,
                isUser,
                register,
                login,
                verifyOTPLogin,
                verifyOTPRegister,
                verifyOTPForgotPassword,
                forgotPassword,
                logout,
                setError
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
