// API Configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Other configuration constants can be added here
export const APP_NAME = 'TicketNest';
export const APP_VERSION = '1.0.0';

// Auth configuration
export const AUTH_TOKEN_KEY = 'auth_token';
export const AUTH_USER_KEY = 'auth_user';

// API endpoints
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/auth/verify-otp',
    SEND_OTP: '/auth/send-otp'
  },
  EVENTS: {
    ALL: '/events/all',
    CREATE: '/events',
    PENDING: '/events/pending',
    APPROVE: (id) => `/events/${id}/approve`,
    REJECT: (id) => `/events/${id}/reject`
  },
  TICKETS: {
    BASE: '/tickets',
    USER: '/tickets/user',
    PURCHASE: '/tickets/purchase'
  },
  ADMIN: {
    STATS: '/admin/stats',
    USERS: '/admin/users',
    EVENTS: '/admin/events'
  }
};
