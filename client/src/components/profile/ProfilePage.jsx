// client/src/components/profile/ProfilePage.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import UpdateProfileForm from './UpdateProfileForm';
import { FaUser, FaEnvelope, FaIdBadge, FaSignOutAlt } from 'react-icons/fa';
import { authService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, role } = useAuth();
    const [editing, setEditing] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await authService.logout();
            // Clear all cookies
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            // Clear local storage
            localStorage.clear();
            // Clear session storage
            sessionStorage.clear();
            // Navigate to home page
            navigate('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    if (!user) {
        return <div className="profile-loading">Loading profile...</div>;
    }

    console.log('User:', user);
    console.log('Profile Picture:', user.profilePicture);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h2>My Profile</h2>
                <div className="profile-actions">
                    {!editing && (
                        <button className="edit-button" onClick={() => setEditing(true)}>
                            Edit Profile
                        </button>
                    )}
                    <button className="logout-button" onClick={handleLogout}>
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>
            {editing ? (
                <UpdateProfileForm user={user} onCancel={() => setEditing(false)} />
            ) : (
                <div className="profile-card">
                    <div className="profile-avatar">
                        {user.profilePicture && user.profilePicture.url ? (
                            <img src={user.profilePicture.url} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                        ) : (
                            <FaUser />
                        )}
                    </div>
                    <div className="profile-details">
                        <div className="profile-item">
                            <span className="icon"><FaUser /></span>
                            <div>
                                <label>Name</label>
                                <p>{user.name}</p>
                            </div>
                        </div>
                        <div className="profile-item">
                            <span className="icon"><FaEnvelope /></span>
                            <div>
                                <label>Email</label>
                                <p>{user.email}</p>
                            </div>
                        </div>
                        <div className="profile-item">
                            <span className="icon"><FaIdBadge /></span>
                            <div>
                                <label>Role</label>
                                <p>{role}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;