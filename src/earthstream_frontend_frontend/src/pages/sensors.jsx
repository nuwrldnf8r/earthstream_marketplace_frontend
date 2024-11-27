import MenuItem from "../components/menuitem"
import {lato as fontFamily} from "../fonts/fonts"
import { useState, useRef } from 'react';
import MetamaskConnect from '../components/metamask_connect';
import TransactionHandler from '../components/token_transfer_manager';
import { ethers, Contract} from "ethers";
import ProductCard from "../components/product_card";
import Modal from "../components/modal";
import BuyComponent from "../components/buy_component";
import {icpService}  from "../services/icp_service";
import erc20abi from "../services/erc20abi";
import { BrowserProvider } from "ethers";
import { Principal } from '@dfinity/principal';
import SensorCard from "../components/sensor_card";

const modalStyles = {
    header: {fontFamily, fontSize: '1em', fontWeight: 600, letterSpacing: '0.9em', color: '#1B1B1B', paddingBottom: 20, display: 'block'},
    content: {fontFamily, fontSize: '0.7em', color: '#1B1B1B', marginBottom: 20, marginTop: 10},
}

function Sensors(props){
    const provider = useRef(null);
    const [account, setAccount] = useState(null);
    const signer = useRef(null);
    const [metamaskConnected, setMetamaskConnected] = useState(false);
    const [isBuying, setIsBuying] = useState(null);
    const [accountBalance, setAccountBalance] = useState(null);
    const [error, setError] = useState('');
    const [status, setStatus] = useState(null);
    const [purchaseComplete, setPurchaseComplete] = useState(false);
    const txHash = useRef(null);
    const selectedSensor = useRef(null);
    const [mySensors, setMySensors] = useState(null);

    const token = useRef({decimals:18, token_id:"demo_avalanche", chain_id:"43114", rpc_url: "https://api.avax.network/ext/bc/C/rpc", receive_address: "0x9BA2b7bB315636f23bF803ac3BfbA47868B2d8E8", sensor_base_price: 10, contract_address: "0xF4125d8df93B09826517F551d9872Ac28c990E96", token_type: 'Erc20', symbol:"Demo"});

    const select = (event,selected) => {
        event.stopPropagation()
        props.onSelect(selected)
    }

   

    const getDisplayPrice = (priceRatio) => {
        let _token = token.current;
        let price = _token.sensor_base_price * priceRatio;
        return price + " " + _token.symbol;
    }

    const onBuyClick = (sensorType) => {
        let sensor = sensors.find(s => s.sensorType === sensorType);
        selectedSensor.current = sensor;
        console.log("Buying sensor", sensorType);
        setIsBuying(true);
    }

    function getPrice() {
        if(selectedSensor.current){
            let price = token.current.sensor_base_price * selectedSensor.current.priceRatio * Math.pow(10, token.current.decimals);
            console.log("Price", price);
            return BigInt(Math.floor(price))
        } 
        return BigInt(0);
    }

    const purchaseSensor = async () => {
        let sensor = selectedSensor.current;
        setStatus("Processing transaction...");
        try{
            const _provider = provider.current;
            const _signer = await _provider.getSigner();
            const contract = new Contract(token.current.contract_address, erc20abi, _signer);
            const toAddress = token.current.receive_address;
            const tx = await contract.transfer(toAddress, getPrice());
            console.log("Transaction hash:", tx.hash);
            txHash.current = tx.hash;
            setStatus("Transaction submitted. Waiting for confirmation...");
            const receipt = await tx.wait();
            setStatus("Transaction confirmed. Confirming Purchase...");
            
            const purchasedSensors = await icpService.purchaseSensor(selectedSensor.current.sensorType_,token.current.token_id,txHash.current,_signer.address,1);
            console.log("Purchased sensors", purchasedSensors);
            setStatus("Purchase confirmed. Sensors added to your account.");
            setPurchaseComplete(true)

            setTimeout(()=>{
                modalClose();
            },1500)

        } catch (err) {
            console.error(err);
            setStatus("Transaction failed: " + err.message);
        }

    }

    const metaMaskConnect = async () => {
        try {
            if (!window.ethereum) {
              setError("Metamask is not installed!");
              return;
            }
      
            const _provider = new BrowserProvider(window.ethereum);
            await window.ethereum.request({ 
                method: 'wallet_requestPermissions',
                params: [{ eth_accounts: {} }]
            });
            const _accounts = await _provider.send("eth_requestAccounts", []);
      
            // Ensure Avalanche Mainnet
            const network = await _provider.getNetwork();
            
      
            setError("");
            provider.current = _provider;
            
            setMetamaskConnected(true);
            signer.current = await _provider.getSigner();
            const address = await signer.current.address;

            setAccount(address);

            console.log(token.current.contract_address)

            //get account balance
            const contract = new Contract(token.current.contract_address, erc20abi, _provider);
            const balance = await contract.balanceOf(address);
            setAccountBalance(balance);

          } catch (err) {
            console.log(err)
            setError(err.message || "Failed to connect.");
          }
    }

    const modalClose = () => {
        setIsBuying(false);
        setPurchaseComplete(false);
        setStatus(null);
    }

    const getMySensors = async (e) => {
        select(e,'my sensors');
        
        //const sensors = await icpService.listSensorsByOwner(Principal.fromText('jvgcu-4lftl-tgpe4-mb234-nrdou-itgjy-qirdd-yjfhf-n4p3e-hjvgj-nae'));
        const sensors = await icpService.listSensorsByOwner(Principal.fromText(props.user.identity));
        setMySensors(sensors);
    }

    const projectClick = (projectId, sensorId) => {

    }

    const shipClick = (sensorId) => {
        console.log("Shipping clicked", sensorId);
    }

    
    const sensors = [
        {
            sensorType: "LoRa Bioacoustic Sensor",
            sensorType_: {Lora: null},
            priceRatio: 1,
            description: 
`This sensor listens to bird sounds and sends them via a LoRa mesh network to the blockchain.

## SPECIFICATIONS
- Solar powered with 1800mAh battery
- ~5km range
- contains GPS positioning, temperature, humidity, and light sensors
- includes mini solar panel
`
        },
        {
            sensorType: "GSM Bioacoustic Sensor",
            sensorType_: {Gsm: null},
            priceRatio: 1,
            description: 
`This sensor listens to bird sounds and sends them via GSM to the blockchain.

## SPECIFICATIONS
- Solar powered with 1800mAh battery
- needs mobile connectivity
- contains GPS positioning, temperature, humidity, and light sensors
- includes mini solar panel
- stand-alone - ie. doesn't need a gateway
`
        },
        {
            sensorType: "WiFi Sensor Gateway",
            sensorType_: {GatewayWifi: null},
            priceRatio: 0.5,
            description: 
`Connects with LoRa sensors and uploads the data received to the blockchain via wifi.

## SPECIFICATIONS
- Solar powered with 1800mAh battery
- ~5km range
- contains GPS positioning, temperature, humidity, and light sensors
- includes mini solar panel
`
        }
        
    ]
    return <div>
        <div style={{ display: 'flex', flex: '0 1 auto', justifyContent: 'flex-start', fontFamily, fontWeight: 600, letterSpacing: '0.1em', color: '#1B1B1B', paddingLeft: 50, valign: 'middle', marginTop: 30}}>
            <MenuItem selected={props.selected==='pre-sale'} onClick={(e)=>select(e,'pre-sale')} small >PRE-SALE</MenuItem>
            {props.signedIn && <MenuItem selected={props.selected==='my sensors'} onClick={getMySensors} small>MY SENSORS</MenuItem>}
        </div>
        {props.selected==='pre-sale' && <div style={{fontFamily, fontSize: '0.8em', marginTop: 50, marginLeft: 150}}>
            <div>
                {
                    sensors.map((sensor, index) => {
                        return <ProductCard sensorType={sensor.sensorType} price={getPrice(sensor.priceRatio)} description={sensor.description} onBuyNow={()=>onBuyClick(sensor.sensorType)} key={sensor.sensorType} signedIn={props.signedIn}/>
                    })
                }
            </div>
        </div>}
        {isBuying && 
        <Modal isOpen={isBuying} onClose={modalClose}>
            <BuyComponent metamaskConnected={metamaskConnected} metaMaskConnect={metaMaskConnect} accountBalance={accountBalance} provider={provider.current} account={account} sensorType={selectedSensor.current.sensorType} token={token.current} onComplete={()=>{}} sensorData={selectedSensor.current} displayPrice={getDisplayPrice(selectedSensor.current.priceRatio)} purchaseSensor={purchaseSensor} status={status} getPrice={getPrice} purchaseComplete={purchaseComplete}/>
        </Modal>}
        {props.selected==='my sensors' && 
            <div style={{fontFamily, fontSize: '0.8em', marginTop: 50, marginLeft: 150}}>
                {!mySensors && <div>Loading..</div>}
                {mySensors && mySensors.length === 0 && <div>No sensors found</div>}
                {mySensors && mySensors.length > 0 && 
                    <div style={{display: 'flex'}}>
                        {
                            mySensors.map((sensor, index) => {
                                return <SensorCard data={sensor} key={sensor.sensor_id} onProjectClick={projectClick} onShipClick={shipClick} />
                            })
                        }
                    </div>
                }

            </div>
        }
    </div>
}

export default Sensors