import React, { useState, useEffect, useCallback } from 'react';
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

  const fetchVessels = useCallback(async () => {
    try {
      const res = await axios.get('/api/vessels');
      const vesselsData = res.data || [];
      
      // Ensure each vessel has an id field and valid dates
      const processedVessels = vesselsData.map(vessel => ({
        ...vessel,
        id: vessel._id || vessel.id, // Handle both MongoDB _id and regular id
        eta: vessel.eta ? new Date(vessel.eta) : null,
        etb: vessel.etb ? new Date(vessel.etb) : null,
        etd: vessel.etd ? new Date(vessel.etd) : null
      }));
      
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
  }, [navigate]);

  useEffect(() => {
    fetchVessels();
  }, [fetchVessels]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const handleVesselAdded = () => {
    setOpenForm(false);
    fetchVessels();
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
