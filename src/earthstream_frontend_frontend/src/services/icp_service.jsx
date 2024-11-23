import { Actor, HttpAgent } from '@dfinity/agent';
import { AuthClient } from '@dfinity/auth-client';
import { FACTORIES, CANISTER_IDS } from './icp_config';
import { compressImage } from '../lib/image_tools';
import { Principal } from '@dfinity/principal';


const ProjectValidation = {
  /**
   * Validates project data structure and required fields
   */
  validateProjectData(data) {
    const errors = [];

    // Required string fields
    ['name', 'description', 'private_discord'].forEach(field => {
      if (!data[field] || typeof data[field] !== 'string' || !data[field].trim()) {
        errors.push(`${field} is required and must be a non-empty string`);
      }
    });

    // Gateway type
    if (!['Wifi', 'GSM'].includes(data.gateway_type)) {
      errors.push('gateway_type must be either "Wifi" or "GSM"');
    }

    // Images validation
    if (!data.images || typeof data.images !== 'object') {
      errors.push('images object is required');
    } else {
      if (!data.images.background || typeof data.images.background !== 'string') {
        errors.push('background image is required');
      }
      if(data.images.gallery){
        if (!Array.isArray(data.images.gallery)) {
          errors.push('gallery must be an array of image hashes');
        }
      }
    }

    // Location validation
    if (!data.location || typeof data.location !== 'object') {
      errors.push('location object is required');
    } else {
      if (typeof data.location.lat !== 'number' || data.location.lat < -90 || data.location.lat > 90) {
        errors.push('location.lat must be a valid latitude between -90 and 90');
      }
      if (typeof data.location.lng !== 'number' || data.location.lng < -180 || data.location.lng > 180) {
        errors.push('location.lng must be a valid longitude between -180 and 180');
      }
      if (!data.location.geohash || typeof data.location.geohash !== 'string') {
        errors.push('location.geohash is required');
      }
    }

    // Sensors required validation
    if (!Number.isInteger(data.sensors_required) || data.sensors_required < 1) {
      errors.push('sensors_required must be an integer greater than 0');
    }

    if(data.tags){
      // Tags validation
      if (!Array.isArray(data.tags)) {
        errors.push('tags must be an array');
      }
    }

    return errors;
  }
};

class ICPService {
  constructor() {
    this.identity = null;
    this.authenticatedAgent = null;
    this.anonymousAgent = null;
    this.authClient = null;
    this.actors = new Map();
    
    // Initialize anonymous agent synchronously
    this.initAnonymousAgent();
  }

  initAnonymousAgent() {
    this.anonymousAgent = HttpAgent.createSync({
      host: "https://icp0.io",
      fetch: window.fetch.bind(window)
    });

    /*
    if (process.env.NODE_ENV !== "production") {
      this.anonymousAgent.fetchRootKey().catch(console.error);
    }
    */
  }

  /**
   * Initialize auth client and check for existing identity
   */
  async init() {
    this.authClient = await AuthClient.create();
    const identity = this.authClient.getIdentity();
    
    if (identity) {
      await this.updateIdentity(identity);
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated() {
    if (!this.authClient) {
      await this.init();
    }
    return await this.authClient.isAuthenticated();
  }

   /**
   * Login user
   */
   async login() {
    if (!this.authClient) {
      await this.init();
    }

    await new Promise((resolve, reject) => {
      this.authClient.login({
        identityProvider: process.env.NODE_ENV === "production" 
          ? "https://identity.ic0.app"
          : "http://localhost:4943?canisterId=rdmx6-jaaaa-aaaaa-aaadq-cai",
        onSuccess: resolve,
        onError: reject
      });
    });

    const identity = this.authClient.getIdentity();
    await this.updateIdentity(identity);
  }

  /**
   * Logout user
   */
  async logout() {
    if (!this.authClient) {
      await this.init();
    }
    await this.authClient.logout();
    this.identity = null;
    this.authenticatedAgent = null;
    this.actors.clear();
  }

   /**
   * Update service with new identity
   */
   async updateIdentity(identity) {
    if (this.identity?.getPrincipal().toText() !== identity?.getPrincipal().toText()) {
      this.identity = identity;
      this.authenticatedAgent = null;
      this.actors.clear();
      
      if (identity) {
        this.authenticatedAgent = new HttpAgent({
          host: "https://icp0.io",
          identity: identity,
        });

        /*
        if (process.env.NODE_ENV !== "production") {
          await this.authenticatedAgent.fetchRootKey();
        }
        */
      }
    }
  }

  /**
   * Get actor for a specific canister
   */
  async getActor(canisterId, idlFactory, requireAuth = false) {
    // Check authentication if required
    if (requireAuth && !(await this.isAuthenticated())) {
      throw new Error('Authentication required. Please login first.');
    }

    const actorKey = `${canisterId}-${requireAuth}`;
    
    if (this.actors.has(actorKey)) {
      return this.actors.get(actorKey);
    }

    let agent;
    if (requireAuth) {
      if (!this.authenticatedAgent) {
        throw new Error('Authentication required for this operation');
      }
      agent = this.authenticatedAgent;
    } else {
      agent = this.anonymousAgent;
    }

    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });

    this.actors.set(actorKey, actor);
    return actor;
  }


