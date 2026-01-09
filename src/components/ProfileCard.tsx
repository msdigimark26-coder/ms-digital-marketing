import React from 'react';
import './ProfileCard.css';

interface ProfileCardProps {
  name?: string;
  title?: string;
  avatarUrl?: string;
  miniAvatarUrl?: string;
  handle?: string;
  status?: string;
  contactText?: string;
  showUserInfo?: boolean;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  onContactClick?: () => void;
  className?: string;
  behindGlowEnabled?: boolean;
  behindGlowColor?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  name = 'User',
  title = 'Professional',
  avatarUrl = '/path/to/avatar.jpg',
  miniAvatarUrl,
  handle = 'user',
  status = 'Available',
  contactText = 'Contact',
  showUserInfo = false,
  enableTilt = true,
  enableMobileTilt = false,
  onContactClick,
  className = '',
  behindGlowEnabled = false,
  behindGlowColor = 'rgba(59, 130, 246, 0.5)'
}) => {
  return (
    <div 
      className={`profile-card ${enableTilt ? 'tilt-enabled' : ''} ${enableMobileTilt ? 'mobile-tilt-enabled' : ''} ${className}`.trim()}
      style={{
        '--behind-glow-color': behindGlowColor
      } as React.CSSProperties}
    >
      {behindGlowEnabled && (
        <div className="behind-glow" />
      )}
      
      <div className="profile-avatar">
        <img 
          src={avatarUrl} 
          alt={`${name}'s avatar`}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random`;
          }}
        />
        {miniAvatarUrl && (
          <div className="mini-avatar">
            <img src={miniAvatarUrl} alt={`${name}'s mini avatar`} />
          </div>
        )}
      </div>
      
      <div className="profile-content">
        <h3 className="profile-name">{name}</h3>
        {title && <p className="profile-title">{title}</p>}
        {showUserInfo && (
          <div className="profile-info">
            <span className="profile-handle">@{handle}</span>
            <span className="profile-status">{status}</span>
          </div>
        )}
        {onContactClick && (
          <button 
            className="profile-contact-btn"
            onClick={onContactClick}
          >
            {contactText}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
