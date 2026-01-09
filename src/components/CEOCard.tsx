import React from 'react';
import ProfileCard from './ProfileCard';

interface CEOCardProps {
  name?: string;
  avatarUrl?: string;
  miniAvatarUrl?: string;
  handle?: string;
  onContactClick?: () => void;
  status?: string;
  contactText?: string;
  enableTilt?: boolean;
  enableMobileTilt?: boolean;
  className?: string;
}

const CEOCard: React.FC<CEOCardProps> = ({
  name = 'Chief Executive Officer',
  avatarUrl = '/path/to/ceo-avatar.jpg',
  miniAvatarUrl,
  handle = 'ceo',
  onContactClick,
  status = 'Available',
  contactText = 'Schedule Meeting',
  enableTilt = true,
  enableMobileTilt = false,
  className = ''
}) => {
  return (
    <ProfileCard
      name={name}
      title="Chief Executive Officer"
      handle={handle}
      status={status}
      contactText={contactText}
      avatarUrl={avatarUrl}
      miniAvatarUrl={miniAvatarUrl}
      showUserInfo={true}
      enableTilt={enableTilt}
      enableMobileTilt={enableMobileTilt}
      onContactClick={onContactClick}
      className={`ceo-card ${className}`.trim()}
      behindGlowEnabled={true}
      behindGlowColor="rgba(184, 134, 11, 0.67)"
    />
  );
};

export default CEOCard;
