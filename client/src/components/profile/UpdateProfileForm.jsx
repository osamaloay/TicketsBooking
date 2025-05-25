// client/src/components/profile/UpdateProfileForm.jsx
import React, { useState } from 'react';
import { userService } from '../../services/api';
import { toast } from 'react-toastify';
import './ProfilePage.css';

const UpdateProfileForm = ({ user, onCancel }) => {
    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        profilePicture: null,
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        if (e.target.name === 'profilePicture') {
            setFormData({
                ...formData,
                profilePicture: e.target.files[0],
            });
        } else {
            setFormData({
                ...formData,
                [e.target.name]: e.target.value,
            });
        }
    };

    const validate = () => {
        if (!formData.name.trim()) {
            toast.error('Name is required');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(formData.email)) {
            toast.error('Invalid email address');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('email', formData.email);
            if (formData.profilePicture) {
                formDataToSend.append('profilePicture', formData.profilePicture);
            }
            
            const response = await userService.updateUserProfile(formDataToSend);
            console.log('Update response:', response);
            toast.success('Profile updated successfully!');
            if (onCancel) onCancel();
            window.location.reload(); // To reflect changes in AuthContext
        } catch (error) {
            console.error('Update error:', error);
            toast.error(error?.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="profile-form" onSubmit={handleSubmit}>
            <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                />
            </div>
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="off"
                />
            </div>
            <div className="form-group">
                <label htmlFor="profilePicture">Profile Picture</label>
                <input
                    id="profilePicture"
                    type="file"
                    name="profilePicture"
                    onChange={handleChange}
                    accept="image/*"
                />
            </div>
            <div className="form-actions">
                <button type="submit" disabled={loading} className="update-button">
                    {loading ? 'Updating...' : 'Update'}
                </button>
                <button type="button" className="cancel-btn" onClick={onCancel}>
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default UpdateProfileForm;