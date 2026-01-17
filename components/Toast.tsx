'use client';

import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  duration?: number;
  onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeStyles = {
    success: {
      bg: 'rgba(0, 255, 0, 0.2)',
      border: '#00ff00',
      text: '#00ff00',
    },
    error: {
      bg: 'rgba(255, 0, 0, 0.2)',
      border: '#ff0000',
      text: '#ff0000',
    },
    info: {
      bg: 'rgba(0, 255, 255, 0.2)',
      border: '#00ffff',
      text: '#00ffff',
    },
  };

  const styles = typeStyles[type];

  return (
    <div
      className="toast"
      role="alert"
      aria-live="polite"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: styles.bg,
        border: `2px solid ${styles.border}`,
        color: styles.text,
        padding: '16px 24px',
        borderRadius: '4px',
        fontFamily: "'Courier New', monospace",
        fontSize: '14px',
        zIndex: 10000,
        boxShadow: `0 0 20px ${styles.border}`,
        animation: 'slideIn 0.3s ease-out',
        maxWidth: '400px',
      }}
    >
      {message}
    </div>
  );
}
