import React, { useState } from 'react';
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
  Alert
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import VesselForm from './VesselForm';
import ServiceButtons from './ServiceButtons';
import axios from '../utils/axiosConfig';

const VesselList = ({ vessels, onVesselUpdated }) => {
  const [editingVessel, setEditingVessel] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [vesselToDelete, setVesselToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const handleEdit = (vessel) => {
    setEditingVessel(vessel);
    setOpenDialog(true);
  };

  const handleDeleteClick = (vessel) => {
    setVesselToDelete(vessel);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!vesselToDelete) return;

    try {
      await axios.delete(`/api/vessels/${vesselToDelete.id}`);
      setSnackbar({ 
        open: true, 
        message: 'Vessel deleted successfully', 
        severity: 'success' 
      });
      if (onVesselUpdated) {
        onVesselUpdated();
      }
    } catch (err) {
      console.error('Error deleting vessel:', err);
      setSnackbar({ 
        open: true, 
        message: err.response?.data?.message || 'Error deleting vessel', 
        severity: 'error' 
      });
    } finally {
      setDeleteConfirmOpen(false);
      setVesselToDelete(null);
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingVessel(null);
  };

  const handleCloseDeleteConfirm = () => {
    setDeleteConfirmOpen(false);
    setVesselToDelete(null);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

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
              <TableCell>Services</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vessels.map((vessel) => (
              <TableRow key={vessel.id}>
                <TableCell>{vessel.name}</TableCell>
                <TableCell>
                  {vessel.eta ? format(new Date(vessel.eta), 'dd-MMM-yyyy HH:mm') : '-'}
                </TableCell>
                <TableCell>
                  {vessel.etb ? format(new Date(vessel.etb), 'dd-MMM-yyyy HH:mm') : '-'}
                </TableCell>
                <TableCell>
                  {vessel.etd ? format(new Date(vessel.etd), 'dd-MMM-yyyy HH:mm') : '-'}
                </TableCell>
                <TableCell>
                  <ServiceButtons vessel={vessel} onVesselUpdated={onVesselUpdated} />
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => handleEdit(vessel)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton onClick={() => handleDeleteClick(vessel)}>
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
        onClose={handleCloseDialog}
        initialValues={editingVessel}
        onVesselAdded={onVesselUpdated}
      />

      <Dialog
        open={deleteConfirmOpen}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete vessel "{vesselToDelete?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default VesselList;
