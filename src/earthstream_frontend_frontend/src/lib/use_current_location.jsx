import { useState, useEffect } from 'react';

const useCurrentLocation = () => {
  const [currentLocation, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      setLoading(false);
      return;
    }
    console.log('getting location')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log(position.coords)
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );
  }, []);

  return { currentLocation, error, loading };
};

export default useCurrentLocation;