import React, { useState } from 'react';
import './UpdateUserRoleModal.css';

const UpdateUserRoleModal = ({ user, onClose, onUpdate }) => {
    const [selectedRole, setSelectedRole] = useState(user.role);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(user._id, selectedRole);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Update User Role</h3>
                <p>Current user: {user.name}</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="role">Select New Role:</label>
                        <select
                            id="role"
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                        >
                            <option value="user">User</option>
                            <option value="organizer">Organizer</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="cancel-btn" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="update-btn">
                            Update Role
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateUserRoleModal; 