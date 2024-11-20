const fontFamily = '"Lato", sans-serif'

const blue = {
    color: '#000000',
    backgroundColor: '#92CFE8',
    fontFamily,
    borderStyle: 'none',
    padding: 10,
    paddingLeft: 18,
    paddingRight: 18,
    cursor: 'pointer'
}

const black = {
    color: '#DBDBDB',
    backgroundColor: '#161616',
    fontFamily,
    borderStyle: 'none',
    padding: 10,
    paddingLeft: 18,
    paddingRight: 18,
    cursor: 'pointer'
}

const Button = ({text, onClick, style, disabled}) => {
    style = {...style}
    if(disabled){
        style.opacity = 0.5
        style.cursor = 'not-allowed'
        onClick = ()=>{}
    }
    return (
        <button onClick={onClick} style={style} disabled={disabled}>{text}</button>
    )
}

export const ButtonBlue = (props) => {
    return (
        <Button text={props.children} onClick={props.onClick} style={blue} disabled={props.disabled}/>
    )
}

export const ButtonBlack = (props) => {   
    return (
        <Button text={props.children} onClick={props.onClick} style={black} disabled={props.disabled}/>
    )
}