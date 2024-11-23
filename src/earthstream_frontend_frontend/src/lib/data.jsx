import { icpService } from '../services/icp_service';


const encodeGeohash = (lat, lng, precision = 7) => {
    const base32 = '0123456789bcdefghjkmnpqrstuvwxyz';
    let idx = 0; // index into base32 map
    let bit = 0; // each char holds 5 bits
    let evenBit = true;
    let geohash = '';
    
    let latMin = -90;
    let latMax = 90;
    let lngMin = -180;
    let lngMax = 180;
    
    while (geohash.length < precision) {
      if (evenBit) {
        // Longitude
        const lngMid = (lngMin + lngMax) / 2;
        if (lng >= lngMid) {
          idx = idx * 2 + 1;
          lngMin = lngMid;
        } else {
          idx = idx * 2;
          lngMax = lngMid;
        }
      } else {
        // Latitude
        const latMid = (latMin + latMax) / 2;
        if (lat >= latMid) {
          idx = idx * 2 + 1;
          latMin = latMid;
        } else {
          idx = idx * 2;
          latMax = latMid;
        }
      }
      
      evenBit = !evenBit;
      
      // 5 bits gives us a character
      bit++;
      if (bit === 5) {
        geohash += base32[idx];
        bit = 0;
        idx = 0;
      }
    }
    
    return geohash;
  };

export const launchProject = async (project) => {
    project.location.geohash = encodeGeohash(project.location.lat, project.location.lng)
    project.sensors_required = parseInt(project.sensors_required)
    if(!project.images.gallery) project.images.gallery = []
    let result = await icpService.createProject(project)
    return result
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

export const isAdmin = async (principal) => {
    if(!principal) return false
    let admin = await icpService.isAdmin(principal)
    return admin
}