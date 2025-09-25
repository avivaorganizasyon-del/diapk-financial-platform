import React from 'react';
import { Snackbar, Alert } from '@mui/material';
import type { AlertColor } from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState } from '../../store';
import { hideSnackbar } from '../../store/slices/uiSlice';

const NotificationSnackbar: React.FC = () => {
  const dispatch = useDispatch();
  const { snackbar } = useSelector((state: RootState) => state.ui);

  const handleClose = (_event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch(hideSnackbar());
  };

  return (
    <Snackbar
      open={snackbar.open}
      autoHideDuration={snackbar.autoHideDuration}
      onClose={handleClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert
        onClose={handleClose}
        severity={snackbar.severity as AlertColor}
        variant="filled"
        sx={{ width: '100%' }}
      >
        {snackbar.message}
      </Alert>
    </Snackbar>
  );
};

export default NotificationSnackbar;