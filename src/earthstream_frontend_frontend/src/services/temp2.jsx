// In any component that needs to interact with canisters
import { icpService } from './services/icp-service';

function ImageUploader() {
  const handleUpload = async (file) => {
    try {
      const result = await icpService.uploadImage(file);
      // Handle successful upload
    } catch (error) {
      if (error.message.includes('Authentication required')) {
        // Handle authentication error (e.g., show login prompt)
      } else {
        // Handle other errors
      }
    }
  };

  return (
    // Your component JSX
  );
}