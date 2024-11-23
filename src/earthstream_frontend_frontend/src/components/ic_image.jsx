import React, { useState, useEffect } from 'react';
import { Loader, ImageOff } from 'lucide-react';
import { icpService } from '../services/icp_service';

const ICImage = ({
  fileId,
  alt = "IC Image",
  className = "",
  width = "auto",
  height = "auto",
  containerStyle = {},
  imageStyle = {},
  onError = () => {},
  loadingConfig = {
    size: 24,
    color: '#3b82f6',
    text: 'Loading...'
  }
}) => {
  const [state, setState] = useState({
    imageUrl: null,
    loading: true,
    error: null,
    attempted: false  // Track if we've attempted to load
  });

  useEffect(() => {
    let mounted = true;
    
    // Only attempt to fetch if we haven't tried yet and have a fileId
    if (!state.attempted && fileId) {
      const fetchImage = async () => {
        try {
          const url = await icpService.fetchImage(fileId);
          if (mounted) {
            setState({
              imageUrl: url,
              loading: false,
              error: null,
              attempted: true
            });
          }
        } catch (err) {
          console.error('Failed to fetch image:', err);
          if (mounted) {
            setState({
              imageUrl: null,
              loading: false,
              error: 'Unable to load image',
              attempted: true
            });
            onError(err);
          }
        }
      };

      fetchImage();
    }

    return () => {
      mounted = false;
      if (state.imageUrl) {
        URL.revokeObjectURL(state.imageUrl);
      }
    };
  }, [fileId]); // Only depend on fileId, not state

  if (!fileId) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          borderRadius: '4px',
          padding: '12px',
          textAlign: 'center',
          ...containerStyle,
        }}
      >
        <ImageOff size={24} style={{ marginBottom: '8px' }} />
        <span style={{ fontSize: '14px' }}>No image specified</span>
      </div>
    );
  }

  if (state.loading) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px',
          backgroundColor: '#f9fafb',
          borderRadius: '4px',
          ...containerStyle,
        }}
      >
        <Loader
          size={loadingConfig.size}
          className="animate-spin"
          color={loadingConfig.color}
        />
        {loadingConfig.text && (
          <span style={{
            marginTop: '8px',
            fontSize: '14px',
            color: '#6b7280',
          }}>
            {loadingConfig.text}
          </span>
        )}
      </div>
    );
  }

  if (state.error || !state.imageUrl) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100px',
          backgroundColor: '#f3f4f6',
          color: '#6b7280',
          borderRadius: '4px',
          padding: '12px',
          textAlign: 'center',
          ...containerStyle,
        }}
      >
        <ImageOff size={24} style={{ marginBottom: '8px' }} />
        <span style={{ fontSize: '14px' }}>Image unavailable</span>
      </div>
    );
  }

  return (
    <div
      style={{
        width,
        height,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...containerStyle,
      }}
    >
      <img
        src={state.imageUrl}
        alt={alt}
        className={className}
        style={{
          width,
          height,
          objectFit: 'cover',
          display: 'block',
          ...imageStyle,
        }}
        onError={() => {
          setState(prev => ({
            ...prev,
            error: 'Unable to load image',
            loading: false,
            attempted: true
          }));
          onError(new Error('Failed to load image'));
        }}
      />
    </div>
  );
};

export default ICImage;