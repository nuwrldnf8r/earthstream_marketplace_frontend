import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import 'mapbox-gl/dist/mapbox-gl.css';
import { ThumbsUp } from 'lucide-react';
import ICImage from './ic_image';
import {lato as fontFamily} from "../fonts/fonts"

mapboxgl.accessToken = 'pk.eyJ1IjoibnV3cmxkbmY4ciIsImEiOiJjbHZ6YWF2b28waDJhMmpxeWRsdXE3YXI5In0.CiHTxIWFTzs6R6KNE4pxYw';

const ProjectDisplay = ({ 
  id,
  name,
  description,
  location,
  images,
  sensors_required,
  onAllocateSensor,
  onBack,
  signedIn,
  allocatingStatus,
  error
}) => {

  const marker = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapContainer = useRef(null);
  const map = useRef(null);

  
  useEffect(() => {
    if (!map.current && mapContainer.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [location.lng, location.lat],
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
        .setLngLat([location.lng, location.lat])
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

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    maxWidth: '700px',
    margin: '0 auto',
    padding: '20px'
  };

  const imageContainerStyle = {
    width: '100%',
    height: '200px',
    marginBottom: '20px',
    position: 'relative',
    overflow: 'hidden'
  };

  const mapContainerStyle = {
    width: '100%',
    height: '300px',
    marginBottom: '20px'
  };

  const buttonStyle = {
    color: '#DBDBDB',
    backgroundColor: '#161616',
    fontFamily: 'inherit',
    borderStyle: 'none',
    padding: 10,
    paddingLeft: 18,
    paddingRight: 18,
    cursor: 'pointer',
    marginTop: '10px',
    marginBottom: '10px'
  };

  const titleStyle = {
    fontSize: '0.8em',
    marginBottom: '10px',
    textTransform: 'uppercase',
    fontFamily
  };

  const descriptionStyle = {
    marginBottom: '20px',
    width: '100%',
    textAlign: 'left',
    fontFamily,
    fontSize: '0.7em',
    marginBottom: 50,
    textAlign: 'center'
  };

  const voteContainerStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginBottom: '10px'
  };

  return (
    <div style={containerStyle}>
      <div style={imageContainerStyle}>
        <ICImage
          fileId={images.background}
          alt={name}
          containerStyle={{ height: '100%', width: '100%' }}
          imageStyle={{ objectFit: 'cover', height: '100%', width: '100%' }}
        />
      </div>

      <h1 style={titleStyle}>{name}</h1>
      <p style={descriptionStyle}>{description}</p>

      <div ref={mapContainer} style={mapContainerStyle} />

      {sensors_required > 0 && (
        <div style={{fontFamily, fontSize: '0.7em'}}>
            {error && <p style={{color: 'red'}}>{error}</p>}
          <p>Sensors Required: {sensors_required}</p>
          {signedIn && <button 
            style={{color: '#000000',
                backgroundColor: '#92CFE8',
                fontFamily,
                borderStyle: 'none',
                padding: 10,
                paddingLeft: 18,
                paddingRight: 18,
                cursor: 'pointer'}}
            onClick={() => onAllocateSensor(id)}
          >
            {allocatingStatus || 'ALLOCATE SENSOR'}
          </button>}
        </div>
      )}

      <div style={{textAlign: 'center', marginTop: 20}}><button 
            style={buttonStyle}
            onClick={onBack}
          >BACK</button></div>
    </div>
  );
};

export default ProjectDisplay;