import MenuItem from "../components/menuitem"
import {lato as fontFamily} from "../fonts/fonts"
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ProjectList from "../components/project_list"
import {useState} from 'react'
import Spacer from '../components/spacer';

function Admin(props){
    const [selected, setSelected] = useState('projects')
    const [projectOption, setProjectOption] = useState('pending')
    return  <div>
        <div style={{ display: 'flex', flex: '0 1 auto', justifyContent: 'flex-start', fontFamily, fontWeight: 600, letterSpacing: '0.1em', color: '#1B1B1B', paddingLeft: 50, valign: 'middle', marginTop: 30}}>
                
                <MenuItem selected={selected==='projects'} onClick={(e)=>setSelected('projects')} small>PROJECTS</MenuItem>
                <MenuItem selected={selected==='sensors'} onClick={(e)=>setSelected('sensors')} small>SENSORS</MenuItem>
                <Spacer width={150} />
                {selected==='projects' && 
                    <>
                    <MenuItem selected={projectOption==='pending'} onClick={(e)=>setProjectOption('pending')} small>PENDING APPROVAL</MenuItem>
                    <MenuItem selected={projectOption==='suspended'} onClick={(e)=>setProjectOption('suspended')} small>SUSPENDED</MenuItem>
                    <MenuItem selected={projectOption==='rejected'} onClick={(e)=>setProjectOption('rejected')} small>REJECTED</MenuItem>
                    <MenuItem selected={projectOption==='approved'} onClick={(e)=>setProjectOption('approved')} small>APPROVED</MenuItem>
                    </>
                }
                {selected==='sensors' && 
                    <>
                    {/*}
                    <>
                    <MenuItem selected={projectOption==='purchased'} onClick={(e)=>setProjectOption('purchased')} small>PURCHASED</MenuItem>
                    <MenuItem selected={projectOption==='shipping_required'} onClick={(e)=>setProjectOption('shipping_required')} small></MenuItem>
                    <MenuItem selected={projectOption==='shipped'} onClick={(e)=>setProjectOption('shipped')} small>SHIPPED</MenuItem>
                    </>
                    */}
                    
                    </>
                }
                
                
        </div>
        <div>
            {selected==='sensors' && <div style={{fontFamily, fontSize: '0.8em', marginTop: 50, marginLeft: 150}}>Once sensors are ready to ship - shipping options will be available here</div>}

        </div>
    </div>

}

export default Admin