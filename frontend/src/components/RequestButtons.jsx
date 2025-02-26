import React, { useState } from 'react';
import { Button, Box, Tooltip, Snackbar, Alert } from '@mui/material';
import { DirectionsBoat, Sailing, Groups } from '@mui/icons-material';

const REQUEST_CONFIG = {
  pilotage: {
    label: 'Pilotage',
    icon: DirectionsBoat,
    emailType: 'Pilotage Request',
    tooltip: 'Request pilotage service for the vessel',
    recipient: 'pilotage@shipagency.com',
    cc: 'agency.dublin@gac.com',
    greeting: 'Dear Sir/Madam,',
    serviceText: 'We kindly request pilotage services for the following vessel:',
    requestText: 'Please confirm if you can provide pilotage services at the specified times.'
  },
  towage: {
    label: 'Towage',
    icon: Sailing,
    emailType: 'Tug Request',
    tooltip: 'Request towage service for the vessel',
    recipient: 'master.gianotug@gmail.com',
    cc: 'agency.dublin@gac.com',
    greeting: 'Hi,',
    serviceText: 'We kindly request your tug services for the following vessel:',
    requestText: 'Please confirm if you can provide tug services at the specified times.'
  },
  linesmen: {
    label: 'Linesmen',
    icon: Groups,
    emailType: 'Linesmen Request',
    tooltip: 'Request linesmen service for the vessel',
    recipient: 'jaysutton@yahoo.ie',
    cc: 'agency.dublin@gac.com',
    greeting: 'Hi Jay,',
    serviceText: 'We kindly request your linesmen services for the following vessel:',
    requestText: 'Please confirm if you can provide linesmen services at the specified times.'
  },
  terminal: {
    label: 'Terminal',
    icon: DirectionsBoat,
    emailType: 'Terminal Readiness Confirmation',
    tooltip: 'Request terminal readiness confirmation',
    recipient: 'claire.flynn@calorgas.ie; denis.taylor@calorgas.ie; james.lavelle@calorgas.ie',
    cc: 'agency.dublin@gac.com',
    greeting: 'Dear Claire, Denis, and James,',
    serviceText: 'We kindly request confirmation regarding terminal readiness for the following vessel:',
    requestText: 'Please confirm if Calor Gas is prepared to receive the vessel upon arrival as scheduled.'
  }
};

const RequestButtons = ({ requests = {}, disabled = false, vessel }) => {
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleServiceRequest = (type, requestKey, recipient, cc, greeting, serviceText, requestText) => {
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
      `IMO:       ${vessel.imo || 'N/A'}\n` +
      `Location:  ${vessel.berth || 'Not specified'}\n` +
      (vessel.cargo ? `Cargo:     ${vessel.cargo}\n` : '');

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
      `${vesselInfo}\n` +
      `${movementsSection}\n\n` +
      `${requestText}`;

    const mailtoLink = `mailto:${recipient}?cc=${cc}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoLink, '_blank');
    
    setSnackbar({
      open: true,
      message: `Email draft for ${REQUEST_CONFIG[requestKey].label} created in your default email client`,
      severity: 'success'
    });
  };

  const handleSnackbarClose = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {Object.entries(requests).map(([key, isActive]) => {
          if (!isActive || !REQUEST_CONFIG[key]) return null;
          
          const { label, icon: Icon, emailType, tooltip, recipient, cc, greeting, serviceText, requestText } = REQUEST_CONFIG[key];
          
          return (
            <Tooltip key={key} title={`${tooltip} (opens email draft)`} arrow>
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleServiceRequest(emailType, key, recipient, cc, greeting, serviceText, requestText)}
                disabled={disabled}
                startIcon={<Icon />}
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

export default RequestButtons;
