import React, { useState, useEffect } from 'react';
import { userService } from '../../services/api';
import { toast } from 'react-toastify';
import UserRow from './UserRow';
import UpdateUserRoleModal from './UpdateUserRoleModal';
import ConfirmationDialog from './ConfirmationDialog';
import './AdminUsersPage.css';

const AdminUsersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await userService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await userService.updateUserRole(userId, newRole);
            toast.success('User role updated successfully');
            fetchUsers(); // Refresh the users list
            setShowRoleModal(false);
        } catch (error) {
            console.error('Error updating user role:', error);
            toast.error('Failed to update user role');
        }
    };

    const handleDeleteUser = async (userId) => {
        try {
            await userService.deleteUser(userId);
            toast.success('User deleted successfully');
            fetchUsers(); // Refresh the users list
            setShowDeleteDialog(false);
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error('Failed to delete user');
        }
    };

    if (loading) {
        return (
            <div className="admin-users-loading">
                <div className="loading-spinner"></div>
                <p>Loading users...</p>
            </div>
        );
    }

    return (
        <div className="admin-users-container">
            <div className="admin-users-header">
                <h2>User Management</h2>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <UserRow
                                key={user._id}
                                user={user}
                                onUpdateRole={() => {
                                    setSelectedUser(user);
                                    setShowRoleModal(true);
                                }}
                                onDelete={() => {
                                    setSelectedUser(user);
                                    setShowDeleteDialog(true);
                                }}
                            />
                        ))}
                    </tbody>
                </table>
            </div>

            {showRoleModal && selectedUser && (
                <UpdateUserRoleModal
                    user={selectedUser}
                    onClose={() => setShowRoleModal(false)}
                    onUpdate={handleUpdateRole}
                />
            )}

            {showDeleteDialog && selectedUser && (
                <ConfirmationDialog
                    title="Delete User"
                    message={`Are you sure you want to delete ${selectedUser.name}?`}
                    onConfirm={() => handleDeleteUser(selectedUser._id)}
                    onCancel={() => setShowDeleteDialog(false)}
                />
            )}
        </div>
    );
};

export default AdminUsersPage; 