  // Image Canister Methods
  async uploadImage(file, hash) {
    const actor = await this.getActor(CANISTER_IDS.IMAGES, FACTORIES.IMAGES, true);
    return uploadToICP(file, hash, actor);
  }

  async fetchImage(fileId) {
    const actor = await this.getActor(CANISTER_IDS.IMAGES, FACTORIES.IMAGES, false);
    return fetchFromICP(fileId, actor);
  }

  /**
   * Creates a new project
   * @example
   * const projectData = {
   *   name: "Rewilding project",
   *   description: "Monitoring city air quality",
   *   gateway_type: "Wifi",
   *   images: {
   *     background: "abc123",
   *     gallery: ["def456"]
   *   },
   *   location: {
   *     lat: 37.7749,
   *     lng: -122.4194,
   *     address: "123 Sensor St",
   *     geohash: "9q8yy"
   *   },
   *   project_discord: "https://discord.gg/xyz",
   *   private_discord: "https://discord.gg/private",
   *   sensors_required: 1,
   *   video: "https://youtube.com/watch?v=123",
   *   tags: ["environment", "smart-city"]
   * };
   * const projectId = await icpService.createProject(projectData);
   */
  async createProject(projectData) {
    console.log(projectData)
    // Ensure user is authenticated
    if (!(await this.isAuthenticated())) {
      await this.login();
    }

    const errors = ProjectValidation.validateProjectData(projectData);
    if (errors.length > 0) {
      throw new Error(`Invalid project data: ${errors.join(', ')}`);
    }

    try{
      const transformed = this._transformProjectData(projectData);
      const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, true);
      const result = await actor.create_project(transformed);
      
      if ('Err' in result) {
        throw new Error(result.Err);
      }
      return result.Ok;
    } catch(error){
      console.error('Create project error:', error);
      if (error.message.includes('Invalid signature')) {
        // Handle authentication error
        await this.logout();  // Clear invalid authentication state
        throw new Error('Authentication expired. Please login again.');
      }
      throw error;
    }
  }

  /**
   * Updates an existing project
   * @example
   * const updates = {
   *   name: "Updated Name",
   *   description: "Updated description",
   *   sensors_required: 2
   * };
   * await icpService.updateProject("project-id-123", updates);
   */
  async updateProject(projectId, projectData) {
    const errors = ProjectValidation.validateProjectData(projectData);
    if (errors.length > 0) {
      throw new Error(`Invalid project data: ${errors.join(', ')}`);
    }

    const transformed = this._transformProjectData(projectData);
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, true);
    const result = await actor.update_project(projectId, transformed);
    
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  /**
   * Updates project status (admin only)
   * @example
   * await icpService.updateProjectStatus("project-id-123", "Approved");
   */
  async updateProjectStatus(projectId, status) {
    const transformed = this._transformStatus(status);
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, true);
    const result = await actor.update_project_status(projectId, transformed);
    
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  // Feature Management (Authenticated)
  async featureProject(projectId) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, true);
    const result = await actor.feature_project(projectId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  async unfeatureProject(projectId) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, true);
    const result = await actor.unfeature_project(projectId);
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  /**
   * Votes for a project
   * @example
   * try {
   *   await icpService.voteForProject("project-id-123");
   *   console.log("Vote recorded successfully");
   * } catch (error) {
   *   console.error("Failed to vote:", error.message);
   * }
   */
  async voteForProject(projectId) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, true);
    const result = await actor.vote_for_project(projectId);
    
    if ('Err' in result) {
      throw new Error(result.Err);
    }
    return result.Ok;
  }

  // Project Queries (Non-authenticated)
  async getAllTags() {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    return actor.get_all_tags();
  }

 /**
   * Retrieves projects with pagination and transforms the response
   * @example
   * const featured = await icpService.getFeaturedProjects(1, 10);
   * console.log(`Showing ${featured.projects.length} of ${featured.total} projects`);
   * console.log(`Page ${featured.page} of ${featured.pages}`);
   */
  async getFeaturedProjects(page = 1, limit = 20) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    const response = await actor.get_featured_projects([page], [limit]);
    return this._transformProjectsResponse(response);
  }

  /**
   * Retrieves a single project
   * @example
   * const project = await icpService.getProject("project-id-123");
   * if (project) {
   *   console.log(`Found project: ${project.name}`);
   * }
   */
  async getProject(projectId) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    const project = await actor.get_project(projectId);
    return this._reverseTransformProject(project);
  }

  async getProjectVotes(projectId) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    return actor.get_project_votes(projectId);
  }

  async getProjectsByDateRange(startDate, endDate, page = 1, limit = 20) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    return actor.get_projects_by_date_range(startDate, endDate, [page], [limit]);
  }

  async getProjectsByIds(projectIds, page = 1, limit = 20) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    return actor.get_projects_by_ids(projectIds, [page], [limit]);
  }

  /**
 * Gets projects filtered by status with pagination
 * @param {string} status - Project status ('PendingReview', 'Approved', 'Rejected', 'Suspended')
 * @param {number} [page=1] - Page number (optional)
 * @param {number} [limit=20] - Number of items per page (optional)
 * @returns {Promise<ProjectsResponse>} Paginated projects matching the status
 * 
 * @example
 * const response = await icpService.getProjectsByStatus('Approved', 1, 10);
 * console.log(`Found ${response.total} approved projects`);
 * response.projects.forEach(project => {
 *   console.log(`${project.name} - Created: ${new Date(Number(project.created_at))}`);
 * });
 */
