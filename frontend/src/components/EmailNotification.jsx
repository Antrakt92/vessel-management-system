import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Typography,
  Box,
  CircularProgress
} from '@mui/material';
import axios from '../utils/axiosConfig';

const EmailNotification = ({ open, onClose, vessel }) => {
  const [emailType, setEmailType] = useState('linesmen');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const emailTypes = [
    { value: 'linesmen', label: 'Linesmen Request', icon: '⚓' },
    { value: 'towage', label: 'Tug Request', icon: '🚢' },
    { value: 'terminal', label: 'Terminal Readiness', icon: '🏭' },
    { value: 'freshWater', label: 'Fresh Water Request', icon: '💧' }
  ];

  const handleSendEmail = async () => {
    if (!vessel || !vessel._id) {
      setError('No vessel selected');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await axios.post('/api/email/send-service-notification', {
        vesselId: vessel._id,
        serviceType: emailType
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (err) {
      console.error('Error sending email:', err);
      setError(err.response?.data?.message || 'Failed to send email notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send Service Email Notification</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Email notification sent successfully!</Alert>}

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Vessel: <strong>{vessel?.name}</strong>
            </Typography>
            {vessel?.berth && (
              <Typography variant="body2">
                Berth: <strong>{vessel.berth}</strong>
              </Typography>
            )}
            <Typography variant="body2">
              ETA: <strong>{vessel?.eta ? new Date(vessel.eta).toLocaleString() : 'Not set'}</strong>
            </Typography>
          </Box>

          <FormControl fullWidth>
            <InputLabel id="email-type-label">Notification Type</InputLabel>
            <Select
              labelId="email-type-label"
              value={emailType}
              onChange={(e) => setEmailType(e.target.value)}
              disabled={loading}
              label="Notification Type"
            >
              {emailTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>{type.icon}</span>
                    <span>{type.label}</span>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            This will send an email notification to the service provider with the vessel details.
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleSendEmail}
          variant="contained"
          color="primary"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Sending...' : 'Send Notification'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmailNotification;
