import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Mock data for when API fails
const MOCK_ASSETS = [
  { id: 1, name: 'Pump A1', type: 'Hydraulic Pump', status: 'Online', x_pct: 20, y_pct: 30 },
  { id: 2, name: 'Motor B2', type: 'Electric Motor', status: 'Warning', x_pct: 45, y_pct: 55 },
  { id: 3, name: 'Valve C3', type: 'Control Valve', status: 'Offline', x_pct: 70, y_pct: 25 },
  { id: 4, name: 'Fan D4', type: 'Cooling Fan', status: 'Online', x_pct: 80, y_pct: 75 }
];

const MOCK_PREDICTIONS = [
  { id: 1, machine_id: 'A101', timestamp: new Date().toISOString(), risk: 0.25 },
  { id: 2, machine_id: 'B202', timestamp: new Date().toISOString(), risk: 0.78 },
  { id: 3, machine_id: 'C303', timestamp: new Date().toISOString(), risk: 0.12 }
];

export function fetchAssets() {
  return axios.get(`${API_BASE}/assets`)
    .catch(error => {
      console.error("Error fetching assets:", error);
      console.info("Using mock asset data instead");
      return { data: MOCK_ASSETS }; 
    });
}

export function fetchSensorData() {
  return axios.get(`${API_BASE}/sensors`)
    .catch(error => {
      console.error("Error fetching sensor data:", error);
      return { data: [] }; 
    });
}

export function fetchPredictions() {
  return axios.get(`${API_BASE}/predict`)
    .catch(error => {
      console.error("Error fetching predictions:", error);
      console.info("Using mock prediction data instead");
      return { data: MOCK_PREDICTIONS }; 
    });
}

export function postNewPrediction(payload) {
  console.log("Sending to backend:", payload);
  
  return axios.post(`${API_BASE}/predict`, payload)
    .then(response => {
      console.log("Raw backend response:", response);
      console.log("Response data:", response.data);
      console.log("Response status:", response.status);
      
      // Handle the actual backend response format
      if (response.data && typeof response.data.prediction === 'number') {
        return { data: { prediction: response.data.prediction } };
      } else if (response.data && !isNaN(parseFloat(response.data.prediction))) {
        // Handle case where prediction comes as string
        return { data: { prediction: parseFloat(response.data.prediction) } };
      } else {
        console.error("Invalid response format:", response.data);
        throw new Error('Invalid response format from backend');
      }
    })
    .catch(error => {
      console.error("Backend error:", error);
      console.error("Error response:", error.response?.data);
      
      // Don't return mock data - let the error propagate
      throw error;
    });
}