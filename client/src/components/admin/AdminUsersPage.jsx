import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { LoadingSpinner } from '../shared/LoadingSpinner';
import { ErrorMessage } from '../shared/ErrorMessage';
import { FaUserShield, FaUserTie, FaUserCircle, FaEdit, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to fetch users');
        } finally {
            setLoading(false);
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await userService.updateUserRole(userId, newRole);
            await fetchUsers(); // Refresh the users list
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('Are you sure you want to delete this user?')) {
            return;
        }
        try {
            await userService.deleteUser(userId);
            await fetchUsers(); // Refresh the users list
            setError(null);
        } catch (err) {
            setError(err.message || 'Failed to delete user');
        }
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'admin':
                return <FaUserShield />;
            case 'organizer':
                return <FaUserTie />;
            default:
                return <FaUserCircle />;
        }
    };

    if (loading) return <LoadingSpinner />;
    if (error) return <ErrorMessage message={error} />;

    return (
        <div className="admin-users-container">
            <div className="admin-users-header">
                <h2>Manage Users</h2>
            </div>
            <div className="users-table">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user._id}>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <div className="role-badge">
                                        {getRoleIcon(user.role)}
                                        <select 
                                            value={user.role}
                                            onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                                            className="role-select"
                                        >
                                            <option value="Standard User">Standard User</option>
                                            <option value="Organizer">Organizer</option>
                                            <option value="System Admin">System Admin</option>
                                        </select>
                                    </div>
                                </td>
                                <td>
                                    <span className={`user-status status-${user.isActive ? 'active' : 'inactive'}`}>
                                        {user.isActive ? <FaCheckCircle /> : <FaTimesCircle />}
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="actions-cell">
                                    <button className="edit-btn" title="Edit User">
                                        <FaEdit />
                                    </button>
                                    <button 
                                        className="delete-btn" 
                                        onClick={() => handleDeleteUser(user._id)}
                                        title="Delete User"
                                    >
                                        <FaTrash />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminUsersPage; 