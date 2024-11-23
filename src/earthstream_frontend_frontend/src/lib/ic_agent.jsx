import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { IDL } from '@dfinity/candid';

// Create the agent with proper fetch binding
const agent = new HttpAgent({
  host: "https://icp0.io",
  fetch: window.fetch.bind(window)
});

// If running locally, fetch root key
if (process.env.NODE_ENV !== "production") {
  agent.fetchRootKey().catch(console.error);
}

// Canister ID
const canisterId = "gguso-caaaa-aaaak-ao6qa-cai";

const idlFactoryImages = ({ IDL }) => {
  const DownloadResult = IDL.Variant({
    'Ok' : IDL.Record({
      mime_type: IDL.Text,
      file: IDL.Vec(IDL.Nat8),
    }),
    'Err' : IDL.Text,
  });
  const FileId = IDL.Vec(IDL.Nat8);
  const UploadResult = IDL.Variant({ 'Ok' : FileId, 'Err' : IDL.Text });
  return IDL.Service({
    'get_file' : IDL.Func([IDL.Text], [DownloadResult], ['query']),
    'get_image_count' : IDL.Func([], [IDL.Nat64], ['query']),
    'upload_file' : IDL.Func([IDL.Vec(IDL.Nat8), IDL.Text], [UploadResult], []),
  });
};


// Create the actor
const actorImageCanister = Actor.createActor(idlFactoryImages, {
  agent,
  canisterId,
});

const compressImage = async (file, maxSizeKB = 200) => {
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

const uploadToICP = async (file, hash) => {
  try {
    // Compress the image
    const compressedFile = await compressImage(file);
    console.log('Compressed file size:', compressedFile.size);

    // Convert to ArrayBuffer then Uint8Array
    const arrayBuffer = await compressedFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    console.log('Uploading file:', {
      size: uint8Array.length,
      type: compressedFile.type,
      firstFewBytes: Array.from(uint8Array.slice(0, 10))
    });

    // Call the canister method with the binary data as vec nat8
    const uploadResult = await actorImageCanister.upload_file(
      uint8Array, // Already a Uint8Array, which matches vec nat8
      compressedFile.type
    );
    
    console.log('Upload result:', uploadResult);

    if ('Err' in uploadResult) {
      throw new Error(uploadResult.Err);
    }

    // Create a temporary URL for preview
    const previewUrl = URL.createObjectURL(compressedFile);

    // Convert the FileId to hex string
    const fileIdArray = Array.from(uploadResult.Ok);
    const fileIdHex = fileIdArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('FileId hex:', fileIdHex);

    return {
      hash: fileIdHex,
      rawHash: fileIdArray,
      url: previewUrl,
      fileId: fileIdHex
    };
  } catch (error) {
    console.error('Upload error:', {
      message: error.message,
      stack: error.stack,
      error
    });
    throw new Error('Failed to upload to Internet Computer: ' + error.message);
  }
};

const fetchFromICP = async (fileId) => {
  try {
    console.log('Fetching file with ID:', fileId);

    const result = await actorImageCanister.get_file(fileId); // Call the actor
    console.log('Fetch result:', result);

    // Check for an error variant
    if ('Err' in result) {
      throw new Error(result.Err); // Handle errors
    }

    // Access the "Ok" variant (record structure)
    const { mime_type: mimeType, file } = result.Ok; // Access mime_type and file
    console.log('Decoded result:', { mimeType, file });

    // Ensure file is Uint8Array
    if (!(file instanceof Uint8Array)) {
      throw new Error('Unexpected file type, expected Uint8Array');
    }

    // Create a Blob directly from the Uint8Array
    const blob = new Blob([file], { type: mimeType });
    return URL.createObjectURL(blob); // Generate a URL for the Blob
  } catch (error) {
    console.error('Fetch error:', error);
    throw new Error('Failed to fetch from Internet Computer: ' + error.message);
  }
};







// Export these so they can be used in your ImageUploader component
export { uploadToICP, fetchFromICP, actorImageCanister as actor };