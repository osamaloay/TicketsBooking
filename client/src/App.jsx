import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'
import { EventProvider } from './context/EventContext'
import { BookingProvider } from './context/BookingContext'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

// Import all necessary styles
import 'react-toastify/dist/ReactToastify.css'  // Toast notifications
import './styles/variables.css'                 // CSS variables
import './styles/global.css'                    // Global styles
import './components/shared/Button.css'         // Button styles
import './components/shared/LoadingSpinner.css' // Loading spinner styles
import './components/auth/AuthForms.css'        // Auth form styles

// Import routes
import AppRoutes from './routes'

// Initialize Stripe with proper error handling
const stripePromise = (async () => {
    try {
        const publicKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
        if (!publicKey) {
            console.error('Stripe public key is not defined in environment variables');
            return null;
        }
        return loadStripe(publicKey);
    } catch (error) {
        console.error('Error initializing Stripe:', error);
        return null;
    }
})();

const App = () => {
    return (
        <Router>
            <AuthProvider>
                <EventProvider>
                    <BookingProvider>
                        <Elements stripe={stripePromise}>
                            <main className="app-container">
                                <AppRoutes />
                                <ToastContainer
                                    position="top-right"
                                    autoClose={5000}
                                    hideProgressBar={false}
                                    newestOnTop
                                    closeOnClick
                                    rtl={false}
                                    pauseOnFocusLoss
                                    draggable
                                    pauseOnHover
                                    theme="dark"
                                />
                            </main>
                        </Elements>
                    </BookingProvider>
                </EventProvider>
            </AuthProvider>
        </Router>
    )
}

export default App
