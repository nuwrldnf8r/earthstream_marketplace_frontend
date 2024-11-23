import Field from "../components/field"
import LocationField from "../components/location_field"
import  useCurrentLocation  from '../lib/use_current_location'
import {lato as fontFamily} from "../fonts/fonts"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'
import { useState, useEffect, useRef} from 'react'
import { ButtonBlue } from "../components/button"
import { exists, launchProject } from "../lib/data"
import ImageUploader from "../components/image_uploader"



function ProjectLaunch() {
    const { currentLocation, error, loading } = useCurrentLocation();
    const [location, _setLocation] = useState(null);
    const [validationError, setError] = useState(null);
    const [gatewayType, setGatewayType] = useState('Wifi');
    const [backgroundImage, setBackgroundImage] = useState(null);

    const project = useRef({
        name: '',
        description: '',
        video: '',
        project_discord: '',
        private_discord: '',
        sensors_required: 0,
        location: { lat: 0, lng: 0, address: '' },
        gateway_type: 'Wifi',
        images: {background: '', gallery: []},
        tags: []
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

    const gatewayTypeIs = (type) => {
        return (gatewayType && gatewayType === type)
    }

    const onChange = (field, event) => {

        if(field === 'Wifi' || field === 'GSM'){
            console.log(field)
            console.log(event.target)
            
            if(event.target.value){
                project.current.gateway_type = field
                setGatewayType(field)
            } else {
                project.current.gateway_type = (field === 'Wifi') ? 'GSM' : 'Wifi'   
                setGatewayType(project.current.gateway_type)
            }
           
        } else if(field === 'sensors_required'){
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
        if (!p.sensors_required && p.sensors_required <1){
            return false
        }
        if(!p.name || p.name.length < 4){
            return false
        }
        if(!p.description || p.description.length < 10){
            return false
        }
        if(!p.private_discord || p.private_discord.length < 5){
            return false
        }
        if(!p.location || !p.location.lat || !p.location.lng){
            return false
        }
        if(!backgroundImage){
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
            <Field label="PROJECT DISCORD" labelPosition="left" labelWidth="150px" width="500px" type="discord" hint="This is the Discord for the project" onChange={(event)=>onChange('project_discord',event)} error={getError('project_discord')}/>
            <Field label="PRIVATE DISCORD" labelPosition="left" labelWidth="150px" width="500px" type="discord" hint="This is a Discord handle where we can communicate with you about the project - delivery address for sensors etc."  onChange={(event)=>onChange('private_discord',event)} error={getError('private_discord')} required/>
            <Field label="SENSORS REQUIRED" labelPosition="left" labelWidth="150px" width="300px" type="number"  onChange={(event)=>onChange('sensors_required',event)} error={getError('sensors_required')}/>
            <div style={{marginTop: 10, fontSize: '0.875rem', fontWeight: '500', fontFamily: fontFamily}}>GATEWAY TYPE <span style={{color: '#DC2626'}}>*</span></div>
            <div style={{marginLeft: 150, marginTop: 20, marginBottom: 0, position: 'relative', top: -35}}>
                <Field label="WIFI" type="checkbox" onChange={(event)=>onChange('wifi',event)} value={gatewayTypeIs('Wifi')}/>
                <Field label="GSM" type="checkbox" onChange={(event)=>onChange('GSM',event)} value={gatewayTypeIs('GSM')}/>
                {validationError && validationError['gateway_type'] && <div style={{color: '#DC2626', fontSize: '0.875rem', fontFamily: fontFamily}}>{validationError['gateway_type']}</div>}
            </div>
      
            <div style={{ marginBottom: '32px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', marginBottom: '16px', fontFamily }}>
                BACKGROUND IMAGE<span style={{color: '#DC2626'}}>*</span>
                </div>
                <ImageUploader
                aspectRatio={16/9}
                multiple={false}
                maxFileSize={5 * 1024 * 1024} // 5MB
                onUploadComplete={(result) => {
                    console.log('Upload complete:', result);
                    console.log('Upload complete:', result);
                    if(!project.current['images']){
                        project.current['images'] = {}
                    }
                    project.current['images']['background'] = result.hash
                    setBackgroundImage(result.hash)
                }}
                onUploadError={(error) => {
                    console.log('Upload error:', error);
                }}
                errorMessages={{
                    fileType: "Please upload a valid image file (JPG, PNG)",
                    fileSize: "Image must be less than {size}KB",
                    uploadError: "Failed to upload. Please try again.",
                    processingError: "Could not process image. Please try again."
                }}
                style={{ width: '600px' }}
                />

            </div>

            <div style={{ marginBottom: 0 }}>
                <div style={{ fontSize: '0.875rem',fontWeight: '500', marginBottom: '16px', fontFamily }}>
                 IMAGE GALLERY
                </div>

                <ImageUploader
                aspectRatio={1}  // 1:1 ratio for square images
                multiple={true}
                maxFileSize={2 * 1024 * 1024} // 2MB
                onUploadComplete={(result) => {
                    console.log('Upload complete:', result);
                    if(!project.current['images']){
                        project.current['images'] = {gallery:[]}
                    } else if(!project.current['images']['gallery']){
                        project.current['images']['gallery'] = []
                    }
                    if(project.current['images']['gallery'].indexOf(result.hash)===-1)  project.current['images']['gallery'].push(result.hash)
                }}
                onUploadError={(error) => {
                    console.log('Upload error:', error);
                }}
                // Error messages are optional - will use defaults if not provided
                style={{ width: '400px', height: '400px' }}
                />
                
            </div>

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