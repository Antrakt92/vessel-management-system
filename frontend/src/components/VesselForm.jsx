import React, { useState, useEffect } from 'react';
import { TextField, Button, Stack, Alert, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const DEFAULT_SERVICES = {
  freshWater: false,
  provisions: false,
  wasteDisposal: false
};

const VesselForm = ({ open = false, onClose, onVesselAdded, initialValues = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    eta: new Date(),
    etb: null,
    etd: null,
    services: { ...DEFAULT_SERVICES }
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        eta: initialValues.eta ? new Date(initialValues.eta) : new Date(),
        etb: initialValues.etb ? new Date(initialValues.etb) : null,
        etd: initialValues.etd ? new Date(initialValues.etd) : null,
        services: {
          ...DEFAULT_SERVICES,
          ...(initialValues.services || {})
        }
      });
    }
  }, [initialValues]);

  const validateDates = () => {
    try {
      const now = new Date();
      const eta = formData.eta;
      const etb = formData.etb;
      const etd = formData.etd;

      if (!eta || !(eta instanceof Date) || isNaN(eta)) {
        return 'Valid ETA date is required';
      }

      if (eta < now) {
        return 'ETA cannot be in the past';
      }

      if (etb) {
        if (!(etb instanceof Date) || isNaN(etb)) {
          return 'Invalid ETB date format';
        }
        if (etb < eta) {
          return 'ETB must be after ETA';
        }
      }

      if (etd) {
        if (!(etd instanceof Date) || isNaN(etd)) {
          return 'Invalid ETD date format';
        }
        if (etb && etd < etb) {
          return 'ETD must be after ETB';
        }
        if (!etb && etd < eta) {
          return 'ETD must be after ETA';
        }
      }

      return null;
    } catch (err) {
      console.error('Date validation error:', err);
      return 'Error validating dates';
    }
  };

  const handleSubmit = async () => {
    try {
      if (!formData.name.trim()) {
        setError('Vessel name is required');
        return;
      }

      const dateError = validateDates();
      if (dateError) {
        setError(dateError);
        return;
      }

      setLoading(true);
      setError(null);

      const response = await axios({
        method: initialValues ? 'put' : 'post',
        url: initialValues ? `/api/vessels/${initialValues.id}` : '/api/vessels',
        data: {
          ...formData,
          eta: formData.eta.toISOString(),
          etb: formData.etb?.toISOString() || null,
          etd: formData.etd?.toISOString() || null
        },
        timeout: 10000 // 10 second timeout
      });

      onVesselAdded(response.data);
      onClose();
    } catch (err) {
      console.error('Error saving vessel:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network.');
      } else {
        setError(err.response?.data?.message || 'Failed to save vessel. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleServiceChange = (service) => {
    setFormData(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: !prev.services[service]
      }
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValues ? 'Edit Vessel' : 'Add New Vessel'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <TextField
            label="Vessel Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            fullWidth
            error={error && !formData.name.trim()}
            disabled={loading}
          />

          <DateTimePicker
            label="ETA"
            value={formData.eta}
            onChange={(date) => setFormData(prev => ({ ...prev, eta: date }))}
            slotProps={{ 
              textField: { 
                fullWidth: true, 
                required: true,
                error: error && validateDates() === 'Valid ETA date is required'
              },
              toolbar: { hidden: true }
            }}
            ampm={false}
            format="dd-MMM-yyyy HH:mm"
            disabled={loading}
          />

          <DateTimePicker
            label="ETB"
            value={formData.etb}
            onChange={(date) => setFormData(prev => ({ ...prev, etb: date }))}
            slotProps={{ 
              textField: { 
                fullWidth: true,
                error: error && validateDates()?.includes('ETB')
              },
              toolbar: { hidden: true }
            }}
            ampm={false}
            format="dd-MMM-yyyy HH:mm"
            disabled={loading}
          />

          <DateTimePicker
            label="ETD"
            value={formData.etd}
            onChange={(date) => setFormData(prev => ({ ...prev, etd: date }))}
            slotProps={{ 
              textField: { 
                fullWidth: true,
                error: error && validateDates()?.includes('ETD')
              },
              toolbar: { hidden: true }
            }}
            ampm={false}
            format="dd-MMM-yyyy HH:mm"
            disabled={loading}
          />

          <Stack spacing={1}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.services.freshWater}
                  onChange={() => handleServiceChange('freshWater')}
                />
              }
              label="Fresh Water"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.services.provisions}
                  onChange={() => handleServiceChange('provisions')}
                />
              }
              label="Provisions"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.services.wasteDisposal}
                  onChange={() => handleServiceChange('wasteDisposal')}
                />
              }
              label="Waste Disposal"
            />
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onClose} color="primary" disabled={loading}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              variant="contained" 
              fullWidth 
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? 'Saving...' : (initialValues ? 'Update Vessel' : 'Add Vessel')}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default VesselForm;
