import React, { useState, useEffect } from 'react';
import { TextField, Button, Stack, Alert, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent } from '@mui/material';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import axios from '../utils/axiosConfig';
import { useNavigate } from 'react-router-dom';

const VesselForm = ({ open = false, onClose, onVesselAdded, initialValues = null }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    eta: new Date(),
    etb: null,
    etd: null,
    services: {
      freshWater: false,
      provisions: false,
      wasteDisposal: false
    }
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name || '',
        eta: initialValues.eta ? new Date(initialValues.eta) : new Date(),
        etb: initialValues.etb ? new Date(initialValues.etb) : null,
        etd: initialValues.etd ? new Date(initialValues.etd) : null,
        services: {
          freshWater: initialValues.services?.freshWater || false,
          provisions: initialValues.services?.provisions || false,
          wasteDisposal: initialValues.services?.wasteDisposal || false
        }
      });
    }
  }, [initialValues]);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      setError('Vessel name is required');
      return;
    }

    if (!formData.eta || !(formData.eta instanceof Date) || isNaN(formData.eta)) {
      setError('Valid ETA date is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const payload = {
        ...formData,
        eta: formData.eta.toISOString(),
        etb: formData.etb ? formData.etb.toISOString() : null,
        etd: formData.etd ? formData.etd.toISOString() : null
      };

      let response;
      if (initialValues?.id) {
        response = await axios.put(`/api/vessels/${initialValues.id}`, payload);
        if (onVesselAdded) {
          onVesselAdded(response.data);
        }
      } else {
        response = await axios.post('/api/vessels', payload);
        if (onVesselAdded && response.data) {
          onVesselAdded(response.data);
        }
      }

      onClose();
    } catch (err) {
      console.error('Error saving vessel:', err.response || err);
      setError(err.response?.data?.message || 'Error saving vessel');
      if (err.response?.status === 401) {
        localStorage.removeItem('authToken');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setError(null);
    setFormData({
      name: '',
      eta: new Date(),
      etb: null,
      etd: null,
      services: {
        freshWater: false,
        provisions: false,
        wasteDisposal: false
      }
    });
    if (onClose) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialValues ? 'Edit Vessel' : 'Add New Vessel'}</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}
          
          <TextField
            label="Vessel Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />

          <DateTimePicker
            label="ETA"
            value={formData.eta}
            onChange={(newValue) => setFormData({ ...formData, eta: newValue })}
            slotProps={{ 
              textField: { fullWidth: true, required: true },
              toolbar: { hidden: true }
            }}
            ampm={false}
            format="dd-MMM-yyyy HH:mm"
          />

          <DateTimePicker
            label="ETB"
            value={formData.etb}
            onChange={(newValue) => setFormData({ ...formData, etb: newValue })}
            slotProps={{ 
              textField: { fullWidth: true },
              toolbar: { hidden: true }
            }}
            ampm={false}
            format="dd-MMM-yyyy HH:mm"
          />

          <DateTimePicker
            label="ETD"
            value={formData.etd}
            onChange={(newValue) => setFormData({ ...formData, etd: newValue })}
            slotProps={{ 
              textField: { fullWidth: true },
              toolbar: { hidden: true }
            }}
            ampm={false}
            format="dd-MMM-yyyy HH:mm"
          />

          <Stack>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.services.freshWater}
                  onChange={(e) => setFormData({
                    ...formData,
                    services: { ...formData.services, freshWater: e.target.checked }
                  })}
                />
              }
              label="Fresh Water"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.services.provisions}
                  onChange={(e) => setFormData({
                    ...formData,
                    services: { ...formData.services, provisions: e.target.checked }
                  })}
                />
              }
              label="Provisions"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.services.wasteDisposal}
                  onChange={(e) => setFormData({
                    ...formData,
                    services: { ...formData.services, wasteDisposal: e.target.checked }
                  })}
                />
              }
              label="Waste Disposal"
            />
          </Stack>

          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" color="primary" disabled={loading}>
              {loading ? 'Saving...' : (initialValues ? 'Save Changes' : 'Add Vessel')}
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default VesselForm;
