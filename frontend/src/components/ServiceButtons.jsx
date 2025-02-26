import React from 'react';
import { Button, Box, CircularProgress, Tooltip } from '@mui/material';
import { WaterDrop, Restaurant, Delete } from '@mui/icons-material';

const SERVICE_CONFIG = {
  freshWater: {
    label: 'Fresh Water',
    icon: WaterDrop,
    emailType: 'Fresh Water Supply',
    tooltip: 'Request fresh water supply for the vessel'
  },
  provisions: {
    label: 'Provisions',
    icon: Restaurant,
    emailType: 'Provisions Supply',
    tooltip: 'Request provisions supply for the vessel'
  },
  wasteDisposal: {
    label: 'Waste',
    icon: Delete,
    emailType: 'Waste Disposal',
    tooltip: 'Request waste disposal service for the vessel'
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
        
        const { label, icon: Icon, emailType, tooltip } = SERVICE_CONFIG[key];
        
        return (
          <Tooltip key={key} title={tooltip} arrow>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleServiceRequest(emailType)}
              disabled={disabled}
              startIcon={disabled ? <CircularProgress size={16} /> : <Icon />}
              color="primary"
              sx={{ 
                borderRadius: '20px',
                '&:hover': {
                  boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                  transform: 'translateY(-2px)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {label}
            </Button>
          </Tooltip>
        );
      })}
    </Box>
  );
};

export default ServiceButtons;
