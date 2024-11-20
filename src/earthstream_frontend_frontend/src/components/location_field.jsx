import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { lato as fontFamily } from "../fonts/fonts";

mapboxgl.accessToken = 'pk.eyJ1IjoibnV3cmxkbmY4ciIsImEiOiJjbHZ6YWF2b28waDJhMmpxeWRsdXE3YXI5In0.CiHTxIWFTzs6R6KNE4pxYw';

const LocationField = ({
  label,
  required = false,
  error = '',
  width = '100%',
  height = '300px',
  labelPosition = 'top',
  labelWidth = 'auto',
  value = { lat: 0, lng: 0, address: '' },
  onChange
}) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  const styles = {
    container: {
      marginBottom: '1rem',
      width: width,
      display: labelPosition === 'left' ? 'flex' : 'block',
      alignItems: labelPosition === 'left' ? 'flex-start' : 'stretch',
      gap: labelPosition === 'left' ? '0.5rem' : '0'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: labelPosition === 'top' ? '0.25rem' : '0',
      color: error ? '#DC2626' : '#374151',
      width: labelPosition === 'left' ? labelWidth : 'auto',
      fontFamily: fontFamily
    },
    inputWrapper: {
      flexGrow: 1,
      width: labelPosition === 'left' ? 'calc(100% - 1rem - ' + (typeof labelWidth === 'string' ? labelWidth : labelWidth + 'px') + ')' : '100%'
    },
    mapContainer: {
      height: height,
      width: width,
      borderRadius: '0.375rem',
      border: `1px solid ${error ? '#DC2626' : '#D1D5DB'}`
    },
    error: {
      marginTop: '0.25rem',
      fontSize: '0.875rem',
      color: '#DC2626',
      fontFamily: fontFamily
    },
    required: {
      marginLeft: '0.25rem',
      color: '#DC2626'
    },
    coordinates: {
      marginTop: '0.5rem',
      fontSize: '0.875rem',
      color: '#6B7280',
      fontFamily: fontFamily
    }
  };

  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [value.lng, value.lat],
        zoom: 13
      });

      const geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false
      });

      map.current.addControl(geocoder);

      marker.current = new mapboxgl.Marker({
        draggable: true
      })
        .setLngLat([value.lng, value.lat])
        .addTo(map.current);

      map.current.on('click', (e) => {
        const coords = e.lngLat;
        marker.current.setLngLat(coords);
        updateLocation(coords);
      });

      marker.current.on('dragend', () => {
        const lngLat = marker.current.getLngLat();
        updateLocation(lngLat);
      });

      geocoder.on('result', (e) => {
        const coords = e.result.center;
        marker.current.setLngLat(coords);
        updateLocation({
          lng: coords[0],
          lat: coords[1]
        }, e.result.place_name);
      });

      map.current.on('load', () => {
        setMapLoaded(true);
      });
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Add this new useEffect to handle value changes
  useEffect(() => {
    if (map.current && marker.current && value) {
      marker.current.setLngLat([value.lng, value.lat]);
      map.current.flyTo({
        center: [value.lng, value.lat],
        zoom: 13
      });
    }
  }, [value.lat, value.lng]);

  const updateLocation = async (lngLat, address = null) => {
    if (!address) {
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${lngLat.lng},${lngLat.lat}.json?access_token=${mapboxgl.accessToken}`
        );
        const data = await response.json();
        address = data.features[0]?.place_name || '';
      } catch (error) {
        console.error('Error fetching address:', error);
        address = '';
      }
    }

    onChange({
      lat: lngLat.lat,
      lng: lngLat.lng,
      address
    });
  };

  return (
    <div style={styles.container}>
      <label style={styles.label}>
        {label}
        {required && <span style={styles.required}>*</span>}
      </label>
      <div style={styles.inputWrapper}>
        <div ref={mapContainer} style={styles.mapContainer} />
        {error && <p style={styles.error}>{error}</p>}
        {mapLoaded && value.address && (
          <p style={styles.coordinates}>
            Selected: {value.address}
          </p>
        )}
      </div>
    </div>
  );
};

export default LocationField;