const selectedStyle = { display: 'flex', alignItems: 'center', marginRight: 30, borderBottomStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#1B1B1B'}
const unSelectedStyle = { display: 'flex', alignItems: 'center', marginRight: 30, cursor: 'pointer'}

const selectedStyleSmall = { display: 'flex', alignItems: 'center', marginLeft: 30, borderBottomStyle: 'solid', borderBottomWidth: 1, borderBottomColor: '#1B1B1B', fontSize: 14}
const unSelectedStyleSmall = { display: 'flex', alignItems: 'center', marginLeft: 30, cursor: 'pointer', fontSize: 14}

function MenuItemSmall(props) {
  return (
    <div className="menu-item" style={props.selected?selectedStyleSmall:unSelectedStyleSmall} onClick={e=>{if(!props.selected)props.onClick(e)}}>
        {props.children}
    </div>
  );
}

function MenuItem(props) {
  if(props.small) return <MenuItemSmall {...props} />
  return (
    <div className="menu-item" style={props.selected?selectedStyle:unSelectedStyle} onClick={e=>{if(!props.selected)props.onClick(e)}}>
        {props.children}
    </div>
  );
}

export default MenuItem;