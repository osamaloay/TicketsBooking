import React, { useState } from 'react';
import { toast } from 'react-toastify';
import adminService from '../../services/adminService';
import './UserRow.css';

const UserRow = ({ user, onUserUpdate, onUserDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleRoleChange = async () => {
    try {
      await adminService.updateUserRole(user.id, selectedRole);
      toast.success('User role updated successfully');
      setIsEditing(false);
      onUserUpdate(); // Trigger parent component to refresh user list
    } catch (error) {
      toast.error(error.message || 'Failed to update user role');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await adminService.deleteUser(user.id);
        toast.success('User deleted successfully');
        onUserDelete(); // Trigger parent component to refresh user list
      } catch (error) {
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  return (
    <tr className="user-row">
      <td className="user-info">
        <div className="user-name">{user.name}</div>
        <div className="user-email">{user.email}</div>
      </td>
      <td className="user-role">
        {isEditing ? (
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="role-select"
          >
            <option value="User">User</option>
            <option value="Organizer">Organizer</option>
            <option value="System Admin">System Admin</option>
          </select>
        ) : (
          <span className="status-badge" data-role={user.role}>
            {user.role}
          </span>
        )}
      </td>
      <td className="user-joined">
        {new Date(user.createdAt).toLocaleDateString()}
      </td>
      <td className="user-actions">
        {isEditing ? (
          <div className="action-buttons-stacked">
            <button 
              className="action-button save"
              onClick={handleRoleChange}
            >
              Save
            </button>
            <button 
              className="action-button cancel"
              onClick={() => {
                setIsEditing(false);
                setSelectedRole(user.role);
              }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="action-buttons-stacked">
            <button 
              className="action-button edit"
              onClick={() => setIsEditing(true)}
            >
              Update Role
            </button>
            <button 
              className="action-button delete"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        )}
      </td>
    </tr>
  );
};

export default UserRow; 