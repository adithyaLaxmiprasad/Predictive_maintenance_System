import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const containerStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem 1.5rem'
  };

  const headerStyles = {
    fontSize: '2.5rem',
    color: '#2c3e50',
    marginBottom: '1.5rem',
    fontWeight: '600',
    borderBottom: '3px solid #3498db',
    paddingBottom: '0.75rem'
  };

  const subheaderStyles = {
    fontSize: '1.2rem',
    color: '#7f8c8d',
    marginBottom: '2.5rem',
    lineHeight: '1.6'
  };

  const cardContainerStyles = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
    marginTop: '2rem',
    marginBottom: '3rem'
  };

  const cardStyles = {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #e2e8f0'
  };

  const cardIconStyles = {
    fontSize: '2rem',
    color: '#3498db',
    marginBottom: '1rem'
  };

  const cardTitleStyles = {
    fontSize: '1.25rem',
    fontWeight: '500',
    marginBottom: '0.75rem',
    color: '#2c3e50'
  };

  // Team Section Styles
  const teamSectionStyles = {
    marginTop: '3rem',
    paddingTop: '2rem',
    borderTop: '1px solid #e2e8f0'
  };

  const teamHeadingStyles = {
    fontSize: '1.8rem',
    color: '#2c3e50',
    marginBottom: '1.5rem',
    textAlign: 'center'
  };

  const carouselContainerStyles = {
    position: 'relative',
    overflow: 'hidden',
    padding: '2rem 0',
    borderRadius: '8px',
    backgroundColor: '#f8fafc',
    boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.05)'
  };

  const carouselStyles = {
    display: 'flex',
    transition: 'transform 0.5s ease',
    padding: '0 1rem'
  };

  const memberCardStyles = {
    minWidth: '300px',
    flex: '0 0 300px',
    padding: '1.5rem',
    margin: '0 1rem',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
    textAlign: 'center',
    border: '1px solid #e2e8f0'
  };

  const memberNameStyles = {
    fontSize: '1.2rem',
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: '0.5rem'
  };

  const memberUsnStyles = {
    fontSize: '0.9rem',
    color: '#3498db',
    marginBottom: '0.5rem',
    fontFamily: 'monospace',
    fontWeight: '600'
  };

  const memberCollegeStyles = {
    fontSize: '0.85rem',
    color: '#7f8c8d',
    fontStyle: 'italic',
    fontWeight: '600'
  };

  const navButtonStyles = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: '#3498db',
    color: 'white',
    border: 'none',
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    zIndex: 10
  };

  // Team data
  const teamMembers = [
    {
      id: 1,
      name: "ADITHYA L",
      usn: "1BY22IS400",
      college: "BMS Institute of Technology and Management"
    },
    {
      id: 2,
      name: "Dasari Ushodaya",
      usn: "1BY21IS036",
      college: "BMS Institute of Technology and Management"
    },
    {
      id: 3,
      name: "J V Akash",
      usn: "1BY21IS057",
      college: "BMS Institute of Technology and Management"
    },
    {
      id: 4,
      name: "G Hruthik Reddy",
      usn: "1BY21IS050",
      college: "BMS Institute of Technology and Management"
    }
  ];

  // Carousel state and handlers
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === teamMembers.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevSlide = () => {
    setCurrentIndex(prevIndex => 
      prevIndex === 0 ? teamMembers.length - 1 : prevIndex - 1
    );
  };

  // Auto-scrolling carousel
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 3000);
    
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={containerStyles}>
      <h1 style={headerStyles}>Welcome to Predictive Maintenance Dashboard</h1>
      <p style={subheaderStyles}>
        Monitor equipment health, track assets, and predict maintenance needs with our comprehensive dashboard.
        Use the navigation above or the quick links below to access key features.
      </p>

      <div style={cardContainerStyles}>
        <Link to="/assets" style={{ textDecoration: 'none' }}>
          <div style={cardStyles}>
            <div style={cardIconStyles}>
              <span role="img" aria-label="Location pin">📍</span>
            </div>
            <h3 style={cardTitleStyles}>Asset Tracking</h3>
            <p>View and manage all your assets in real-time. Monitor location and status information.</p>
          </div>
        </Link>
        
        <Link to="/sensors" style={{ textDecoration: 'none' }}>
          <div style={cardStyles}>
            <div style={cardIconStyles}>
              <span role="img" aria-label="Chart">📊</span>
            </div>
            <h3 style={cardTitleStyles}>Sensor Data</h3>
            <p>Access live sensor streams with temperature, vibration and other critical metrics.</p>
          </div>
        </Link>
        
        <Link to="/predictions" style={{ textDecoration: 'none' }}>
          <div style={cardStyles}>
            <div style={cardIconStyles}>
              <span role="img" aria-label="Crystal ball">🔮</span>
            </div>
            <h3 style={cardTitleStyles}>Maintenance Predictions</h3>
            <p>View failure risk predictions and preventive maintenance recommendations.</p>
          </div>
        </Link>
      </div>

      {/* Team Members Section */}
      <div style={teamSectionStyles}>
        <h2 style={teamHeadingStyles}>Our Team</h2>
        
        <div style={carouselContainerStyles}>
          <button 
            style={{ ...navButtonStyles, left: '10px' }}
            onClick={prevSlide}
            aria-label="Previous team member"
          >
            &#8249;
          </button>
          
          <div 
            style={{
              ...carouselStyles,
              transform: `translateX(calc(-${currentIndex * 100}% / ${teamMembers.length}))`
            }}
          >
            {teamMembers.map(member => (
              <div key={member.id} style={memberCardStyles}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👨‍💻</div>
                <div style={memberNameStyles}>{member.name}</div>
                <div style={memberUsnStyles}>{member.usn}</div>
                <div style={memberCollegeStyles}>{member.college}</div>
              </div>
            ))}
          </div>
          
          <button 
            style={{ ...navButtonStyles, right: '10px' }}
            onClick={nextSlide}
            aria-label="Next team member"
          >
            &#8250;
          </button>
          
          {/* Carousel indicators */}
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            {teamMembers.map((_, index) => (
              <button
                key={index}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  margin: '0 5px',
                  padding: 0,
                  border: 'none',
                  backgroundColor: currentIndex === index ? '#3498db' : '#cbd5e1',
                  cursor: 'pointer'
                }}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}