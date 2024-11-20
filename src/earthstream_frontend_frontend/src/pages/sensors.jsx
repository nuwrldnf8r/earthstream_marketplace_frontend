import MenuItem from "../components/menuitem"
import {lato as fontFamily} from "../fonts/fonts"

function Sensors(props){

    const select = (event,selected) => {
        event.stopPropagation()
        props.onSelect(selected)
    }

    return <div>
        <div style={{ display: 'flex', flex: '0 1 auto', justifyContent: 'flex-start', fontFamily, fontWeight: 600, letterSpacing: '0.1em', color: '#1B1B1B', paddingLeft: 50, valign: 'middle', marginTop: 30}}>
            <MenuItem selected={props.selected==='pre-sale'} onClick={(e)=>select(e,'pre-sale')} small >PRE-SALE</MenuItem>
            <MenuItem selected={props.selected==='my sensors'} onClick={(e)=>select(e,'my sensors')} small>MY SENSORS</MenuItem>
        </div>
    </div>
}

export default Sensors