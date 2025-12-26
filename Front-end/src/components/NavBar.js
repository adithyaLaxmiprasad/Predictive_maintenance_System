import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function NavBar() {
  const location = useLocation();
  
  // Add this useEffect to ensure body has no margins
  useEffect(() => {
    // Set these styles directly on the body element
    document.body.style.margin = '0';
    document.body.style.padding = '0';
    document.documentElement.style.margin = '0';
    document.documentElement.style.padding = '0';
    
    // Clean up when component unmounts
    return () => {
      document.body.style.margin = '';
      document.body.style.padding = '';
      document.documentElement.style.margin = '';
      document.documentElement.style.padding = '';
    };
  }, []);
  
  const navStyles = {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 2rem',
    background: 'linear-gradient(to right, #2c3e50, #3498db)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    margin: 0,
    width: '100vw', // Use viewport width instead of percentage
    boxSizing: 'border-box',
    position: 'fixed', // Fix it to the viewport
    top: 0,
    left: 0,
    zIndex: 1000, // Ensure it's above other content
  };
  
  // Add padding to the content below the navbar
  const spacerStyles = {
    height: '64px', // Match navbar height
    width: '100%'
  };
  
  // Rest of your styles...
  const logoStyles = {
    fontWeight: 'bold',
    fontSize: '1.5rem',
    marginRight: 'auto',
    color: 'white',
    textDecoration: 'none'
  };
  
  const linkContainerStyles = {
    display: 'flex',
    gap: '1.5rem',
  };
  
  const getLinkStyles = (path) => {
    const isActive = location.pathname === path;
    return {
      color: '#fff',
      textDecoration: 'none',
      padding: '0.5rem 0.75rem',
      borderRadius: '4px',
      transition: 'all 0.2s ease',
      background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
      fontWeight: isActive ? '500' : 'normal'
    };
  };

  return (
    <>
      <nav style={navStyles}>
        <Link to="/" style={logoStyles}>Predictive Maintenance</Link>
        <div style={linkContainerStyles}>
          <Link to="/" style={getLinkStyles('/')}>Home</Link>
          <Link to="/assets" style={getLinkStyles('/assets')}>Assets</Link>
          <Link to="/sensors" style={getLinkStyles('/sensors')}>Sensors</Link>
          <Link to="/predictions" style={getLinkStyles('/predictions')}>Predictions</Link>
        </div>
      </nav>
      <div style={spacerStyles}></div> {/* Spacer to prevent content from hiding under navbar */}
    </>
  );
}