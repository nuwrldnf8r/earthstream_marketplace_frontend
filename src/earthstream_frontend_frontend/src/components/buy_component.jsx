import { useState, useRef } from 'react';
import {lato as fontFamily} from "../fonts/fonts"
import { text } from '@fortawesome/fontawesome-svg-core';
import { ButtonBlack } from './button';

const headerStyle = {
    fontFamily,
    fontSize: '0.7em',
    color: '#1B1B1B',
    paddingBottom: 2,
    textAlign: 'center',
    marginTop: 30
}
const labelStyle = {
    fontFamily,
    fontSize: '0.6em',
    letterSpacing: '0.01em',
    color: '#1B1B1B',
    paddingBottom: 2,
    width: 150,
    display: 'inline-block',
}
const contentStyle = {
    fontFamily,
    fontSize: '0.6em',
    color: '#1B1B1B',
    paddingBottom: 2,
}
function BuyComponent({
    metamaskConnected,
    metaMaskConnect,
    provider,
    account,
    sensorType,
    token,
    onComplete,
    sensorData,
    displayPrice,
    accountBalance,
    purchaseSensor,
    getPrice,
    status,
    purchaseComplete

}) {
    const [isBuying, setIsBuying] = useState(false);
    

    

    function canBuy() {
        return getPrice() < accountBalance
    }

    function onBuyClick() {
        console.log("Buying sensor", sensorType);
        setIsBuying(true);
        purchaseSensor()

    }



  return (
    <div>
      {/*<div>metamaskConnected: {metamaskConnected}</div>*/}
      <div style={headerStyle}>PURCHASING SENSOR</div>
      <div style={{display: 'block', width: 400, marginLeft: 'auto', marginRight: 'auto', marginTop: 20}}>
        <div><span style={labelStyle}>PURCHASING:</span><span style={contentStyle}> {sensorType}</span></div>
        <div><span style={labelStyle}>PRICE:</span><span style={contentStyle}> {displayPrice}</span></div>
        {metamaskConnected && <div>
            
            {accountBalance && <>
                {!canBuy() && <div style={{color: 'red', fontSize: '0.6em'}}>Insufficient balance</div>}
                {canBuy() && !isBuying && <div style={{textAlign: 'center', marginTop: 20}}><ButtonBlack onClick={onBuyClick}>BUY PRESALE SENSOR</ButtonBlack></div>}
                {isBuying && <div style={{textAlign: 'center', marginTop: 20}}>
                    <div>
                        {!purchaseComplete && <div style={{...contentStyle, marginBottom:10}}>Don't close this window! This could take a little while</div>}
                        <div style={{...contentStyle,color:'#92CFE8'}}>{status}</div>
                    </div>
                </div>}
            </>}
            
        </div>}
        {!metamaskConnected && <div style={{textAlign: 'center', marginTop: 100}}><ButtonBlack onClick={metaMaskConnect}>CONNECT METAMASK</ButtonBlack></div>}
        <div></div>
      </div>
    </div>
  );
}

export default BuyComponent;