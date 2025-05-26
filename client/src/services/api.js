import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials : true 
    
});
    
// handle error
const handleError = (error) => {
    if (error.response) {
      // Server responded with a status outside 2xx
      return Promise.reject(error.response.data.message || 'Something went wrong');
    } else if (error.request) {
      // No response received
      return Promise.reject('No response from server');
    } else {
      // Other errors
      return Promise.reject(error.message);
    }
  };

// Auth services
export const authService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/login', { email, password });
            console.log('Login API response:', response);
            return response;
        } catch (error) {
            console.error('Login API error:', error);
            throw error;
        }
    },
    register: async (userData) => {
        try {
            const response = await api.post('/register', userData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
    logout: async () => {
        try {
            const response = await api.get('/logout');
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    forgotPassword: async (email) => {
        try {
            const response = await api.post('/forgotpassword', { email });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    verifyOTPLogin: async (otpData) => {
        try {
            const response = await api.post('/otp/verify/login', otpData);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    verifyOTPRegister: async (otpData) => {
        try {
            const response = await api.post('/otp/verify/register', otpData);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    verifyOTPForgotPassword: async ({ email, otp, newPassword }) => {
        try {
            const response = await api.post('/otp/verify/forgot', { 
                email, 
                otp, 
                newPassword 
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};


export const userService = {
     // get all users done ✅
   getAllUsers: async () => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (error) {
        return handleError(error);
    }
   },
   // get current user profile done ✅
    getUserProfile: async () => {
        try {
            const response = await api.get('/users/profile');
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // update current user profile done ✅
    updateUserProfile: async (userData) => {
        try {
            const response = await api.put('/users/profile', userData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {   
            return handleError(error);
        }
    },
    // get details of a specific user done ✅
    getUserDetails: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // update user role done ✅
    updateUserRole: async (id, role) => {
        try {
            const response = await api.put(`/users/${id}`, { role });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // delete user done ✅
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    
  
    // get current user bookings done ✅
    getUserBookings: async () => {
        try {
            const response = await api.get('/users/booking');
            return response.data;
        } catch (error) {
            if (error.response?.status === 403) {
                throw new Error(`Access denied: ${error.response.data.message}`);
            }
            return handleError(error);
        }
    },
   // get organizer events done ✅
   getOrganizerEvents: async () => {
    try {
        const response = await api.get('/users/events');
        return response.data;
    } catch (error) {
        return handleError(error);
    }
   },
   // get organizer events analytics done ✅
   getOrganizerEventsAnalytics: async () => {
    try {
        const response = await api.get('/users/events/analytics');
        return response.data;
    } catch (error) {
        return handleError(error);
    }
   }, 


  
};

export const bookingService = {
    // create booking done ✅
    createBooking: async (bookingData) => {
        try {
            const response = await api.post('/bookings/', {
                event: bookingData.event,
                user: bookingData.user,
                numberOfTickets: bookingData.numberOfTickets,
                paymentMethodId: bookingData.paymentMethodId
            });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // get booking by id done ✅
    getBookingById: async (id) => {
        try {
            const response = await api.get(`/bookings/${id}`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // cancel booking by id done ✅
    cancelBooking: async (id) => {
        try {
            const response = await api.delete(`/bookings/${id}`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    }
  
};
export const eventService = {
    // create new event by organizer done ✅
    createEvent: async (formData) => {
        try {
            const response = await api.post('/events', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // get list of approved events done ✅
    getAllApprovedEvents: async () => {
        try {
            const response = await api.get('/events/');
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // get list of all events (admin only) done ✅
    getAllEvents: async () => {
        try {
            const response = await api.get('/events/all');
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // get details of an event by id done ✅
    getEventById: async (id) => {
        try {
            const response = await api.get(`/events/${id}`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // update event details by admin or organizer done ✅
    updateEvent: async (id, formData) => {
        try {
            const response = await api.put(`/events/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },
    // DELETE event by id (admin or organizer only ) done ✅ 
    deleteEventById : async (id) => { 
        try { 
            const response = await api.delete(`/events/${id}`); 
            return response.data; 
        }
        catch (error){
            return handleError(error);
        }
    } 
}; 

export const stripeService = {
    getPublicKey: async () => {
        try {
            const response = await api.get('/stripe/public-key');
            console.log('Stripe public key response:', response.data);
            
            if (!response.data?.publicKey) {
                console.error('Invalid response format:', response.data);
                throw new Error('Invalid Stripe public key response');
            }
            
            const publicKey = response.data.publicKey;
            
            // Validate the public key format
            if (!publicKey.startsWith('pk_test_') && !publicKey.startsWith('pk_live_')) {
                console.error('Invalid public key format:', publicKey);
                throw new Error('Invalid Stripe public key format');
            }
            
            return publicKey;
        } catch (error) {
            console.error('Error fetching Stripe public key:', error);
            throw new Error('Failed to initialize payment system');
        }
    }
};

// Add response interceptor for token validation
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token is invalid or expired
            localStorage.removeItem('token');
            localStorage.removeItem('redirectAfterLogin');
            window.location.href = '/';
        }
        return Promise.reject(error);
    }
);

// Add request interceptor to include token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default api; 