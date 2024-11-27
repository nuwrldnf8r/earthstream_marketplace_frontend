import React from 'react';
import {lato as fontFamily} from "../fonts/fonts"

const SensorCard = ({ 
  data, 
  onProjectClick, 
  onShipClick,
  imageSrc = '/images/housing.webp' // default placeholder
}) => {
  const formatDate = (timestamp) => {
    const date = new Date(Number(timestamp));
    return date.toLocaleString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getSensorType = () => {
    const type = Object.keys(data.sensor_type)[0];
    return type.replace(/([A-Z])/g, ' $1').trim(); // Add spaces before capital letters
  };

  const getStatus = () => {
    const status = Object.keys(data.status)[0];
    return status.replace(/([A-Z])/g, ' $1').trim(); // Add spaces before capital letters
  };

  const cardStyle = {
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '16px',
    width: 350,
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    backgroundColor: '#ffffff',
    marginBottom: '16px',
    display: 'inline-block',
    margin: 10
  };

  const imageStyle = {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    borderRadius: '4px',
    marginBottom: '16px'
  };

  const headerStyle = {
    fontFamily,
    fontSize: '0.9em',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333'
  };

  const infoStyle = {
    marginBottom: '8px',
    color: '#666',
    fontFamily,
    fontSize: '0.8em',
  };

  const buttonStyle = {
    color: '#000000',
    backgroundColor: '#92CFE8',
    fontFamily,
    borderStyle: 'none',
    padding: 10,
    paddingLeft: 18,
    paddingRight: 18,
    cursor: 'pointer'
  };

  const shipButtonStyle = {
    color: '#DBDBDB',
    backgroundColor: '#161616',
    fontFamily,
    borderStyle: 'none',
    padding: 10,
    paddingLeft: 18,
    paddingRight: 18,
    cursor: 'pointer'
  };

  return (
    <div style={cardStyle}>
      <img 
        src={imageSrc} 
        alt="Sensor" 
        style={imageStyle}
      />
      
      <div style={headerStyle}>
        SENSOR DETAILS
      </div>

      <div style={infoStyle}>
        <strong>ID:</strong> {data.sensor_id.substring(0, 12)}...{data.sensor_id.substring(54)}
      </div>

      <div style={infoStyle}>
        <strong>TYPE:</strong> {getSensorType()}
      </div>

      <div style={infoStyle}>
        <strong>STATUS:</strong> {getStatus()}
      </div>

      <div style={infoStyle}>
        <strong>PURCHASE DATE:</strong> {formatDate(data.purchase_date[0])}
      </div>

      {data.project_id?.length > 0 && (
        <div style={{ ...infoStyle, display: 'flex', alignItems: 'center', gap: '10px' , paddingTop: 15, textAlign: 'center'}}>
          <span style={{textAlign: 'center', width: '100%'}}>ASSIGNED TO PROJECT</span>
          {/*          <button 
            style={buttonStyle}
            onClick={() => onProjectClick(data.project_id[0],data.sensor_id)}
          >
            VIEW PROJECT
          </button> */}
        </div>
      )}

      {Object.keys(data.status)[0] === 'Presale' && data.project_id?.length === 0 && (
        <div style={{textAlign: 'center', marginTop: 20}}>
        <button 
          style={shipButtonStyle}
          onClick={() => onShipClick(data.sensor_id)}
        >
          SHIP
        </button>
        </div>
      )}
    </div>
  );
};

export default SensorCard;