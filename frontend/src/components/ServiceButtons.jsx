import React from 'react';
import { Button, Box, CircularProgress } from '@mui/material';
import { WaterDrop, Restaurant, Delete } from '@mui/icons-material';

const SERVICE_CONFIG = {
  freshWater: {
    label: 'Fresh Water',
    icon: WaterDrop,
    emailType: 'Fresh Water Supply'
  },
  provisions: {
    label: 'Provisions',
    icon: Restaurant,
    emailType: 'Provisions Supply'
  },
  wasteDisposal: {
    label: 'Waste',
    icon: Delete,
    emailType: 'Waste Disposal'
  }
};

const ServiceButtons = ({ services = {}, disabled = false }) => {
  const handleServiceRequest = (type) => {
    const subject = `Service Request: ${type}`;
    const body = `Service request details:
Type: ${type}

Please process this service request.

Best regards`;

    const mailtoLink = `mailto:service@shipagency.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {Object.entries(services).map(([key, isActive]) => {
        if (!isActive || !SERVICE_CONFIG[key]) return null;
        
        const { label, icon: Icon, emailType } = SERVICE_CONFIG[key];
        
        return (
          <Button
            key={key}
            variant="outlined"
            size="small"
            onClick={() => handleServiceRequest(emailType)}
            disabled={disabled}
            startIcon={disabled ? <CircularProgress size={16} /> : <Icon />}
          >
            {label}
          </Button>
        );
      })}
    </Box>
  );
};

export default ServiceButtons;
