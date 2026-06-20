import React from 'react'

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'danger'
}

export const GlassButton: React.FC<GlassButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'secondary', 
  ...props 
}) => {
  return (
    <button className={`glass-btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  )
}
