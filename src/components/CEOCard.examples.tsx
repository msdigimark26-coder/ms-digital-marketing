import CEOCard from './CEOCard';

/**
 * CEO Card Component Usage Examples
 * 
 * The CEOCard component is a specialized version of ProfileCard
 * designed specifically for CEO/leadership profiles.
 */

// Example 1: Basic CEO Card with default styling
export const BasicCEOCardExample = () => {
  return (
    <CEOCard
      name="Sai Sankara"
      avatarUrl="/images/ceo-avatar.jpg"
      handle="sai_sankara"
      onContactClick={() => {
        console.log('CEO contact clicked');
        window.location.href = 'mailto:ceo@company.com';
      }}
    />
  );
};

// Example 2: Fully customized CEO Card
export const CustomCEOCardExample = () => {
  return (
    <CEOCard
      name="Sai Sankara"
      title="Chief Executive Officer"
      avatarUrl="/images/ceo-main-avatar.jpg"
      miniAvatarUrl="/images/ceo-mini-avatar.jpg"
      handle="sai_sankara"
      status="Available for meetings"
      contactText="Schedule Meeting"
      enableTilt={true}
      enableMobileTilt={true}
      onContactClick={() => {
        // Handle meeting scheduling
        console.log('Schedule meeting clicked');
        // Redirect to calendar or booking page
      }}
      className="custom-ceo-styling"
    />
  );
};

// Example 3: CEO Card in a container with multiple profiles
export const CEOCardWithTeamExample = () => {
  const ceoProfiles = [
    {
      name: 'Sai Sankara',
      title: 'Chief Executive Officer',
      handle: 'sai_sankara',
      avatar: '/images/sai-avatar.jpg',
      status: 'Available'
    }
  ];

  return (
    <div className="ceo-container">
      {ceoProfiles.map((profile) => (
        <CEOCard
          key={profile.handle}
          name={profile.name}
          avatarUrl={profile.avatar}
          handle={profile.handle}
          status={profile.status}
          onContactClick={() => console.log(`Contact ${profile.name}`)}
        />
      ))}
    </div>
  );
};

// Example 4: CEO Card with event handlers
export const InteractiveCEOCardExample = () => {
  const handleCEOContact = () => {
    // Open a modal, redirect, or trigger an action
    const response = confirm('Do you want to schedule a meeting with the CEO?');
    if (response) {
      // Implement scheduling logic
      console.log('Opening CEO scheduling interface...');
    }
  };

  return (
    <div className="ceo-profile-section">
      <h2>Meet Our Leadership</h2>
      <CEOCard
        name="Sai Sankara"
        avatarUrl="/images/ceo-avatar.jpg"
        handle="sai_sankara"
        status="Open to opportunities"
        contactText="Get in Touch"
        onContactClick={handleCEOContact}
        enableTilt={true}
      />
    </div>
  );
};
