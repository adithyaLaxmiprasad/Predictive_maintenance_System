import React from 'react';
import { useEffect, useState } from 'react';
import { fetchPredictions } from '../api/model';

export default function PredictionDashboard() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await fetchPredictions();
      let newData = resp.data;
      
      // Limit to 10 predictions
      if (newData.length > 10) {
        newData = newData.slice(0, 10);
      }
      
      // Check if new data is different from current data
      const hasChanged = JSON.stringify(newData) !== JSON.stringify(rows);
      
      if (hasChanged) {
        // Sort by timestamp to show newest first
        newData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        setRows(newData);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching predictions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

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
    fontWeight: 500,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  };

  const controlsStyles = {
    display: 'flex',
    gap: '0.5rem',
    alignItems: 'center'
  };

  const buttonStyles = {
    padding: '0.5rem 1rem',
    borderRadius: '4px',
    border: 'none',
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s'
  };

  const refreshButtonStyles = {
    ...buttonStyles,
    backgroundColor: '#3498db',
    color: 'white'
  };

  const toggleButtonStyles = {
    ...buttonStyles,
    backgroundColor: autoRefresh ? '#22c55e' : '#6b7280',
    color: 'white'
  };

  const tableStyles = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    backgroundColor: 'white'
  };

  const thStyles = {
    backgroundColor: '#f1f5f9',
    color: '#334155',
    padding: '12px 16px',
    textAlign: 'left',
    fontWeight: 600,
    borderBottom: '2px solid #e2e8f0'
  };

  const tdStyles = {
    padding: '12px 16px',
    borderBottom: '1px solid #e2e8f0',
    color: '#1e293b'
  };

  const getRiskStyles = (risk) => {
    let riskLevel, bgColor, textColor, borderColor;
    
    if (risk >= 0.8) {
      riskLevel = 'Critical';
      bgColor = 'rgba(220, 38, 38, 0.1)';
      textColor = '#dc2626';
      borderColor = '#fecaca';
    } else if (risk >= 0.6) {
      riskLevel = 'High';
      bgColor = 'rgba(239, 68, 68, 0.1)';
      textColor = '#ef4444';
      borderColor = '#fecaca';
    } else if (risk >= 0.4) {
      riskLevel = 'Medium';
      bgColor = 'rgba(245, 158, 11, 0.1)';
      textColor = '#f59e0b';
      borderColor = '#fed7aa';
    } else if (risk >= 0.2) {
      riskLevel = 'Low';
      bgColor = 'rgba(59, 130, 246, 0.1)';
      textColor = '#3b82f6';
      borderColor = '#bfdbfe';
    } else {
      riskLevel = 'Minimal';
      bgColor = 'rgba(34, 197, 94, 0.1)';
      textColor = '#22c55e';
      borderColor = '#bbf7d0';
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      padding: '4px 12px',
      fontWeight: 500,
      borderRadius: '16px',
      backgroundColor: bgColor,
      color: textColor,
      border: `1px solid ${borderColor}`,
      fontSize: '0.875rem'
    };
  };

  // Updated status logic based on your requirements
  const getStatusInfo = (risk) => {
    if (risk >= 0.8) {
      return {
        text: 'ATTENTION',
        backgroundColor: '#fef2f2', // Red background
        color: '#dc2626', // Red text
        borderColor: '#fecaca'
      };
    } else if (risk >= 0.6) {
      return {
        text: 'ATTENTION',
        backgroundColor: '#fefce8', // Yellow background
        color: '#d97706', // Orange/yellow text
        borderColor: '#fed7aa'
      };
    } else {
      return {
        text: 'NORMAL',
        backgroundColor: '#f0fdf4', // Green background
        color: '#16a34a', // Green text
        borderColor: '#bbf7d0'
      };
    }
  };

  const getRowStyles = (index) => {
    return {
      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
      transition: 'background-color 0.2s'
    };
  };

  return (
    <div style={containerStyles}>
      <div style={titleStyles}>
        <span>Live Failure Risk Predictions</span>
        <div style={controlsStyles}>
          <button 
            style={refreshButtonStyles}
            onClick={fetchData}
            disabled={loading}
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
          <button 
            style={toggleButtonStyles}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? '⏸️ Pause Auto' : '▶️ Start Auto'}
          </button>
        </div>
      </div>
      
      {/* Live Predictions Section */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🔄</div>
          Loading predictions...
        </div>
      ) : rows.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📊</div>
          No prediction data available
        </div>
      ) : (
        <>
          <table style={tableStyles}>
            <thead>
              <tr>
                <th style={thStyles}>#</th>
                <th style={thStyles}>Machine ID</th>
                <th style={thStyles}>Timestamp</th>
                <th style={thStyles}>Risk Level</th>
                <th style={thStyles}>Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, index) => {
                const statusInfo = getStatusInfo(r.risk);
                return (
                  <tr key={r.id || index} style={getRowStyles(index)}>
                    <td style={tdStyles}>{index + 1}</td>
                    <td style={tdStyles}>
                      <span style={{ fontFamily: 'monospace', fontWeight: 500 }}>
                        #{r.machine_id}
                      </span>
                    </td>
                    <td style={tdStyles}>
                      {new Date(r.timestamp).toLocaleString()}
                    </td>
                    <td style={tdStyles}>
                      <span style={getRiskStyles(r.risk)}>
                        {(r.risk * 100).toFixed(1)}%
                      </span>
                    </td>
                    <td style={tdStyles}>
                      <span style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: statusInfo.backgroundColor,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.borderColor}`,
                        display: 'inline-flex',
                        alignItems: 'center'
                      }}>
                        {statusInfo.text}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          <div style={{ 
            marginTop: '1.5rem', 
            fontSize: '0.9rem', 
            color: '#64748b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <span>
              {autoRefresh && (
                <span style={{ color: '#22c55e', fontWeight: 500 }}>
                  🔄 Auto-refresh: ON (every 10s)
                </span>
              )}
              {!autoRefresh && (
                <span style={{ color: '#6b7280' }}>
                  ⏸️ Auto-refresh: OFF
                </span>
              )}
            </span>
            <span>
              Last updated: {lastUpdated.toLocaleTimeString()} • 
              Showing {rows.length} prediction{rows.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {/* Status Legend */}
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '6px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
          }}>
            <h4 style={{ margin: '0 0 0.75rem 0', color: '#374151', fontSize: '0.9rem' }}>
              Status Legend:
            </h4>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: '#fef2f2',
                  color: '#dc2626',
                  border: '1px solid #fecaca'
                }}>
                  ATTENTION
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>≥ 80% Risk</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: '#fefce8',
                  color: '#d97706',
                  border: '1px solid #fed7aa'
                }}>
                  ATTENTION
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>60-79% Risk</span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '8px',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  backgroundColor: '#f0fdf4',
                  color: '#16a34a',
                  border: '1px solid #bbf7d0'
                }}>
                  NORMAL
                </span>
                <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>{'<'} 60% Risk</span>
              </div>
            </div>
          </div>
          
          {/* Summary Stats - Updated with new thresholds */}
          <div style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '1rem'
          }}>
            <div style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
                {rows.filter(r => r.risk >= 0.8).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Critical (≥80%)</div>
            </div>
            
            <div style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#d97706' }}>
                {rows.filter(r => r.risk >= 0.6 && r.risk < 0.8).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Warning (60-79%)</div>
            </div>
            
            <div style={{
              padding: '1rem',
              backgroundColor: 'white',
              borderRadius: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>
                {rows.filter(r => r.risk < 0.6).length}
              </div>
              <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Normal (&lt;60%)</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}