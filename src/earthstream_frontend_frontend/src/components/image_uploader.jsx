import React, { useState, useRef, useCallback } from 'react';
import { X, Upload, Pencil, Trash2, Loader } from 'lucide-react';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { icpService } from '../services/icp_service';
//import { uploadToICP, fetchFromICP } from '../lib/ic_agent';



const defaultErrorMessages = {
  fileType: "Invalid file type. Please upload an image.",
  fileSize: "File size exceeds limit of {size}KB",
  uploadError: "Failed to upload image. Please try again.",
  processingError: "Failed to process image. Please try again.",
  compression: "Failed to compress image. Please try a smaller file.",
  network: "Network error. Please check your connection.",
  upload: "Failed to upload image. Please try again.",
  duplicate: "This image is already being processed.",
  invalidHash: "Failed to generate image hash.",
  serverError: "Server error. Please try again later.",
};

const generateHash = async (file) => {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const compressImage = async (file, maxSizeKB = 200) => {
  const maxSize = maxSizeKB * 1024;
  if (file.size <= maxSize) return file;

  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  
  let quality = 0.9;
  let compressed;
  
  do {
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(bitmap, 0, 0);
    
    compressed = await new Promise(resolve => {
      canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality);
    });
    
    quality -= 0.1;
  } while (compressed.size > maxSize && quality > 0.1);

  return compressed;
};

