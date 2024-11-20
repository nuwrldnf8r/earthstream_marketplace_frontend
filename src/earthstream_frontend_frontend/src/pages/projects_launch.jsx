import Field from "../components/field"
import LocationField from "../components/location_field"
import  useCurrentLocation  from '../lib/use_current_location'
import {lato as fontFamily} from "../fonts/fonts"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect, useRef} from 'react'
import { ButtonBlue } from "../components/button"
import { exists, launchProject } from "../lib/data"



function ProjectLaunch() {
    const { currentLocation, error, loading } = useCurrentLocation();
    const [location, _setLocation] = useState(null);
    const [validationError, setError] = useState(null);

    const project = useRef({
        name: '',
        description: '',
        video: '',
        projectDiscord: '',
        privateDiscord: '',
        sensorsRequired: 0,
        location: { lat: 0, lng: 0, address: '' }
    })

    useEffect(() => {
    if (currentLocation) {
        console.log('got location')
        console.log(currentLocation)
        setLocation({
            lat: currentLocation.lat,
            lng: currentLocation.lng,
            address: ''
        });
    }
    }, [currentLocation]);  

    const onChange = (field, event) => {
        if(field === 'sensorsRequired'){
            if(event.target.value < 1){
                setError({...validationError, [field]: 'Must be greater than 0'})
            } else {
                const newValidationError = {...validationError}
                delete newValidationError[field]
                setError(newValidationError)
                project.current[field] = event.target.value
            }
        } else if(field==='name'){
            exists(event.target.value).then((exists)=>{
                if(exists){
                    setError({...validationError, [field]: 'Name already exists'})
                } else {
                    console.log('name does not exist')
                    const newValidationError = {...validationError}
                    delete newValidationError[field]
                    setError(newValidationError)
                    project.current[field] = event.target.value
                }
            })
        }
        else {
            if(event.target.error){
                setError({...validationError, [field]: event.target.error})
            } else {
                const newValidationError = {...validationError}
                delete newValidationError[field]
                setError(newValidationError)
                project.current[field] = event.target.value
            }
        }
        console.log(project.current)
        console.log(validationError)
    }

    const setLocation = (value) => {
        project.current['location'] = value
        _setLocation(value)
    }

    const launch = async () => {
        project.current['status'] = 'pending review'
        let success = await launchProject(project.current)
        if(success){
            console.log('project launched')
        } else {
            console.log('project not launched')
        }
    }

    const canLaunch = () => {
        let p = project.current 
        if (!p.sensorsRequired && p.sensorsRequired <1){
            return false
        }
        if(!p.name || p.name.length < 4){
            return false
        }
        if(!p.description || p.description.length < 10){
            return false
        }
        if(!p.privateDiscord || p.privateDiscord.length < 5){
            return false
        }
        if(!p.location || !p.location.lat || !p.location.lng){
            return false
        }

        console.log(validationError)
        return !validationError || Object.keys(validationError).length === 0
    }

    const getError = (me) => {
        if(validationError && validationError[me]){
            return validationError[me]
        }
        return null
    }
      
  return (
    <div style={{marginLeft: 100}}>   
        <div style={{fontFamily, fontWeight: 300, letterSpacing: '0.1em', color: '#1B1B1B', marginTop: 40}}>
            NEW PROJECT
        </div>
        <div style={{marginLeft: 20, marginTop: 30}}>
            <Field label="PROJECT NAME" labelPosition="left" labelWidth="150px" width="500px" placeholder="PROJECT NAME" onChange={(event)=>onChange('name',event)} required error={getError('name')}/>
            <Field label="DESCRIPTION" labelPosition="left" labelWidth="150px" width="500px" placeholder="DESCRIPTION" onChange={(event)=>onChange('description',event)} type="textarea" required error={getError('description')}/>
            <Field label="EXPLAINER VIDEO" labelPosition="left" labelWidth="150px" width="500px" hint="Please upload a youtube video explaining your project" onChange={(event)=>onChange('video',event)} type="video" error={getError('video')}/>
            <Field label="PROJECT DISCORD" labelPosition="left" labelWidth="150px" width="500px" type="discord" hint="This is the Discord for the project" onChange={(event)=>onChange('projectDiscord',event)} error={getError('projectDiscord')}/>
            <Field label="PRIVATE DISCORD" labelPosition="left" labelWidth="150px" width="500px" type="discord" hint="This is a discord handle where we can communicate with you about the project - delivery address for sensors etc."  onChange={(event)=>onChange('privateDiscord',event)} error={getError('privateDiscord')} required/>
            <Field label="SENSORS REQUIRED" labelPosition="left" labelWidth="150px" width="300px" type="number"  onChange={(event)=>onChange('sensorsRequired',event)} error={getError('sensorsRequired')}/>
            <div style={{display: 'block', marginTop: 25}} />
            {loading ? (<div>Getting location...</div>):
                (!loading && currentLocation && 
                    <LocationField
                        label="LOCATION"
                        value={location || { lat: 0, lng: 0, address: '' }}
                        onChange={setLocation}
                        width={600} 
                        required
                    />
                )
            }
            <div style={{display: 'block', marginTop: 50, marginBottom: 100, width: 200, marginLeft: 'auto', marginRight: 'auto'}}>
                <ButtonBlue onClick={launch} disabled={!canLaunch()}>
                    <FontAwesomeIcon icon={faRocket} style={{marginRight: 10}}/> LAUNCH PROJECT
                </ButtonBlue>
            </div>
        </div>


    </div>
  );
}

export default ProjectLaunch