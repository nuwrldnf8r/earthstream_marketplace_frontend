import React, { useState, useEffect } from 'react';
import { ThumbsUp, ExternalLink, MessageCircle, Share2, Loader } from 'lucide-react';
import { icpService } from '../services/icp_service';
import ICImage from './ic_image';

const styles = {
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'box-shadow 0.3s ease',
    border: '1px solid #eaeaea'
  },
  cardHover: {
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)'
  },
  imageContainer: {
    position: 'relative',
    height: '200px',
    width: '100%'
  },
  contentContainer: {
    padding: '16px'
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    marginBottom: '8px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  description: {
    fontSize: '14px',
    color: '#666666',
    marginBottom: '16px',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
    lineHeight: '1.4'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  actions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center'
  },
  voteButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    border: 'none',
    background: 'none',
    padding: '4px',
    fontSize: '14px',
    transition: 'all 0.2s ease'
  },
  voteButtonActive: {
    color: '#2563eb',
    cursor: 'pointer'
  },
  voteButtonInactive: {
    color: '#6b7280',
    cursor: 'default'
  },
  voteButtonVoted: {
    color: '#2563eb',
    cursor: 'pointer'
  },
  discordLink: {
    color: '#7c3aed',
    display: 'flex',
    alignItems: 'center',
    transition: 'color 0.2s ease'
  },
  discordLinkHover: {
    color: '#6d28d9'
  },
  shareButton: {
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    background: 'none',
    color: '#6b7280',
    cursor: 'pointer',
    padding: '4px',
    transition: 'color 0.2s ease'
  },
  shareButtonHover: {
    color: '#4b5563'
  },
  externalIcon: {
    color: '#9ca3af'
  }
};

const ProjectCard = ({
  project = {},
  isAuthenticated,
  onProjectSelect,
  onVoteComplete,
  style = {}
}) => {
  const {
    id = '',
    name = '',
    description = '',
    images = { background: '' },
    project_discord = '',
    vote_count = 0
  } = project;

  const [voteCount, setVoteCount] = useState(Number(vote_count));
  const [isHovered, setIsHovered] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [shareUrl, setShareUrl] = useState('');
  const [isShareHovered, setIsShareHovered] = useState(false);
  const [isDiscordHovered, setIsDiscordHovered] = useState(false);

  useEffect(() => {
    const checkVoteStatus = async () => {
      if (isAuthenticated && id) {
        try {
          const principal = await icpService.getCurrentPrincipal();
          const voted = await icpService.getUserVoteForProject(id, principal);
          setHasVoted(voted);
        } catch (error) {
          console.error('Failed to check vote status:', error);
        }
      }
    };

    if (id) {
      const baseUrl = window.location.origin;
      setShareUrl(`${baseUrl}?project=${id}`);
      checkVoteStatus();
    }
  }, [id, isAuthenticated]);

  useEffect(() => {
    setVoteCount(Number(vote_count));
  }, [vote_count]);

  const handleVote = async (e) => {
    e.stopPropagation();
    
    // Early return if not authenticated or already voting
    if (!isAuthenticated) {
      try {
        await icpService.login();
        return;
      } catch (error) {
        console.error('Login failed:', error);
        return;
      }
    }

    if (!id || isVoting) return;

    try {
      setIsVoting(true);
      
      if (hasVoted) {
        await icpService.removeVote(id);
        setVoteCount(prev => prev - 1);
        setHasVoted(false);
      } else {
        await icpService.voteForProject(id);
        setVoteCount(prev => prev + 1);
        setHasVoted(true);
      }
      
      if (onVoteComplete) {
        onVoteComplete();
      }
    } catch (error) {
      console.error('Vote operation failed:', error);
      setVoteCount(Number(vote_count));
      setHasVoted(!hasVoted);
    } finally {
      setIsVoting(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    
    if (!id) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: name,
          text: description,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          fallbackShare();
        }
      }
    } else {
      fallbackShare();
    }
  };

  const fallbackShare = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log('Link copied to clipboard');
      });
    }
  };

  if (!id) return null;

  return (
    <div 
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
        ...style
      }}
      onClick={() => onProjectSelect(id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={styles.imageContainer}>
        <ICImage
          fileId={images.background}
          alt={name}
          containerStyle={{ height: '100%', width: '100%' }}
          imageStyle={{ objectFit: 'cover', height: '100%', width: '100%' }}
        />
      </div>
      
      <div style={styles.contentContainer}>
        <h3 style={styles.title}>{name}</h3>
        <p style={styles.description}>{description}</p>
        
        <div style={styles.footer}>
          <div style={styles.actions}>
            <button 
              onClick={handleVote}
              disabled={!isAuthenticated || isVoting}
              style={{
                ...styles.voteButton,
                ...(!isAuthenticated ? styles.voteButtonInactive : {}),
                ...(hasVoted ? styles.voteButtonVoted : {}),
                ...(isAuthenticated ? styles.voteButtonActive : {}),
                cursor: isAuthenticated ? 'pointer' : 'default'
              }}
            >
              {isVoting ? (
                <Loader className="animate-spin" size={16} />
              ) : (
                <ThumbsUp 
                  size={16} 
                  fill={hasVoted ? 'currentColor' : 'none'}
                  style={{ opacity: isAuthenticated ? 1 : 0.5 }}
                />
              )}
              <span>{voteCount}</span>
            </button>
            
            {project_discord && (
              <a 
                href={project_discord}
                target="_blank"
                rel="noopener noreferrer"
                onClick={e => e.stopPropagation()}
                style={{
                  ...styles.discordLink,
                  ...(isDiscordHovered ? styles.discordLinkHover : {})
                }}
                onMouseEnter={() => setIsDiscordHovered(true)}
                onMouseLeave={() => setIsDiscordHovered(false)}
              >
                <MessageCircle size={16} />
              </a>
            )}
            
            <button
              onClick={handleShare}
              style={{
                ...styles.shareButton,
                ...(isShareHovered ? styles.shareButtonHover : {})
              }}
              onMouseEnter={() => setIsShareHovered(true)}
              onMouseLeave={() => setIsShareHovered(false)}
            >
              <Share2 size={16} />
            </button>
          </div>

          <ExternalLink size={16} style={styles.externalIcon} />
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;