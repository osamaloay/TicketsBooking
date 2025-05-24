import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignInAlt, FaUserPlus, FaSignOutAlt } from 'react-icons/fa';
import { useState, useRef, useEffect } from 'react';
import './Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          TicketNest
        </Link>
        <div className="nav-links">
          <div className="user-dropdown" ref={dropdownRef}>
            <button 
              className="person-icon"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <FaUser size={20} />
            </button>
            {isDropdownOpen && (
              <div className="dropdown-menu">
                {user ? (
                  <>
                    <div className="dropdown-header">
                      <span className="user-name">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-item">
                      <FaSignOutAlt />
                      <span>Sign Out</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <FaSignInAlt />
                      <span>Sign In</span>
                    </Link>
                    <Link to="/register" className="dropdown-item" onClick={() => setIsDropdownOpen(false)}>
                      <FaUserPlus />
                      <span>Register</span>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 