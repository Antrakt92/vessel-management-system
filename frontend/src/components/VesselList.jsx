import React, { useState, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import VesselForm from './VesselForm';
import ServiceButtons from './ServiceButtons';
import RequestButtons from './RequestButtons';
import axios from '../utils/axiosConfig';

const formatDate = (date) => {
  if (!date) return 'Not set';
  try {
    return format(new Date(date), 'dd-MMM-yyyy HH:mm');
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

const getVesselId = (vessel) => vessel._id || vessel.id;

const VesselList = ({ vessels, onVesselUpdated, loading: parentLoading = false }) => {
  const [editingVessel, setEditingVessel] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vesselToDelete, setVesselToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [loading, setLoading] = useState(false);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar(prev => ({ ...prev, open: false }));
  }, []);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleEdit = useCallback((vessel) => {
    setEditingVessel(vessel);
    setOpenDialog(true);
  }, []);

  const handleDeleteClick = useCallback((vessel) => {
    setVesselToDelete(vessel);
    setDeleteConfirmOpen(true);
  }, []);

  const handleDeleteConfirm = async () => {
    if (!vesselToDelete) return;

    setLoading(true);
    try {
      await axios.delete(`/api/vessels/${getVesselId(vesselToDelete)}`);
      showSnackbar('Vessel deleted successfully');
      onVesselUpdated();
    } catch (error) {
      console.error('Error deleting vessel:', error);
      showSnackbar(
        error.response?.data?.message || 'Failed to delete vessel',
        'error'
      );
    } finally {
      setLoading(false);
      setDeleteConfirmOpen(false);
      setVesselToDelete(null);
    }
  };

  const handleVesselUpdated = useCallback((updatedVessel) => {
    setOpenDialog(false);
    onVesselUpdated();
    showSnackbar('Vessel updated successfully');
  }, [onVesselUpdated, showSnackbar]);

  const isDisabled = loading || parentLoading;

  return (
    <>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>ETA</TableCell>
              <TableCell>ETB</TableCell>
              <TableCell>ETD</TableCell>
              <TableCell>Vessel Services</TableCell>
              <TableCell>Port Services</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vessels.map((vessel) => (
              <TableRow key={getVesselId(vessel)}>
                <TableCell>{vessel.name}</TableCell>
                <TableCell>{formatDate(vessel.eta)}</TableCell>
                <TableCell>{formatDate(vessel.etb)}</TableCell>
                <TableCell>{formatDate(vessel.etd)}</TableCell>
                <TableCell>
                  <ServiceButtons 
                    services={vessel.services} 
                    disabled={isDisabled}
                  />
                </TableCell>
                <TableCell>
                  <RequestButtons 
                    requests={vessel.requests} 
                    disabled={isDisabled}
                  />
                </TableCell>
                <TableCell>
                  <IconButton 
                    onClick={() => handleEdit(vessel)} 
                    color="primary"
                    disabled={isDisabled}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDeleteClick(vessel)} 
                    color="error"
                    disabled={isDisabled}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <VesselForm
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onVesselAdded={handleVesselUpdated}
        initialValues={editingVessel}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={() => !loading && setDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete vessel "{vesselToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteConfirmOpen(false)} 
            disabled={isDisabled}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            disabled={isDisabled}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VesselList;
