// src/components/Common/Badge.jsx
import React from 'react';
import styles from './Badge.module.css';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'medium', 
  className = '', 
  onClick, 
  ...props 
}) => {
  const baseClass = styles.badge;
  const variantClass = styles[`badge${variant.charAt(0).toUpperCase() + variant.slice(1)}`];
  const sizeClass = styles[`badge${size.charAt(0).toUpperCase() + size.slice(1)}`];
  
  return (
    <span
      className={`${baseClass} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;