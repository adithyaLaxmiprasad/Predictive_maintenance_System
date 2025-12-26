import React, { useEffect, useState } from 'react';
import { fetchAssets } from '../api/model';

export default function AssetTracker() {
  const [assets, setAssets] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);

  useEffect(() => {
    fetchAssets().then(resp => setAssets(resp.data));
  }, []);

  const containerStyles = {
    padding: '1.5rem',
    borderRadius: '8px',
    backgroundColor: '#f8f9fa',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
    marginBottom: '2rem'
  };

  const titleStyles = {
    color: '#2c3e50',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #3498db',
    paddingBottom: '0.5rem',
    fontWeight: 500
  };

  const layoutContainerStyles = {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'flex-start'
  };

  const mapContainerStyles = {
    position: 'relative',
    width: '100%',
    maxWidth: 800,
    height: 600,
    background: 'linear-gradient(to right, #e6e9f0, #eef1f5)',
    borderRadius: '6px',
    boxShadow: 'inset 0 0 20px rgba(0,0,0,0.05)',
    overflow: 'hidden',
    border: '1px solid #ddd',
    flex: 1
  };

  const assetInfoStyles = {
    position: 'absolute',
    bottom: '20px',
    right: '20px',
    padding: '10px 15px',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '4px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    display: selectedAsset ? 'block' : 'none'
  };

  const sidebarStyles = {
    width: '300px',
    padding: '1.25rem',
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    height: '600px',
    display: 'flex',
    flexDirection: 'column'
  };

  const sidebarTitleStyles = {
    fontSize: '1.1rem',
    color: '#2c3e50',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #e2e8f0'
  };

  const assetListStyles = {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    overflowY: 'auto',
    flex: 1
  };

  const assetListItemStyles = (asset) => ({
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    cursor: 'pointer',
    backgroundColor: selectedAsset?.id === asset.id ? '#ebf5ff' : 'transparent',
    borderLeft: selectedAsset?.id === asset.id ? '3px solid #3498db' : '3px solid transparent',
    transition: 'all 0.2s ease'
  });

  const statusIndicatorStyles = (status) => {
    const colors = {
      'Online': '#22c55e',
      'Offline': '#ef4444',
      'Warning': '#f59e0b',
      'Maintenance': '#6366f1'
    };
    
    return {
      display: 'inline-block',
      width: '10px',
      height: '10px',
      borderRadius: '50%',
      backgroundColor: colors[status] || '#cbd5e1',
      marginRight: '8px'
    };
  };

  const assetDetailStyles = {
    backgroundColor: '#f8fafc',
    padding: '1rem',
    borderRadius: '4px',
    marginTop: '1rem'
  };

  const detailRowStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.5rem 0',
    borderBottom: '1px solid #f1f5f9'
  };

  return (
    <div style={containerStyles}>
      <h2 style={titleStyles}>Asset Locations</h2>
      <div style={layoutContainerStyles}>
        <div style={mapContainerStyles}>
          {/* Floorplan background */}
          {assets.map(a => (
            <div
              key={a.id}
              style={{
                position: 'absolute',
                left: `${a.x_pct}%`,
                top: `${a.y_pct}%`,
                transform: 'translate(-50%, -50%)',
                background: a.id === selectedAsset?.id ? '#e74c3c' : '#3498db',
                boxShadow: '0 0 10px rgba(0,0,0,0.2)',
                borderRadius: '50%',
                width: 16,
                height: 16,
                border: '2px solid white',
                transition: 'all 0.2s ease',
                cursor: 'pointer',
                zIndex: a.id === selectedAsset?.id ? 10 : 1
              }}
              title={`${a.name}`}
              onClick={() => setSelectedAsset(a)}
              onMouseEnter={() => setSelectedAsset(a)}
            />
          ))}
        </div>

        <div style={sidebarStyles}>
          <h3 style={sidebarTitleStyles}>Asset Information</h3>
          
          {selectedAsset ? (
            <div style={assetDetailStyles}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#334155' }}>{selectedAsset.name}</h4>
              
              <div style={detailRowStyles}>
                <span>Status</span>
                <span>
                  <span style={statusIndicatorStyles(selectedAsset.status)}></span>
                  {selectedAsset.status}
                </span>
              </div>
              
              <div style={detailRowStyles}>
                <span>Type</span>
                <span>{selectedAsset.type}</span>
              </div>
              
              <div style={detailRowStyles}>
                <span>Location</span>
                <span>X: {selectedAsset.x_pct}%, Y: {selectedAsset.y_pct}%</span>
              </div>
              
              <div style={{ marginTop: '1rem' }}>
                <button 
                  style={{
                    backgroundColor: '#3498db',
                    color: 'white',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    width: '100%'
                  }}
                >
                  View Sensor Data
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#64748b', marginTop: '2rem' }}>
              <p>Select an asset to view details</p>
              <p style={{ fontSize: '2rem', marginTop: '1rem' }}>👆</p>
            </div>
          )}
          
          <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
            <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.9rem' }}>Asset List</h4>
            <ul style={assetListStyles}>
              {assets.map(asset => (
                <li 
                  key={asset.id} 
                  style={assetListItemStyles(asset)}
                  onClick={() => setSelectedAsset(asset)}
                >
                  <span style={statusIndicatorStyles(asset.status)}></span>
                  {asset.name}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#666' }}>
        <p>Total assets: {assets.length} • Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
}