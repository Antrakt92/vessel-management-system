import React from 'react';
import { Button, Box, CircularProgress, Tooltip } from '@mui/material';
import { Navigation, DirectionsBoat, Anchor } from '@mui/icons-material';

const REQUEST_CONFIG = {
  pilotage: {
    label: 'Pilotage',
    icon: Navigation,
    emailType: 'Pilotage Service',
    tooltip: 'Request pilotage service for vessel navigation'
  },
  towage: {
    label: 'Towage',
    icon: DirectionsBoat,
    emailType: 'Towage Service',
    tooltip: 'Request towage service for vessel movement'
  },
  linesmen: {
    label: 'Linesmen',
    icon: Anchor,
    emailType: 'Linesmen Service',
    tooltip: 'Request linesmen for mooring operations'
  }
};

const RequestButtons = ({ requests = {}, disabled = false }) => {
  const handleRequestService = (type) => {
    const subject = `Port Service Request: ${type}`;
    const body = `Port service request details:
Type: ${type}

Please process this port service request.

Best regards`;

    const mailtoLink = `mailto:port@shipagency.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
  };

  return (
    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
      {Object.entries(requests).map(([key, isActive]) => {
        if (!isActive || !REQUEST_CONFIG[key]) return null;
        
        const { label, icon: Icon, emailType, tooltip } = REQUEST_CONFIG[key];
        
        return (
          <Tooltip key={key} title={tooltip} arrow>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleRequestService(emailType)}
              disabled={disabled}
              startIcon={disabled ? <CircularProgress size={16} /> : <Icon />}
              color="secondary"
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

export default RequestButtons;
