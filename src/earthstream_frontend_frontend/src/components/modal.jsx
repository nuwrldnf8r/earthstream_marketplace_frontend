import React from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  const styles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 50,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    backdrop: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(4px)',
      WebkitBackdropFilter: 'blur(4px)' // For Safari support
    },
    modalContainer: {
      position: 'relative',
      width: '800px',
      height: '600px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)',
      zIndex: 51
    },
    closeButton: {
      position: 'absolute',
      right: '16px',
      top: '16px',
      padding: '4px',
      background: 'none',
      border: 'none',
      borderRadius: '50%',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    closeButtonHover: {
      backgroundColor: '#f3f4f6'
    },
    content: {
      padding: '24px',
      height: '100%',
      overflow: 'auto'
    }
  };

  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div style={styles.overlay}>
      <div 
        style={styles.backdrop}
        onClick={onClose}
      />
      <div style={styles.modalContainer}>
        <button
          onClick={onClose}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...styles.closeButton,
            ...(isHovered ? styles.closeButtonHover : {})
          }}
        >
          <X size={20} color="#6b7280" />
        </button>
        <div style={styles.content}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal