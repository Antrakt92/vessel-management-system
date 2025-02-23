import React, { useState, useEffect } from 'react';
import { Button, Box, Typography, Container, Paper } from '@mui/material';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import VesselForm from './VesselForm';
import VesselList from './VesselList';

const VesselDashboard = () => {
  const navigate = useNavigate();
  const [vessels, setVessels] = useState([]);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchVessels = async () => {
    try {
      const res = await axios.get('/api/vessels');
      const vesselsData = res.data || [];
      console.log('Raw vessels data:', vesselsData);
      
      // Ensure each vessel has an id field
      const processedVessels = vesselsData.map(vessel => ({
        ...vessel,
        id: vessel.id // Use the id field directly
      }));
      
      console.log('Processed vessels:', processedVessels);
      setVessels(processedVessels);
      setError('');
    } catch (err) {
      console.error('Error fetching vessels:', err);
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/');
      } else {
        setError('Failed to load vessels. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVessels();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleVesselAdded = (newVessel) => {
    if (newVessel) {
      setVessels(prevVessels => [newVessel, ...prevVessels]);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1">
            Vessel Dashboard
          </Typography>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => setOpenForm(true)}
              sx={{ mr: 2 }}
            >
              Add Vessel
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Box>

        {error && (
          <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
            <Typography>{error}</Typography>
          </Paper>
        )}

        <VesselList 
          vessels={vessels} 
          loading={loading}
          onVesselUpdated={fetchVessels}
        />

        <VesselForm
          open={openForm}
          onClose={() => setOpenForm(false)}
          onVesselAdded={handleVesselAdded}
        />
      </Box>
    </Container>
  );
};

export default VesselDashboard;
