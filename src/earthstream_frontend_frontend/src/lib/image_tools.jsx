export const compressImage = async (file, maxSizeKB = 200) => {
    const maxSize = maxSizeKB * 1024;
    
    if (file.size <= maxSize) {
      return file;
    }
  
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
  
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  
    let width = img.width;
    let height = img.height;
    let quality = 0.9;
    let compressed;
  
    do {
      if (width > 1024) {
        const ratio = 1024 / width;
        width = 1024;
        height = Math.round(height * ratio);
      }
  
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
  
      compressed = await new Promise(resolve => 
        canvas.toBlob(blob => resolve(blob), 'image/jpeg', quality)
      );
  
      quality -= 0.1;
    } while (compressed.size > maxSize && quality > 0.1);
  
    console.log('Compression result:', {
      originalSize: file.size,
      compressedSize: compressed.size,
      quality: quality + 0.1
    });
  
    return compressed;
  };