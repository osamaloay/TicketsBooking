import React from 'react';
import './UserRow.css';

const UserRow = ({ user, onUpdateRole, onDelete }) => {
    return (
        <tr className="user-row">
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>
                <span className={`role-badge ${user.role.toLowerCase()}`}>
                    {user.role}
                </span>
            </td>
            <td className="actions-cell">
                <button 
                    className="update-role-btn"
                    onClick={onUpdateRole}
                >
                    Update Role
                </button>
                <button 
                    className="delete-btn"
                    onClick={onDelete}
                >
                    Delete
                </button>
            </td>
        </tr>
    );
};

export default UserRow; 