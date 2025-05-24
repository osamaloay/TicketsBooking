import React from 'react';
import './Button.css';

export const Button = ({ 
    children, 
    variant = 'primary', 
    size = 'medium',
    isLoading = false,
    disabled = false,
    onClick,
    type = 'button',
    fullWidth = false
}) => {
    return (
        <button
            className={`custom-button ${variant} ${size} ${fullWidth ? 'full-width' : ''}`}
            onClick={onClick}
            disabled={disabled || isLoading}
            type={type}
        >
            {isLoading ? (
                <div className="button-spinner"></div>
            ) : children}
        </button>
    );
};


