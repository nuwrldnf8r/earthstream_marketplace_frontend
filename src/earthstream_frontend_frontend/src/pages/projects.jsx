import MenuItem from "../components/menuitem"
import {lato as fontFamily} from "../fonts/fonts"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'
import Launch from "./projects_launch"

function Projects(props){

    const select = (event,selected) => {
        event.stopPropagation()
        props.onSelect(selected)
    }

    return <div>
        <div style={{ display: 'flex', flex: '0 1 auto', justifyContent: 'flex-start', fontFamily, fontWeight: 600, letterSpacing: '0.1em', color: '#1B1B1B', paddingLeft: 50, valign: 'middle', marginTop: 30}}>
            <MenuItem selected={props.selected==='all projects'} onClick={(e)=>select(e,'all projects')} small>ALL PROJECTS</MenuItem>
            <MenuItem selected={props.selected==='my projects'} onClick={(e)=>select(e,'my projects')} small>MY PROJECTS</MenuItem>
            <MenuItem selected={props.selected==='launch project'} onClick={(e)=>select(e,'launch project')} small>
                <FontAwesomeIcon icon={faRocket} /><span style={{paddingLeft: 3}}/> LAUNCH NEW
            </MenuItem>
        </div>
        {props.selected==='launch project' && <Launch/>}
    </div>
}

export default Projects