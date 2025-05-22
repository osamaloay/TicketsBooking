// API Configuration
export const API_URL = 'http://localhost:5000/api/v1';

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
    FORGOT_PASSWORD: '/auth/forgotpassword',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_OTP: '/otp/verify',
    SEND_OTP: '/auth/send-otp'
  },
  EVENTS: {
    ALL: '/events',
    CREATE: '/events',
    PENDING: '/events/pending',
    APPROVE: (id) => `/events/${id}/approve`,
    REJECT: (id) => `/events/${id}/reject`,
    DETAILS: (id) => `/events/${id}`
  },
  BOOKINGS: {
    BASE: '/bookings',
    USER: '/bookings/user',
    CREATE: '/bookings'
  },
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    ADMIN_STATS: '/users/admin/stats',
    DETAILS: (id) => `/users/${id}`,
    CREATE: '/users',
    DELETE: (id) => `/users/${id}`
  }
};
