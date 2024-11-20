

export const launchProject = async (project) => {
    if(!window.projects) window.projects = {}
    let _exists = await exists(project.name)
    if(!_exists){
        window.projects[project.name.trim().toLowerCase()] = project
        return true
    }
    return false
}

export const getProjects = async () => {
    if(!window.projects) window.projects = {}
    return Object.keys(window.projects).map((key) => window.projects[key])
}

export const exists = async (name) => {
    if(!window.projects) window.projects = {}
    console.log(window.projects)
    return Object.keys(window.projects).indexOf(name.trim().toLowerCase()) > -1
}

export const isAdmin = async (user) => {
    return true
}