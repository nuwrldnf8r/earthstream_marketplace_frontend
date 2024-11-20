import { ButtonBlack } from './button'
import MenuItem from './menuitem'
import Spacer from './spacer'
import ReactDOM from 'react-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser } from '@fortawesome/free-solid-svg-icons'

const fontFamily = '"Lato", sans-serif'

function Header(props){
    let isSelected = (page) => props.page===page

    return (
        <div style={{display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center', margin: 0, padding: 8, backgroundColor: '#ffffff'}}>
           <div style={{ flex: '0 1 auto' }}>
            <img src="/images/logo.webp" alt="earthstream logo" width="180"/>   
           </div>
           
           <div style={{ display: 'flex', flex: '0 1 auto', justifyContent: 'flex-end', fontFamily, fontSize: 16, fontWeight: 600, letterSpacing: '0.1em', color: '#1B1B1B', paddingRight: 20, valign: 'middle'}}>
                <MenuItem selected={isSelected('sensors')} onClick={(e)=>props.onMenuSelect(e,'sensors')}>SENSORS</MenuItem>
                <MenuItem selected={isSelected('projects')} onClick={(e)=>props.onMenuSelect(e,'projects')}>PROJECTS</MenuItem>
                <Spacer width={50} />
                {props.signedIn && 
                <>
                    <div style={{ display: 'flex', alignItems: 'center', marginRight: 20, fontSize: 20, cursor: 'pointer'}} onClick={e=>props.onMenuSelect(e,'account')}><FontAwesomeIcon icon={faUser} /></div>
                    <div style={{ display: 'flex', alignItems: 'center' }}><ButtonBlack onClick={props.onSignOut}>SIGN IN</ButtonBlack></div>
                </>
                }
                {!props.signedIn &&
                    <div style={{ display: 'flex', alignItems: 'center' }}><ButtonBlack  onClick={props.onSignIn}>SIGN OUT</ButtonBlack></div>
                }   
            </div>
        </div>
    )
}

export default Header