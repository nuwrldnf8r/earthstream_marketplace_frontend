import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle, Loader } from 'lucide-react';
import { icpService } from '../services/icp_service';
import ProjectCard from './project_card';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    padding: '20px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '24px',
    width: '100%'
  },
  select: {
    width: '100%',
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #d1d5db',
    marginBottom: '16px'
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px'
  },
  errorContainer: {
    padding: '16px',
    backgroundColor: '#fee2e2',
    border: '1px solid #ef4444',
    borderRadius: '8px',
    color: '#dc2626',
    margin: '20px 0'
  },
  emptyContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    minHeight: '200px',
    textAlign: 'center',
    gap: '16px'
  },
  paginationContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '32px'
  },
  pageButton: {
    padding: '8px',
    borderRadius: '50%',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed'
  },
  pageText: {
    fontSize: '14px',
    color: '#4b5563'
  }
};

const EmptyState = ({ fetchFunction, status }) => {
  let message = '';
  let title = 'No Projects Found';

  switch (fetchFunction) {
    case 'get_featured_projects':
      title = 'No Featured Projects';
      message = 'There are currently no featured projects available.';
      break;
    case 'get_projects_by_owner':
      title = 'No Projects Yet';
      message = status ? 
        `You don't have any projects with status: ${status}` :
        'You haven\'t created any projects yet.';
      break;
    case 'get_projects_by_status':
      message = `No projects found with status: ${status}`;
      break;
    default:
      message = 'No projects match your current criteria.';
  }

  return (
    <div style={styles.emptyContainer}>
      <AlertCircle size={48} style={{ color: '#9ca3af' }} />
      <div>
        <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>{title}</div>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>{message}</div>
      </div>
    </div>
  );
};

const ProjectList = ({
  fetchFunction = 'get_featured_projects',
  owner = null,
  fixedStatus = null,
  itemsPerPage = 12,
  onProjectSelect = () => {}
}) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState(fixedStatus);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const statusOptions = [
    { value: 'Approved', label: 'Approved' },
    { value: 'PendingReview', label: 'Pending Review' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Suspended', label: 'Suspended' }
  ];

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await icpService.isAuthenticated();
      setIsAuthenticated(auth);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [currentPage, selectedStatus, owner, refreshTrigger]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      let response;
      switch (fetchFunction) {
        case 'get_featured_projects':
          response = await icpService.getFeaturedProjects(currentPage, itemsPerPage);
          break;
        
        case 'get_projects_by_owner':
          if (!owner) throw new Error('Owner is required for get_projects_by_owner');
          response = await icpService.getProjectsByOwner(owner, currentPage, itemsPerPage);
          if (selectedStatus) {
            response.projects = response.projects.filter(p => p.status === selectedStatus);
          }
          break;
        
        case 'get_projects_by_status':
          if (!selectedStatus && !fixedStatus) {
            throw new Error('Status is required for get_projects_by_status');
          }
          response = await icpService.getProjectsByStatus(
            selectedStatus || fixedStatus, 
            currentPage, 
            itemsPerPage
          );
          break;

        default:
          throw new Error('Invalid fetch function specified');
      }

      // Convert BigInt values to Numbers in the response
      const convertedProjects = response.projects.map(project => ({
        ...project,
        vote_count: Number(project.vote_count)
      }));

      setProjects(convertedProjects);
      setTotalPages(Number(response.pages));
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
    const handleVoteComplete = () => {
      setRefreshTrigger(prev => prev + 1);
    };
  
    if (loading) {
      return (
        <div style={styles.loadingContainer}>
          <Loader className="animate-spin" size={48} />
        </div>
      );
    }
  
    if (error) {
      return (
        <div style={styles.errorContainer}>
          <div style={{ fontWeight: '600', marginBottom: '4px' }}>Error</div>
          <div>{error}</div>
        </div>
      );
    }
  
    if (!projects.length) {
      return <EmptyState fetchFunction={fetchFunction} status={selectedStatus || fixedStatus} />;
    }
  
    return (
      <div style={styles.container}>
        {fetchFunction === 'get_projects_by_owner' && !fixedStatus && (
          <select 
            value={selectedStatus || ''}
            onChange={(e) => setSelectedStatus(e.target.value || null)}
            style={styles.select}
          >
            <option value="">All Statuses</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        )}
  
        <div style={styles.grid}>
          {projects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              isAuthenticated={isAuthenticated}
              onProjectSelect={onProjectSelect}
              onVoteComplete={handleVoteComplete}
            />
          ))}
        </div>
  
        {totalPages > 1 && (
          <div style={styles.paginationContainer}>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              style={{
                ...styles.pageButton,
                ...(currentPage === 1 ? styles.disabledButton : {})
              }}
            >
              <ChevronLeft size={24} />
            </button>
            
            <span style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              style={{
                ...styles.pageButton,
                ...(currentPage === totalPages ? styles.disabledButton : {})
              }}
            >
              <ChevronRight size={24} />
            </button>
          </div>
        )}
      </div>
    );
  };
  
  export default ProjectList;