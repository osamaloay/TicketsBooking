import React from 'react'
import { BrowserRouter as Router } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastContainer } from 'react-toastify'

// Import all necessary styles
import 'react-toastify/dist/ReactToastify.css'  // Toast notifications
import './styles/variables.css'                 // CSS variables
import './styles/global.css'                    // Global styles
import './components/shared/Button.css'         // Button styles
import './components/shared/LoadingSpinner.css' // Loading spinner styles
import './components/auth/AuthForms.css'        // Auth form styles

// Import routes
import AppRoutes from './routes'

const App = () => {
    return (
        <Router>
            <AuthProvider>
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
            </AuthProvider>
        </Router>
    )
}

export default App
