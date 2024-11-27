import React from 'react';
import { ButtonBlue } from './button';
import { lato as fontFamily } from "../fonts/fonts";
import ReactMarkdown from 'react-markdown';

const ProductCard = ({ 
  sensorType, 
  price, 
  description, 
  onBuyNow,
  signedIn
}) => {
  const styles = {
    card: {
      display: 'flex',
      padding: '20px',
      border: '1px solid #e1e1e1',
      borderRadius: '8px',
      maxWidth: '800px',
      backgroundColor: '#ffffff',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      fontFamily, 
      marginBottom: 15
    },
    imageContainer: {
      flex: '0 0 300px',
      marginRight: '35px',
      marginLeft: '10px',
      display: 'flex',           // Added flex display
      alignItems: 'center',      // Center vertically
      justifyContent: 'center'   // Center horizontally (optional)
    },
    image: {
      width: '100%',
      height: 'auto',
      borderRadius: '4px'
    },
    content: {
      flex: '1',
      display: 'flex',
      flexDirection: 'column',
    },
    sensorType: {
      fontSize: '22px',
      marginBottom: '10px',
      fontFamily
    },
    price: {
      fontSize: '18px',
      color: '#333',
      marginBottom: '15px',
      fontFamily
    },
    description: {
      color: '#666',
      marginBottom: '20px',
      lineHeight: '1.6',
      fontFamily,
      fontSize: '14px',
      maxWidth: 400
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.imageContainer}>
        <img 
          src="/images/housing.webp"
          alt={sensorType}
          style={styles.image}
        />
      </div>
      <div style={styles.content}>
        <h2 style={styles.sensorType}>{sensorType}</h2>
        <div style={styles.price}>{price}</div>
        <div style={styles.description}>
          <ReactMarkdown>{description}</ReactMarkdown>
        </div>
        {signedIn &&
        <div style={{display: 'block', width: 200, marginLeft: 'auto', marginRight: 'auto'}}>
          <ButtonBlue onClick={onBuyNow}>
            BUY NOW
          </ButtonBlue>
        </div>
        }
      </div>
    </div>
  );
};

export default ProductCard;