const styles = {
    container: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
    },
    actionsBar: {
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '8px',
      padding: '8px',
      marginTop: '8px',
    },
    actionButton: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      padding: '6px 12px',
      border: 'none',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.2s ease',
    },
    actionButtonDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    editButton: {
      backgroundColor: '#3b82f6',
      color: 'white',
    },
    deleteButton: {
      backgroundColor: '#ef4444',
      color: 'white',
    },
    uploadArea: {
      border: '2px dashed #ccc',
      borderRadius: '8px',
      padding: '32px',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    uploadAreaDragging: {
      border: '2px dashed #3b82f6',
      backgroundColor: '#eff6ff',
    },
    uploadAreaDisabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    errorMessage: {
      color: '#ef4444',
      fontSize: '14px',
      marginTop: '4px',
      padding: '4px 8px',
      backgroundColor: '#fee2e2',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    loadingOverlay: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modal: {
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      backgroundColor: 'white',
      borderRadius: '8px',
      padding: '24px',
      maxWidth: '90vw',
      maxHeight: '90vh',
      width: 'auto',
      overflow: 'auto',
    },
    gallery: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
      gap: '16px',
      width: '100%',
    },
    galleryItem: {
      position: 'relative',
      width: '100%',
      height: '200px',
      overflow: 'hidden',
      borderRadius: '8px',
      cursor: 'pointer',
    },
    galleryImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    selectedImage: {
      outline: '3px solid #3b82f6',
      outlineOffset: '2px',
    },
    singleImageContainer: {
      width: '100%',
      height: '100%',
      position: 'relative',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    singleImage: {
      maxWidth: '100%',
      maxHeight: '100%',
      width: 'auto',
      height: 'auto',
      objectFit: 'cover',
    },
  };

  const ImageUploader = ({
    aspectRatio = null,
    multiple = false,
    maxFileSize = 200 * 1024,
    onUploadComplete = () => {},
    onUploadError = () => {},
    errorMessages = {},
    style = {},
    thumbnailConfig = {
      width: 50,
      height: 50,
      gap: 16,
      columns: 'auto-fill',
      maxHeight: '300px' 
    },
    loadingConfig = {
      text: 'Processing...',
      spinnerSize: 24,
      overlay: true,
      spinnerColor: '#3b82f6'
    }
  }) => {
    const [images, setImages] = useState([]);
    const [selectedImages, setSelectedImages] = useState(new Set());
    const [isDragging, setIsDragging] = useState(false);
    const [showCropModal, setShowCropModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [imageToEdit, setImageToEdit] = useState(null);
    const [crop, setCrop] = useState();
    const [isProcessing, setIsProcessing] = useState(false);
    const [isCompressing, setIsCompressing] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [processingQueue, setProcessingQueue] = useState(new Map());
    const [errors, setErrors] = useState(new Map());
    
    const fileInputRef = useRef(null);
    const imageRef = useRef(null);
  
    const messages = { ...defaultErrorMessages, ...errorMessages };
    
    const uploadStatuses = {
      PENDING: 'pending',
      UPLOADING: 'uploading',
      SUCCESS: 'success',
      ERROR: 'error'
    };
  
    const handleAsyncOperation = async (operation, errorType, additionalData = {}) => {
      try {
        return await operation();
      } catch (error) {
        const errorMessage = error.message || messages[errorType];
        setErrors(prev => new Map(prev).set(errorType, errorMessage));
        onUploadError({ type: errorType, message: errorMessage, ...additionalData });
        throw error;
      }
    };

    const processFile = useCallback(async (file) => {
        setErrors(new Map());
        setIsCompressing(true);
        
        try {
          const processedFile = await handleAsyncOperation(
            () => compressImage(file, maxFileSize / 1024),
            'compression',
            { fileName: file.name }
          );
    
          const hash = await handleAsyncOperation(
            () => generateHash(processedFile),
            'invalidHash'
          );
          
          if (processingQueue.has(hash)) {
            throw new Error(messages.duplicate);
          }
    
          setProcessingQueue(prev => new Map(prev).set(hash, true));
          
          await handleAsyncOperation(
            () => new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                  setSelectedImage({
                    src: reader.result,
                    naturalWidth: img.naturalWidth,
                    naturalHeight: img.naturalHeight,
                    hash
                  });
                  setShowCropModal(true);
                  resolve();
                };
                img.onerror = () => reject(new Error("Failed to load image"));
                img.src = reader.result;
              };
              reader.onerror = () => reject(new Error("Failed to read file"));
              reader.readAsDataURL(processedFile);
            }),
            'processing'
          );
        } catch (error) {
          if (!error.handled) {
            setErrors(prev => new Map(prev).set('processing', error.message));
            onUploadError({ type: 'processing', message: error.message });
          }
        } finally {
          setIsCompressing(false);
        }
      }, [maxFileSize, onUploadError, processingQueue, messages]);
    
      const handleCropComplete = useCallback(async () => {
        if (!imageRef.current || !crop) return;
      
        setIsUploading(true);
        setProgress(0);
        
        try {
          const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 10, 90));
          }, 200);
      
          // Create canvas element
          const canvas = document.createElement('canvas');
          const cropWidthPx = Math.round(crop.width);
          const cropHeightPx = Math.round(crop.height);
          const cropXPx = Math.round(crop.x);
          const cropYPx = Math.round(crop.y);
      
          canvas.width = cropWidthPx;
          canvas.height = cropHeightPx;
          
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingQuality = 'high';
          
          ctx.drawImage(
            imageRef.current,
            cropXPx,
            cropYPx,
            cropWidthPx,
            cropHeightPx,
            0,
            0,
            cropWidthPx,
            cropHeightPx
          );
      
          const blob = await new Promise(resolve => 
            canvas.toBlob(blob => resolve(blob), 'image/jpeg', 0.9)
          );
      
          if (imageToEdit) {
            const newHash = await generateHash(blob);
            const result = await icpService.uploadImage(blob, newHash);
            
            const editedImage = { 
              ...imageToEdit, 
              preview: result.url,
              hash: result.hash,
              fileId: result.fileId,
              status: uploadStatuses.SUCCESS,
              width: cropWidthPx,
              height: cropHeightPx,
              aspectRatio: cropWidthPx / cropHeightPx
            };
            
            setImages(prev => prev.map(img => 
              img.id === imageToEdit.id ? editedImage : img
            ));
            setImageToEdit(null);
            onUploadComplete(editedImage);
          } else {
            const hash = selectedImage.hash;
            //const result = await uploadToICP(blob, hash);
            const result = await icpService.uploadImage(blob, hash);
            console.log('Upload result:', result);
            
            const newImage = {
              id: Date.now(),
              preview: result.url,
              hash: result.hash,
              fileId: result.fileId,
              status: uploadStatuses.SUCCESS,
              width: cropWidthPx,
              height: cropHeightPx,
              aspectRatio: cropWidthPx / cropHeightPx
            };
      
            if (!multiple) {
              setImages([newImage]);
            } else {
              setImages(prev => [...prev, newImage]);
            }
            
            onUploadComplete(result);
          }
      
          clearInterval(progressInterval);
          setProgress(100);
        } catch (error) {
          console.error('Upload error:', error);
          setErrors(prev => new Map(prev).set('upload', error.message));
          onUploadError(error);
        } finally {
          setProcessingQueue(prev => {
            const next = new Map(prev);
            next.delete(selectedImage.hash);
            return next;
          });
          setIsUploading(false);
          setProgress(0);
          setShowCropModal(false);
        }
      }, [crop, imageToEdit, multiple, selectedImage, images, onUploadComplete, onUploadError, uploadStatuses]);
    

      const handleDrop = useCallback((e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) processFile(file);
      }, [processFile]);
    
      const handleFileSelect = useCallback((e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
        e.target.value = '';
      }, [processFile]);
    
      const onImageLoad = useCallback((e) => {
        if (aspectRatio) {
          const { width, height } = e.currentTarget;
          const initialCrop = {
            unit: 'px',
            x: 0,
            y: 0,
            width: width,
            height: width / aspectRatio
          };
          setCrop(initialCrop);
        }
      }, [aspectRatio]);
    
      const handleImageSelect = useCallback((imageId) => {
        setSelectedImages(prev => {
          const newSelection = new Set(prev);
          if (newSelection.has(imageId)) {
            newSelection.delete(imageId);
          } else {
            if (!multiple) newSelection.clear();
            newSelection.add(imageId);
          }
          return newSelection;
        });
      }, [multiple]);
    
      const handleEdit = useCallback(() => {
        if (selectedImages.size !== 1) return;
        const imageId = Array.from(selectedImages)[0];
        const image = images.find(img => img.id === imageId);
        setImageToEdit(image);
        setSelectedImage({ src: image.preview });
        setShowCropModal(true);
      }, [selectedImages, images]);
    
      const handleDelete = useCallback(() => {
        const imagesToDelete = images.filter(img => selectedImages.has(img.id));
        imagesToDelete.forEach(img => {
          console.log('Marking for deletion:', img.hash);
        });
        
        setImages(prev => prev.filter(img => !selectedImages.has(img.id)));
        setSelectedImages(new Set());
        setErrors(prev => {
          const next = new Map(prev);
          Array.from(selectedImages).forEach(id => next.delete(id));
          return next;
        });
      }, [selectedImages, images]);

      const LoadingOverlay = ({ children, show }) => (
        <div style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          display: show ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <Loader size={loadingConfig.spinnerSize} className="animate-spin" color={loadingConfig.spinnerColor} />
          {children}
        </div>
      );
    
      const ErrorDisplay = ({ errors }) => {
        if (errors.size === 0) return null;
    
        return (
          <div style={{ marginBottom: '16px' }}>
            {Array.from(errors.entries()).map(([type, message]) => (
              <div key={type} style={styles.errorMessage}>
                <X size={14} />
                {message}
                <button 
                  onClick={() => setErrors(prev => {
                    const next = new Map(prev);
                    next.delete(type);
                    return next;
                  })}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    padding: '2px',
                    cursor: 'pointer'
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        );
      };
    
      return (
        <div style={{ ...styles.container, ...style }}>
          <ErrorDisplay errors={errors} />
          
          <div 
            style={{
              ...styles.uploadArea,
              height: style.height ? (multiple ? '50%' : '100%') : 'auto',
              ...(isDragging ? styles.uploadAreaDragging : {}),
              ...(isUploading ? styles.uploadAreaDisabled : {})
            }}
            onDragOver={(e) => {
              e.preventDefault();
              !isUploading && setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => !isUploading && handleDrop(e)}
            onClick={() => !isUploading && (!images.length || multiple) && fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*"
              onChange={handleFileSelect}
              disabled={isUploading}
            />
    
            {!multiple && images.length > 0 ? (
              <div style={{
                ...styles.singleImageContainer,
                position: 'relative'
              }}>
                <img 
                  src={images[0].preview}
                  alt="Uploaded"
                  style={{
                    ...styles.singleImage,
                    ...(selectedImages.has(images[0].id) ? styles.selectedImage : {})
                  }}
                  onClick={() => handleImageSelect(images[0].id)}
                />
                <LoadingOverlay show={isUploading}>
                  <span>{loadingConfig.text}</span>
                  {progress > 0 && (
                    <div style={{
                      width: '80%',
                      height: '4px',
                      backgroundColor: '#e5e7eb',
                      borderRadius: '2px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${progress}%`,
                        height: '100%',
                        backgroundColor: loadingConfig.spinnerColor,
                        transition: 'width 0.2s ease'
                      }} />
                    </div>
                  )}
                </LoadingOverlay>
              </div>
            ) : (
              <div>
                <Upload style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
                <p style={{ margin: '8px 0', color: '#4b5563' }}>
                  Drag and drop or click to upload
                </p>
                <p style={{ margin: 0, fontSize: '14px', color: '#6b7280' }}>
                  Maximum file size: {Math.round(maxFileSize / 1024)}KB
                </p>
              </div>
            )}
          </div>
    
          {multiple && images.length > 0 && (
            <div style={{
              ...styles.gallery,
              gridTemplateColumns: `repeat(${thumbnailConfig.columns}, minmax(${thumbnailConfig.width}px, 1fr))`,
              gap: `${thumbnailConfig.gap}px`,
              maxHeight: thumbnailConfig.maxHeight,
              overflowY: 'auto'
            }}>
              {images.map(image => (
                <div 
                  key={image.id}
                  style={{
                    ...styles.galleryItem,
                    height: thumbnailConfig.height,
                    ...(selectedImages.has(image.id) ? styles.selectedImage : {})
                  }}
                  onClick={() => handleImageSelect(image.id)}
                >
                  <img 
                    src={image.preview}
                    alt="Uploaded"
                    style={styles.galleryImage}
                  />
                  <LoadingOverlay show={isUploading && image.id === imageToEdit?.id}>
                    <span>{loadingConfig.text}</span>
                    {progress > 0 && (
                      <div style={{
                        width: '80%',
                        height: '4px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '2px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${progress}%`,
                          height: '100%',
                          backgroundColor: loadingConfig.spinnerColor,
                          transition: 'width 0.2s ease'
                        }} />
                      </div>
                    )}
                  </LoadingOverlay>
                </div>
              ))}
            </div>
          )}
    
          {selectedImages.size > 0 && (
            <div style={styles.actionsBar}>
              {selectedImages.size === 1 && (
                <button 
                  onClick={handleEdit}
                  style={{
                    ...styles.actionButton,
                    ...styles.editButton,
                    ...(isUploading ? styles.actionButtonDisabled : {})
                  }}
                  disabled={isUploading}
                >
                  <Pencil size={16} />
                  Edit
                </button>
              )}
              <button 
                onClick={handleDelete}
                style={{
                  ...styles.actionButton,
                  ...styles.deleteButton,
                  ...(isUploading ? styles.actionButtonDisabled : {})
                }}
                disabled={isUploading}
              >
                <Trash2 size={16} />
                Delete {selectedImages.size > 1 ? `(${selectedImages.size})` : ''}
              </button>
            </div>
          )}
    
          {showCropModal && selectedImage && (
            <div style={styles.modal}>
              <div style={styles.modalContent}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h3 style={{ margin: 0 }}>Crop Image</h3>
                  <button 
                    onClick={() => {
                      setShowCropModal(false);
                      setImageToEdit(null);
                    }}
                    style={{
                      border: 'none',
                      background: 'none',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <X size={20} />
                  </button>
                </div>
    
                <div style={{ 
                  maxHeight: 'calc(90vh - 200px)',
                  overflow: 'auto',
                  margin: '20px 0'
                }}>
                  <ReactCrop
                    crop={crop}
                    onChange={setCrop}
                    aspect={aspectRatio}
                    style={{ maxWidth: '100%' }}
                  >
                    <img 
                      ref={imageRef}
                      src={selectedImage.src}
                      onLoad={onImageLoad}
                      alt="Crop preview"
                      style={{ maxWidth: '100%' }}
                    />
                  </ReactCrop>
                </div>
    
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <button
                    onClick={() => {
                      setShowCropModal(false);
                      setImageToEdit(null);
                    }}
                    style={{
                      padding: '8px 16px',
                      border: '1px solid #e5e7eb',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer'
                    }}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCropComplete}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Apply'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
    
    export default ImageUploader;



