import React from 'react';
import { lato as fontFamily } from "../fonts/fonts";

const Field = ({ 
  label, 
  type = 'text',
  placeholder = '',
  value,
  onChange,
  required = false,
  error = '',
  width = '100%',
  labelPosition = 'top',
  labelWidth = 'auto',
  min,
  max,
  step = 1,
  rows = 4,
  maxLength,
  hint
}) => {
  const styles = {
    container: {
      marginBottom: '1rem',
      width: width,
      display: labelPosition === 'left' ? 'flex' : 'block',
      alignItems: labelPosition === 'left' ? 'flex-start' : 'stretch', // Changed to flex-start
      gap: labelPosition === 'left' ? '0.5rem' : '0'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: labelPosition === 'top' ? '0.25rem' : '0',
      marginTop: labelPosition === 'left' ? '0.25rem' : '0',
      color: error ? '#DC2626' : '#374151',
      width: labelPosition === 'left' ? labelWidth : 'auto',
      fontFamily: fontFamily
    },
    inputWrapper: {
      flexGrow: 1,
      width: labelPosition === 'left' ? 'calc(100% - 1rem - ' + (typeof labelWidth === 'string' ? labelWidth : labelWidth + 'px') + ')' : '100%'
    },
    input: {
      width: '100%',
      padding: '0.5rem 0.75rem',
      border: `1px solid ${error ? '#DC2626' : '#D1D5DB'}`,
      borderRadius: '0.375rem',
      fontSize: '0.9rem',
      outline: 'none',
      resize: type === 'textarea' ? 'vertical' : 'none',
      fontFamily: fontFamily
    },
    error: {
      marginTop: '0.25rem',
      fontSize: '0.875rem',
      color: '#DC2626',
      fontFamily: fontFamily
    },
    hint: {
      marginTop: '0.25rem',
      fontSize: '0.75rem',
      color: '#6B7280',
      fontFamily: fontFamily
    },
    required: {
      marginLeft: '0.25rem',
      color: '#DC2626'
    },
    charCount: {
      textAlign: 'right',
      fontSize: '0.75rem',
      color: '#6B7280',
      marginTop: '0.25rem',
      fontFamily: fontFamily
    }
  };

  
  const validateDiscordHandle = (handle) => {
    if (handle.length < 2 || handle.length > 32) {
      return 'Username must be between 2 and 32 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(handle)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const validateNumber = (num) => {
    const numValue = Number(num);
    
    if (isNaN(numValue)) {
      return 'Please enter a valid number';
    }
    
    if (min !== undefined && numValue < min) {
      return `Minimum value is ${min}`;
    }
    
    if (max !== undefined && numValue > max) {
      return `Maximum value is ${max}`;
    }
    
    return '';
  };

  const validateYouTubeUrl = (url) => {
    if (!url) return '';
    
    // Match various YouTube URL formats
    const regExp = /^(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\S+)?$/;
    
    if (!regExp.test(url)) {
      return 'Please enter a valid YouTube URL';
    }
    return '';
  };

  const handleChange = (e) => {
    const newValue = e.target.value;
    let validationError = '';
    
    switch (type) {
      case 'discord':
        validationError = validateDiscordHandle(newValue);
        break;
      case 'number':
        validationError = validateNumber(newValue);
        break;
      case 'video':
        validationError = validateYouTubeUrl(newValue);
        break;
      default:
        break;
    }
    if (type === 'number' && newValue !== '') {
      onChange({ target: { value: Number(newValue), error: validationError }});
    } else {
      onChange({ target: { value: newValue, error: validationError }});
    }
  };

  const getPlaceholder = () => {
    if (type === 'discord') return 'discord username';
    if (type === 'number') return placeholder || '0';
    if(type === 'video') return 'YouTube URL';
    return placeholder;
  };

  const getHint = () => {
    if (type === 'discord' && !hint) {
      return 'Enter your Discord username (e.g., "gamergirl" or "cryptodev")';
    }
    if (type === 'number') {
      const hints = [];
      if (min !== undefined) hints.push(`Minimum: ${min}`);
      if (max !== undefined) hints.push(`Maximum: ${max}`);
      return hints.length > 0 ? hints.join(' • ') : null;
    }
    if(type==='video' && !hint) return 'Enter the URL of the YouTube video';
    return hint;
  };

  const renderInput = () => {
    const commonProps = {
      value,
      onChange: handleChange,
      placeholder: getPlaceholder(),
      style: styles.input,
      maxLength
    };

    if (type === 'textarea') {
      return (
        <>
          <textarea
            {...commonProps}
            rows={rows}
          />
          {maxLength && (
            <div style={styles.charCount}>
              {value.length}/{maxLength} characters
            </div>
          )}
        </>
      );
    }

    return (
      <input
        {...commonProps}
        type={type === 'discord' ? 'text' : type}
        maxLength={type === 'discord' ? 32 : undefined}
        min={type === 'number' ? min : undefined}
        max={type === 'number' ? max : undefined}
        step={type === 'number' ? step : undefined}
      />
    );
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      <div style={styles.inputWrapper}>
        {renderInput()}
        {error && (
          <p style={styles.error}>{error}</p>
        )}
        {getHint() && (
          <p style={styles.hint}>{getHint()}</p>
        )}
      </div>
    </div>
  );
};

export default Field;