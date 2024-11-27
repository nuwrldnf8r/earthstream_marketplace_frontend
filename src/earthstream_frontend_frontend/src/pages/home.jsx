import {lato as fontFamily} from "../fonts/fonts"


function Home(props){
    return <><div style={{width: '100%', display:'flex', backgroundColor: '#000000', marginTop: 5}}>
        <div><img src="/images/forest.png" width="800"/></div>
        <div style={{width: '50%'}}>
            <div style={{display: 'block', fontFamily, color: '#ffffff', textAlign: 'center',fontSize: '2em', marginTop: 110}}>Nature Matters</div>
            <div style={{display: 'block', fontFamily, color: '#cccccc', textAlign: 'center',fontSize: '0.9em', marginTop: 10, fontStyle: 'italic'}}>That's why we're building Earthstream</div>
        </div>
    </div>
    <div style={{marginTop: 50, fontFamily, fontSize: '1.2em', color: '#1B1B1B', paddingLeft: 50, valign: 'middle', display: 'flex',flexDirection: 'column',
        justifyContent: 'center', alignItems: 'center'}}>
            <div style={{width: '80%', textAlign: 'left', fontFamily, fontSize: '0.5em', opacity: '0.5', marginTop: 20}}>Listening to the Earth</div>
            <div style={{width: '80%', textAlign: 'left', fontFamily, fontSize: '2em'}}>Technology Meets Nature</div>
            <div style={{width: '80%', textAlign: 'left', fontFamily, fontSize: '0.7em', opacity: '0.7', marginTop:30, paddingLeft: 20}}>To change the future, our relationship with nature needs to change.</div>
            <div style={{width: '80%', textAlign: 'left', fontFamily, fontSize: '0.7em', opacity: '0.7', marginTop:20, paddingLeft: 20}}>It's time to invite a different way of listening to the Earth. </div>
            <div style={{width: '80%', textAlign: 'left', fontFamily, fontSize: '0.7em', opacity: '0.7', marginTop:20, paddingLeft: 20}}>We're building a sensor network that connects to the blockchain and supports global biodiversity reporting.</div>
            <div style={{width: '80%', textAlign: 'left', fontFamily, fontSize: '0.7em', opacity: '0.7', marginTop:20, paddingLeft: 20}}>This is asking the Earth: What is needed? How can we serve? </div>


    </div>   
    </>
}

export default Home