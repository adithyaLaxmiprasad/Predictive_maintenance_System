import React from 'react';
import { useEffect, useState } from 'react';
import { fetchSensorData } from '../api/model';
import {
  LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell
} from 'recharts';

export default function SensorDashboard() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    try {
      const resp = await fetchSensorData();
      setData(resp.data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching sensor data:', error);
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

  // Calculate averages for pie chart - ALL METRICS
  const getAverageData = () => {
    if (data.length === 0) return [];
    
    const totals = data.reduce((acc, item) => ({
      temperature: acc.temperature + (item.temperature || 0),
      vibration: acc.vibration + (item.vibration || 0),
      power_consumption: acc.power_consumption + (item.power_consumption || 0),
      humidity: acc.humidity + (item.humidity || 0),
      pressure: acc.pressure + (item.pressure || 0)
    }), { temperature: 0, vibration: 0, power_consumption: 0, humidity: 0, pressure: 0 });

    const count = data.length;
    return [
      { name: 'Temperature', value: parseFloat((totals.temperature / count).toFixed(1)), fill: '#82ca9d' },
      { name: 'Vibration', value: parseFloat((totals.vibration / count).toFixed(1)), fill: '#8884d8' },
      { name: 'Power', value: parseFloat((totals.power_consumption / count).toFixed(1)), fill: '#ffc658' },
      { name: 'Humidity', value: parseFloat((totals.humidity / count).toFixed(1)), fill: '#ff7c7c' },
      { name: 'Pressure', value: parseFloat((totals.pressure / count).toFixed(1)), fill: '#8dd1e1' }
    ];
  };

  // Get recent data for comparison chart - ALL METRICS
  const getComparisonData = () => {
    if (data.length < 2) return [];
    
    const recent = data.slice(-6); // Last 6 readings
    return recent.map((item, index) => ({
      reading: `Reading ${index + 1}`,
      temperature: item.temperature || 0,
      vibration: item.vibration || 0,
      power: item.power_consumption || 0,
      humidity: item.humidity || 0,
      pressure: item.pressure || 0
    }));
  };

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

  const chartContainerStyles = {
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '6px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '1rem'
  };

  const chartTitleStyles = {
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#374151',
    marginBottom: '1rem',
    textAlign: 'center'
  };

  return (
    <div style={containerStyles}>
      <div style={titleStyles}>
        <span>Live Sensor Streams</span>
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
      
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🔄</div>
          Loading sensor data...
        </div>
      ) : data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>📊</div>
          No sensor data available
        </div>
      ) : (
        <>
          {/* Main Line Chart */}
          <div style={chartContainerStyles}>
            <div style={chartTitleStyles}>Real-Time Sensor Monitoring</div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis 
                  dataKey="timestamp" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  tickFormatter={(value) => new Date(value).toLocaleTimeString()}
                />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    border: '1px solid #e2e8f0',
                    borderRadius: '4px',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)'
                  }}
                  labelFormatter={(value) => `Time: ${new Date(value).toLocaleString()}`}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '10px' }} 
                  formatter={(value) => <span style={{ color: '#334155', fontSize: '14px' }}>{value}</span>}
                />
                <Line 
                  type="monotone" 
                  dataKey="vibration" 
                  stroke="#8884d8" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                  name="Vibration"
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#82ca9d" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                  name="Temperature"
                />
                <Line 
                  type="monotone" 
                  dataKey="power_consumption" 
                  stroke="#ffc658" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                  name="Power Consumption"
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#ff7c7c" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                  name="Humidity"
                />
                <Line 
                  type="monotone" 
                  dataKey="pressure" 
                  stroke="#8dd1e1" 
                  strokeWidth={2} 
                  dot={{ r: 4 }} 
                  activeDot={{ r: 6 }} 
                  name="Pressure"
                />
              </LineChart>
            </ResponsiveContainer>
            
            <div style={{ 
              fontSize: '0.9rem', 
              color: '#64748b', 
              textAlign: 'right', 
              marginTop: '1rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>
                {autoRefresh && <span style={{ color: '#22c55e', fontWeight: 500 }}>🔄 Auto-refresh: ON</span>}
              </span>
              <span>
                Last updated: {lastUpdated.toLocaleTimeString()} • {data.length} data points
              </span>
            </div>
          </div>

          {/* Three Charts in a Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
            
            {/* Bar Chart - Recent Readings Comparison - ALL METRICS */}
            <div style={chartContainerStyles}>
              <div style={chartTitleStyles}>Recent Readings Comparison</div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={getComparisonData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="reading" 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                  <Bar dataKey="temperature" fill="#82ca9d" name="Temp" />
                  <Bar dataKey="vibration" fill="#8884d8" name="Vibr" />
                  <Bar dataKey="power" fill="#ffc658" name="Power" />
                  <Bar dataKey="humidity" fill="#ff7c7c" name="Humid" />
                  <Bar dataKey="pressure" fill="#8dd1e1" name="Press" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Area Chart - Trend Analysis - ALL METRICS */}
            <div style={chartContainerStyles}>
              <div style={chartTitleStyles}>Sensor Trend Analysis</div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.slice(-10)} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis 
                    dataKey="timestamp" 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(value) => new Date(value).toLocaleTimeString().slice(0, 5)}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                    labelFormatter={(value) => `Time: ${new Date(value).toLocaleTimeString()}`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="temperature" 
                    stackId="1" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.6}
                    name="Temperature"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="humidity" 
                    stackId="1" 
                    stroke="#ff7c7c" 
                    fill="#ff7c7c" 
                    fillOpacity={0.6}
                    name="Humidity"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pressure" 
                    stackId="1" 
                    stroke="#8dd1e1" 
                    fill="#8dd1e1" 
                    fillOpacity={0.4}
                    name="Pressure"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart - Average Distribution - ALL METRICS */}
            <div style={chartContainerStyles}>
              <div style={chartTitleStyles}>Average Sensor Distribution</div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={getAverageData()}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {getAverageData().map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      border: '1px solid #e2e8f0',
                      borderRadius: '4px',
                      fontSize: '11px'
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Summary Statistics Cards */}
          <div style={{
            marginTop: '1rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem'
          }}>
            {data.length > 0 && (
              <>
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#82ca9d' }}>
                    {data[data.length - 1]?.temperature?.toFixed(1) || 'N/A'}°C
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current Temperature</div>
                </div>
                
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8884d8' }}>
                    {data[data.length - 1]?.vibration?.toFixed(2) || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current Vibration</div>
                </div>
                
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ffc658' }}>
                    {data[data.length - 1]?.power_consumption?.toFixed(1) || 'N/A'}kW
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current Power</div>
                </div>
                
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#ff7c7c' }}>
                    {data[data.length - 1]?.humidity?.toFixed(1) || 'N/A'}%
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current Humidity</div>
                </div>
                
                <div style={{
                  padding: '1rem',
                  backgroundColor: 'white',
                  borderRadius: '6px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                  textAlign: 'center'
                }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#8dd1e1' }}>
                    {data[data.length - 1]?.pressure?.toFixed(1) || 'N/A'}kPa
                  </div>
                  <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Current Pressure</div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}