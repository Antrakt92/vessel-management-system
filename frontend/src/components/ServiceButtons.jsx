import React, { useState } from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import { format } from 'date-fns';

const ServiceButtons = ({ vessel }) => {
  const [loading, setLoading] = useState(false);

  const handleServiceRequest = (type) => {
    if (!vessel) return;

    setLoading(true);
    const subject = `Service Request for ${vessel.name}`;
    const body = `Service request details:

Vessel: ${vessel.name}
Service Type: ${type}
ETA: ${vessel.eta ? format(new Date(vessel.eta), 'dd-MMM-yyyy HH:mm') : 'N/A'}
ETB: ${vessel.etb ? format(new Date(vessel.etb), 'dd-MMM-yyyy HH:mm') : 'N/A'}
ETD: ${vessel.etd ? format(new Date(vessel.etd), 'dd-MMM-yyyy HH:mm') : 'N/A'}`;

    const mailtoLink = `mailto:service@shipagency.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    // Reset loading state after a short delay
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };

  return (
    <Box>
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleServiceRequest('Fresh Water')}
        disabled={!vessel || loading}
        sx={{ mr: 1 }}
        startIcon={loading ? <CircularProgress size={16} /> : null}
      >
        Fresh Water
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleServiceRequest('Provisions')}
        disabled={!vessel || loading}
        sx={{ mr: 1 }}
        startIcon={loading ? <CircularProgress size={16} /> : null}
      >
        Provisions
      </Button>
      <Button
        variant="outlined"
        size="small"
        onClick={() => handleServiceRequest('Waste Disposal')}
        disabled={!vessel || loading}
        startIcon={loading ? <CircularProgress size={16} /> : null}
      >
        Waste Disposal
      </Button>
    </Box>
  );
};

export default ServiceButtons;
