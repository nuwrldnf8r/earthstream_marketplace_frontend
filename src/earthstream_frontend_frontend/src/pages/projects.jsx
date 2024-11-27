import MenuItem from "../components/menuitem"
import {lato as fontFamily} from "../fonts/fonts"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRocket } from '@fortawesome/free-solid-svg-icons'
import Launch from "./projects_launch"
import ProjectList from "../components/project_list"
import { useState } from 'react';
import ProjectDisplay from "../components/project_view"
import {icpService}  from "../services/icp_service";
import { Principal } from '@dfinity/principal';


function Projects(props){
    const [selectedProject, setSelectedProject] = useState(null);
    const [allocatingStatus, setAllocatingStatus] = useState(null);
    const [error, setError] = useState(null);
    const select = (event,selected) => {
        event.stopPropagation()
        props.onSelect(selected)
    }

    const handleProjectSelect = (project) => {
        console.log(project)
        setSelectedProject(project);
    };
    
    const allocateSensor = async (projectId) => {
        let sensors = await icpService.listSensorsByOwner(Principal.fromText(props.user.identity));
        setAllocatingStatus('ALLOCATING..')
        let available = sensors.find(s => s.project_id.length === 0 && 'Presale' in s.status && 'Lora' in s.sensor_type);
        if(!available){
            setError('no sensors avalaible to assign')
        } else {
            try{
                console.log('available')
                console.log(available)
                await icpService.setSensorProjectId(available.sensor_id, projectId);
                setAllocatingStatus('ALLOCATED :)')
                setTimeout(()=>setSelectedProject(null), 2000)
            } catch(e){
                console.log(e)
            }
        }
    }

    return <div>
        {!selectedProject && <>
            <div style={{ display: 'flex', flex: '0 1 auto', justifyContent: 'flex-start', fontFamily, fontWeight: 600, letterSpacing: '0.1em', color: '#1B1B1B', paddingLeft: 50, valign: 'middle', marginTop: 30}}>
            {props.signedIn &&
                    <>
                    <MenuItem selected={props.selected==='all projects'} onClick={(e)=>select(e,'all projects')} small>ALL PROJECTS</MenuItem>
                
                    <MenuItem selected={props.selected==='my projects'} onClick={(e)=>select(e,'my projects')} small>MY PROJECTS</MenuItem>
                
                    <MenuItem selected={props.selected==='launch project'} onClick={(e)=>select(e,'launch project')} small>
                        <FontAwesomeIcon icon={faRocket} /><span style={{paddingLeft: 3}}/> LAUNCH NEW
                    </MenuItem>
                    </>
                }
            </div>
            {props.selected==='launch project' && <Launch/>}
            {props.selected==='all projects' && <div style={{display: 'block', maxWidth: 800, marginLeft: 'auto', marginRight: 'auto', marginTop: 20}}>
                <ProjectList fetchFunction="get_projects_by_status" fixedStatus="Approved" onProjectSelect={handleProjectSelect} itemsPerPage={12}/>
            </div>}
        </>}
        
        {selectedProject && <ProjectDisplay 
                id={selectedProject.id} name={selectedProject.name} description={selectedProject.description} location={selectedProject.location}
                images={selectedProject.images} sensors_required={selectedProject.sensors_required} vote_count={selectedProject.vote_count} tags={selectedProject.tags}
                onAllocateSensor={allocateSensor} onBack={()=>setSelectedProject(null)} signedIn={props.signedIn} allocatingStatus={allocatingStatus} error={error}
        />}
    </div>
}

export default Projects