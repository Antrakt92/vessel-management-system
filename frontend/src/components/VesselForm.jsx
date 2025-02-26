import React, { useState, useEffect } from 'react';
import { TextField, Button, Stack, Alert, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions, Typography, Box } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';
import './VesselForm.css';

const DEFAULT_SERVICES = {
  freshWater: false,
  provisions: false,
  wasteDisposal: false
};

const DEFAULT_REQUESTS = {
  pilotage: false,
  towage: false,
  linesmen: false
};

const VesselForm = ({ open = false, onClose, onVesselAdded, initialValues = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    eta: null,
    etb: null,
    etd: null,
    services: { ...DEFAULT_SERVICES },
    requests: { ...DEFAULT_REQUESTS }
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset form when it's opened or closed
  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        eta: initialValues.eta ? new Date(initialValues.eta) : null,
        etb: initialValues.etb ? new Date(initialValues.etb) : null,
        etd: initialValues.etd ? new Date(initialValues.etd) : null,
        services: {
          ...DEFAULT_SERVICES,
          ...(initialValues.services || {})
        },
        requests: {
          ...DEFAULT_REQUESTS,
          ...(initialValues.requests || {})
        }
      });
    } else if (open) {
      setFormData({
        name: '',
        eta: null,
        etb: null,
        etd: null,
        services: { ...DEFAULT_SERVICES },
        requests: { ...DEFAULT_REQUESTS }
      });
    }
  }, [initialValues, open]);

  const validateDates = () => {
    try {
      // Check if ETA is provided
      if (!formData.eta) {
        return 'Valid ETA date is required';
      }

      // If ETB is provided, it should be after ETA
      if (formData.etb && formData.eta > formData.etb) {
        return 'ETB must be after ETA';
      }

      // If ETD is provided, it should be after ETB (if provided) or ETA
      if (formData.etd) {
        if (formData.etb && formData.etb > formData.etd) {
          return 'ETD must be after ETB';
        } else if (!formData.etb && formData.eta > formData.etd) {
          return 'ETD must be after ETA';
        }
      }

      return true;
    } catch (err) {
      console.error('Date validation error:', err);
      return 'Error validating dates';
    }
  };

  const validateForm = () => {
    // Check if vessel name is provided
    if (!formData.name.trim()) {
      setError('Vessel name is required');
      return false;
    }

    // Check dates
    const dateValidation = validateDates();
    if (dateValidation !== true) {
      setError(dateValidation);
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await axios({
        method: initialValues ? 'put' : 'post',
        url: initialValues 
          ? `/api/vessels/${initialValues._id || initialValues.id}` 
          : '/api/vessels',
        data: formData
      });

      if (!response || !response.data) {
        throw new Error('No response from server');
      }

      // Reset form data for new vessel
      if (!initialValues) {
        setFormData({
          name: '',
          eta: null,
          etb: null,
          etd: null,
          services: { ...DEFAULT_SERVICES },
          requests: { ...DEFAULT_REQUESTS }
        });
      }

      onVesselAdded(response.data);
      setSuccess(true);
      onClose();
    } catch (err) {
      console.error('Error saving vessel:', err);
      setError(err.response?.data?.message || 'Failed to save vessel');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (service) => (event) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: event.target.checked
      }
    }));
  };

  const handleRequestChange = (request) => (event) => {
    setFormData(prev => ({
      ...prev,
      requests: {
        ...prev.requests,
        [request]: event.target.checked
      }
    }));
  };

  const handleClose = () => {
    // Reset form data and error state when closing
    if (!initialValues) {
      setFormData({
        name: '',
        eta: null,
        etb: null,
        etd: null,
        services: { ...DEFAULT_SERVICES },
        requests: { ...DEFAULT_REQUESTS }
      });
    }
    setError(null);
    setSuccess(false);
    onClose();
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValues ? 'Edit Vessel' : 'Add New Vessel'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">Vessel saved successfully!</Alert>}

          <TextField
            label="Vessel Name"
            fullWidth
            required
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Enter vessel name"
            InputProps={{
              startAdornment: <span style={{ marginRight: 8 }}>🚢</span>,
            }}
            disabled={loading}
          />

          <DateTimePicker
            label="Estimated Time of Arrival (ETA)"
            value={formData.eta}
            onChange={(date) => handleInputChange('eta', date)}
            slotProps={{ 
              textField: { 
                fullWidth: true,
                required: true,
                disabled: loading
              }
            }}
            ampm={false}
            format="dd-MMM-yyyy HH:mm"
          />

          <DateTimePicker
            label="Estimated Time at Berth (ETB)"
            value={formData.etb}
            onChange={(date) => handleInputChange('etb', date)}
            slotProps={{ 
              textField: { 
                fullWidth: true,
                disabled: loading
              }
            }}
            ampm={false}
            format="dd-MMM-yyyy HH:mm"
          />

          <DateTimePicker
            label="Estimated Time of Departure (ETD)"
            value={formData.etd}
            onChange={(date) => handleInputChange('etd', date)}
            slotProps={{ 
              textField: { 
                fullWidth: true,
                disabled: loading
              }
            }}
            ampm={false}
            format="dd-MMM-yyyy HH:mm"
          />

          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Services Required
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.services?.freshWater || false}
                    onChange={handleServiceChange('freshWater')}
                    disabled={loading}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>💧</span>
                    <span>Fresh Water</span>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.services?.provisions || false}
                    onChange={handleServiceChange('provisions')}
                    disabled={loading}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>🍲</span>
                    <span>Provisions</span>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.services?.wasteDisposal || false}
                    onChange={handleServiceChange('wasteDisposal')}
                    disabled={loading}
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>♻️</span>
                    <span>Waste Disposal</span>
                  </Box>
                }
              />
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
              Port Services Required
            </Typography>
            <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.requests?.pilotage || false}
                    onChange={handleRequestChange('pilotage')}
                    disabled={loading}
                    color="secondary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>🧭</span>
                    <span>Pilotage</span>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.requests?.towage || false}
                    onChange={handleRequestChange('towage')}
                    disabled={loading}
                    color="secondary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>🚢</span>
                    <span>Towage</span>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.requests?.linesmen || false}
                    onChange={handleRequestChange('linesmen')}
                    disabled={loading}
                    color="secondary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <span style={{ marginRight: 8 }}>⚓</span>
                    <span>Linesmen</span>
                  </Box>
                }
              />
            </Stack>
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleClose} color="primary" disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              color="primary" 
              disabled={loading}
              startIcon={loading ? <span className="loading-spinner">⏳</span> : <span>✅</span>}
            >
              {loading ? 'Saving...' : initialValues ? 'Update Vessel' : 'Add Vessel'}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default VesselForm;
