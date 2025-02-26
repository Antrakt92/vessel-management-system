import React, { useState } from 'react';
import { Button, Box, Tooltip, Snackbar, Alert } from '@mui/material';
import { WaterDrop, Restaurant, Delete } from '@mui/icons-material';

const SERVICE_CONFIG = {
  freshWater: {
    label: 'Fresh Water',
    icon: WaterDrop,
    emailType: 'Fresh Water Request',
    tooltip: 'Request fresh water supply for the vessel',
    recipient: 'roy.walsh@dublincity.ie',
    cc: 'agency.dublin@gac.com',
    greeting: 'Dear Roy,',
    serviceText: 'Could you please arrange fresh water supply for the following vessel:',
    requestText: 'Please confirm availability and proposed timing for the fresh water supply.'
  },
  provisions: {
    label: 'Provisions',
    icon: Restaurant,
    emailType: 'Provisions Supply',
    tooltip: 'Request provisions supply for the vessel',
    recipient: 'provisions@shipagency.com',
    cc: 'agency.dublin@gac.com',
    greeting: 'Dear Sir/Madam,',
    serviceText: 'We kindly request provisions supply for the following vessel:',
    requestText: 'Please confirm if you can provide the provisions at the specified times.'
  },
  wasteDisposal: {
    label: 'Waste',
    icon: Delete,
    emailType: 'Waste Disposal',
    tooltip: 'Request waste disposal service for the vessel',
    recipient: 'waste@shipagency.com',
    cc: 'agency.dublin@gac.com',
    greeting: 'Dear Sir/Madam,',
    serviceText: 'We kindly request waste disposal services for the following vessel:',
    requestText: 'Please confirm if you can provide waste disposal services at the specified times.'
  }
};

const ServiceButtons = ({ services = {}, disabled = false, vessel }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleServiceRequest = (type, serviceKey, recipient, cc, greeting, serviceText, requestText) => {
    if (!vessel) {
      setSnackbar({
        open: true,
        message: 'Cannot create email: vessel information is missing',
        severity: 'error'
      });
      return;
    }

    // Format dates properly
    const eta = vessel.eta ? new Date(vessel.eta).toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', '') : 'Not set';
    
    const etb = vessel.etb ? new Date(vessel.etb).toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', '') : eta; // If ETB is not set, use ETA
    
    const etd = vessel.etd ? new Date(vessel.etd).toLocaleString('en-GB', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    }).replace(',', '') : 'Not set';

    // Create email subject
    const subject = `${type} - ${vessel.name} at ${vessel.berth || 'Port'} - ETA: ${eta}`;

    // Create vessel info section with proper formatting
    const vesselInfo = 
      `Vessel:    ${vessel.name || 'N/A'}\n` +
      `Location:  ${vessel.berth || 'Not specified'}\n` +
      (vessel.cargo ? `Cargo:     ${vessel.cargo}\n` : '');

    // Add fresh water quantity if this is a fresh water request
    const freshWaterText = type === 'Fresh Water Request' && vessel.freshWaterQuantity 
      ? `\nEstimated FW Required: ${vessel.freshWaterQuantity} m³\n` 
      : '';

    // Create movements section with bullet points
    const movementsSection = 
      `Movements:\n\n` +
      `• ETA: ${eta}\n` +
      `• ETB: ${etb}\n` +
      `• ETD: ${etd}`;

    // Create the complete email body
    const body = 
      `${greeting}\n\n` +
      `${serviceText}\n\n` +
      `${vesselInfo}` +
      `${freshWaterText}\n` +
      `${movementsSection}\n\n` +
      `${requestText}`;

    const mailtoLink = `mailto:${recipient}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    setSnackbar({
      open: true,
      message: `Email draft for ${SERVICE_CONFIG[serviceKey].label} created in your default email client`,
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {Object.entries(services).map(([key, isActive]) => {
          if (!isActive || !SERVICE_CONFIG[key]) return null;
          
          const { label, icon: Icon, emailType, tooltip, recipient, cc, greeting, serviceText, requestText } = SERVICE_CONFIG[key];
          
          return (
            <Tooltip key={key} title={`${tooltip} (opens email draft)`} arrow>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleServiceRequest(emailType, key, recipient, cc, greeting, serviceText, requestText)}
                disabled={disabled}
                startIcon={<Icon />}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ServiceButtons;
