import React from 'react';
import './ConfirmationDialog.css';

const ConfirmationDialog = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content confirmation-dialog">
                <h3>{title}</h3>
                <p>{message}</p>
                
                <div className="modal-actions">
                    <button className="cancel-btn" onClick={onCancel}>
                        Cancel
                    </button>
                    <button className="confirm-btn" onClick={onConfirm}>
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationDialog; 