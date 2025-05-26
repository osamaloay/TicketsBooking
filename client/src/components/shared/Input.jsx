import React from 'react';
import './Input.css';

const Input = ({ 
    type = 'text',
    value,
    onChange,
    placeholder,
    required = false,
    onKeyPress,
    className = '',
    ...props 
}) => {
    return (
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            onKeyPress={onKeyPress}
            className={`input ${className}`}
            {...props}
        />
    );
};

export default Input; 