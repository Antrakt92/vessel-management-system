import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import Login from './components/Login';
import VesselDashboard from './components/VesselDashboard';

// Log environment variables (excluding sensitive data)
console.log('Environment:', {
  nodeEnv: process.env.NODE_ENV,
  apiUrl: process.env.REACT_APP_API_URL
});

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.log('No auth token found, redirecting to login');
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
    console.log('App mounted');
    // Check if we can access the API
    fetch(process.env.REACT_APP_API_URL)
      .then(response => {
        console.log('API health check response:', response.status);
      })
      .catch(error => {
        console.error('API health check failed:', error);
      });
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <VesselDashboard />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