async getProjectsByStatus(status, page = 1, limit = 20) {
  const validStatuses = ['PendingReview', 'Approved', 'Rejected', 'Suspended'];
  if (!validStatuses.includes(status)) {
    throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
  }

  try {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    const response = await actor.get_projects_by_status(
      { [status]: null }, // Transform to Candid variant format
      [page],
      [limit]
    );
    
    return this._transformProjectsResponse(response);
  } catch (error) {
    console.error('Get projects by status error:', error);
    throw new Error(`Failed to fetch projects by status: ${error.message}`);
  }
}

  /**
   * Searches projects by location
   * @example
   * const nearbyProjects = await icpService.getProjectsByLocation(
   *   37.7749,   // latitude
   *   -122.4194, // longitude
   *   10         // radius in kilometers
   * );
   */
  async getProjectsByLocation(lat, lng, radius) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    const projects = await actor.get_projects_by_location(lat, lng, radius);
    return projects.map(p => this._reverseTransformProject(p));
  }

  async getProjectsByOwner(ownerPrincipal, page = 1, limit = 20) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    return actor.get_projects_by_owner(ownerPrincipal, [page], [limit]);
  }

  async getProjectsByTag(tag, page = 1, limit = 20) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    return actor.get_projects_by_tag(tag, [page], [limit]);
  }

  async getTotalProjects() {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    return actor.get_total_projects();
  }

   /**
   * Checks if a principal has admin privileges
   * @param {string|Principal} principal - Principal ID as string or Principal object
   * @returns {Promise<boolean>} True if principal is an admin
   * @throws {Error} If principal is invalid
   * 
   * @example
   * // Using principal string
   * const isUserAdmin = await icpService.isAdmin("tdvhl-fy3df-...");
   * 
   * // Using Principal object
   * const principal = await icpService.getCurrentPrincipal();
   * const isUserAdmin = await icpService.isAdmin(principal);
   */
   async isAdmin(principal) {
    try {
      // Convert string to Principal if needed
      const principalObj = typeof principal === 'string' 
        ? Principal.fromText(principal)
        : principal;

      if (!(principalObj instanceof Principal)) {
        throw new Error('Invalid principal');
      }

      const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
      return actor.is_admin(principalObj);
    } catch (error) {
      console.error('isAdmin error:', error);
      throw new Error(`Failed to check admin status: ${error.message}`);
    }
  }

  /**
   * Checks if current user is an admin
   * @returns {Promise<boolean>} True if current user is an admin
   * @example
   * if (await icpService.isCurrentUserAdmin()) {
   *   // Show admin features
   * }
   */
  async isCurrentUserAdmin() {
    const principal = await this.getCurrentPrincipal();
    if (!principal) return false;
    return this.isAdmin(principal);
  }

   /**
   * Get the current user's principal
   * @returns {Principal|null} The user's principal or null if not authenticated
   */
   async getCurrentPrincipal() {
    if (!this.authClient) {
      await this.init();
    }
    if (await this.isAuthenticated()) {
      return this.authClient.getIdentity().getPrincipal();
    }
    return null;
  }
  

  /**
   * Searches projects by text
   * @example
   * const results = await icpService.searchProjects("air quality");
   * console.log(`Found ${results.total} matching projects`);
   */
  async searchProjects(query, page = 1, limit = 20) {
    const actor = await this.getActor(CANISTER_IDS.PROJECTS, FACTORIES.PROJECTS, false);
    const response = await actor.search_projects(query, [page], [limit]);
    return this._transformProjectsResponse(response);
  }

  //images:

  async uploadImage(file, hash) {
    try {
      if (!this.authenticatedAgent) {
        throw new Error('Authentication required for upload');
      }

      // Compress the image
      const compressedFile = await compressImage(file);
      console.log('Compressed file size:', compressedFile.size);

      // Convert to ArrayBuffer then Uint8Array
      const arrayBuffer = await compressedFile.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);

      console.log('Preparing upload:', {
        size: uint8Array.length,
        type: compressedFile.type,
        firstFewBytes: Array.from(uint8Array.slice(0, 10))
      });

      // Get the actor instance for the images canister
      const actor = await this.getActor(CANISTER_IDS.IMAGES, FACTORIES.IMAGES, true);

      // Call the upload_file method
      const uploadResult = await actor.upload_file(
        uint8Array,
        compressedFile.type
      );

      console.log('Upload result:', uploadResult);

      // Handle the result
      if ('Err' in uploadResult) {
        throw new Error(uploadResult.Err);
      }

      // Convert the FileId (Vec<Nat8>) to hex string
      const fileIdArray = Array.from(uploadResult.Ok);
      const fileIdHex = fileIdArray.map(b => b.toString(16).padStart(2, '0')).join('');

      // Create preview URL
      const previewUrl = URL.createObjectURL(compressedFile);

      return {
        hash: fileIdHex,
        rawHash: fileIdArray,
        url: previewUrl,
        fileId: fileIdHex
      };
    } catch (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload to Internet Computer: ' + error.message);
    }
  }

  async fetchImage(fileId) {
    try {
      const actor = await this.getActor(CANISTER_IDS.IMAGES, FACTORIES.IMAGES, false);
      const result = await actor.get_file(fileId);

      if ('Err' in result) {
        throw new Error(result.Err);
      }

      const { mime_type: mimeType, file } = result.Ok;

      if (!(file instanceof Uint8Array)) {
        throw new Error('Unexpected file type, expected Uint8Array');
      }

      const blob = new Blob([file], { type: mimeType });
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error('Fetch error:', error);
      throw new Error('Failed to fetch from Internet Computer: ' + error.message);
    }
  }

  /**
   * Transforms project data for Candid format
   * @private
   */
  _transformProjectData(data) {
    return {
      ...data,
      gateway_type: { [data.gateway_type]: null },
      project_discord: data.project_discord ? [data.project_discord] : [],
      video: data.video ? [data.video] : [],
      tags: Array.isArray(data.tags) ? data.tags : []
    };
  }

  /**
   * Reverses the transformation from Candid format
   * @private
   */
  _reverseTransformProject(project) {
    if (!project) return null;

    const gatewayType = Object.keys(project.gateway_type)[0];
    const status = Object.keys(project.status)[0];

    return {
      ...project,
      gateway_type: gatewayType,
      status: status,
      project_discord: project.project_discord[0] || null,
      video: project.video[0] || null
    };
  }

  /**
   * Transforms project status for Candid format
   * @private
   */
  _transformStatus(status) {
    const validStatuses = ['PendingReview', 'Approved', 'Rejected', 'Suspended'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }
    return { [status]: null };
  }

  /**
   * Transforms a ProjectsResponse from Candid format
   * @private
   */
  _transformProjectsResponse(response) {
    return {
      projects: response.projects.map(p => this._reverseTransformProject(p)),
      total: Number(response.total),
      page: response.page,
      pages: response.pages
    };
  }

}



// Create and export a singleton instance
export const icpService = new ICPService();


  