import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor for debugging
api.interceptors.request.use(
    (config) => {
        console.log('Request:', {
            url: config.url,
            method: config.method,
            data: config.data,
            headers: config.headers
        });
        return config;
    },
    (error) => {
        console.error('Request Error:', error);
        return Promise.reject(error);
    }
);

// Add response interceptor for debugging
api.interceptors.response.use(
    (response) => {
        console.log('Response:', {
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.error('Response Error:', {
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

// handle error
const handleError = (error) => {
    if (error.response) {
        // Server responded with a status outside 2xx
        const message = error.response.data?.message || error.response.data?.error || 'Something went wrong';
        console.error('API Error:', {
            status: error.response.status,
            message,
            data: error.response.data
        });
        return Promise.reject(message);
    } else if (error.request) {
        // No response received
        console.error('No Response Error:', error.request);
        return Promise.reject('No response from server');
    } else {
        // Other errors
        console.error('Other Error:', error.message);
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
            console.log('Raw bookings response:', response); // Debug log
            if (!response.data) {
                throw new Error('No data received from server');
            }
            return Array.isArray(response.data) ? response.data : [];
        } catch (error) {
            console.error('Error in getUserBookings:', error);
            if (error.response?.status === 403) {
                throw new Error(`Access denied: ${error.response.data.message}`);
            }
            throw handleError(error);
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
    createBooking: async (bookingData) => {
        try {
            if (!bookingData.event || !bookingData.user || !bookingData.numberOfTickets || !bookingData.paymentMethodId) {
                throw new Error('Missing required booking information');
            }

            console.log('Creating booking with data:', {
                event: bookingData.event,
                user: bookingData.user,
                numberOfTickets: bookingData.numberOfTickets,
                paymentMethodId: bookingData.paymentMethodId
            });

            const response = await api.post('/bookings/', {
                event: bookingData.event,
                user: bookingData.user,
                numberOfTickets: bookingData.numberOfTickets,
                paymentMethodId: bookingData.paymentMethodId
            });

            if (!response.data) {
                throw new Error('No data received from server');
            }

            return response.data;
        } catch (error) {
            console.error('Booking creation error:', {
                error,
                response: error.response?.data,
                status: error.response?.status
            });

            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            } else if (error.response?.data?.error) {
                throw new Error(error.response.data.error);
            } else if (error.message) {
                throw new Error(error.message);
            } else {
                throw new Error('Failed to create booking. Please try again.');
            }
        }
    },

    getBookingById: async (id) => {
        try {
            if (!id) {
                throw new Error('Booking ID is required');
            }

            const response = await api.get(`/bookings/${id}`);
            
            if (!response.data) {
                throw new Error('No data received from server');
            }

            return response.data;
        } catch (error) {
            console.error('Get booking error:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to fetch booking details. Please try again.');
        }
    },

    cancelBooking: async (id) => {
        try {
            if (!id) {
                throw new Error('Booking ID is required');
            }

            const response = await api.delete(`/bookings/${id}`);
            
            if (!response.data) {
                throw new Error('No data received from server');
            }

            return response.data;
        } catch (error) {
            console.error('Cancel booking error:', error);
            if (error.response?.data?.message) {
                throw new Error(error.response.data.message);
            }
            throw new Error('Failed to cancel booking. Please try again.');
        }
    }
};

export const eventService = {
    // Get all approved events (public)
    getAllApprovedEvents: async () => {
        try {
            const response = await api.get('/events');
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    // Search events (public)
    searchEvents: async (searchParams) => {
        try {
            const response = await api.get('/events/search', {
                params: searchParams
            });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    // Get event by ID (public)
    getEventById: async (id) => {
        try {
            const response = await api.get(`/events/${id}`);
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    // Create new event (protected - Organizer only)
    createEvent: async (eventData) => {
        try {
            const response = await api.post('/events', eventData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    // Get all events (protected - Admin only)
    getAllEvents: async () => {
        try {
            console.log('Fetching all events...');
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Authentication required');
            }

            const response = await api.get('/events/all', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Events fetched successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error fetching all events:', error);
            if (error.response?.status === 403) {
                throw new Error('Access denied. Only System Admins can view all events.');
            }
            throw handleError(error);
        }
    },

    // Update event (protected - Organizer/Admin)
    updateEvent: async (id, eventData) => {
        try {
            const response = await api.put(`/events/${id}`, eventData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            return handleError(error);
        }
    },

    // Delete event (protected - Organizer/Admin)
    deleteEvent: async (id) => {
        try {
            const response = await api.delete(`/events/${id}`);
            return response.data;
        } catch (error) {
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