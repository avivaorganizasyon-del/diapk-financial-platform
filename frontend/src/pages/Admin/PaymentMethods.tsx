import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Grid,
  Alert,
  Tooltip,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  PowerSettingsNew as PowerIcon,
  ArrowBack as ArrowBackIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/adminAPI';

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  description?: string;
  details?: any;
  isActive: boolean;
  isVisible: boolean;
  sortOrder: number;
  minAmount?: number;
  maxAmount?: number;
  commission: number;
  processingTime?: string;
  instructions?: string;
  createdAt: string;
  updatedAt: string;
}

const PaymentMethods: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [methodToDelete, setMethodToDelete] = useState<PaymentMethod | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'bank_transfer',
    description: '',
    details: {},
    isActive: true,
    isVisible: true,
    sortOrder: 0,
    minAmount: '',
    maxAmount: '',
    commission: 0,
    processingTime: '',
    instructions: ''
  });

  const paymentTypeOptions = [
    { value: 'bank_transfer', label: t('paymentMethods.bankTransfer') },
    { value: 'eft', label: t('paymentMethods.eft') },
    { value: 'cash', label: t('paymentMethods.cash') },
    { value: 'credit_card', label: t('paymentMethods.creditCard') },
    { value: 'crypto', label: t('paymentMethods.crypto') },
    { value: 'other', label: t('paymentMethods.other') }
  ];

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getPaymentMethods();
      setPaymentMethods(response.data);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || t('paymentMethods.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError(t('admin.paymentMethods.errors.nameRequired'));
      return false;
    }

    if (formData.type === 'crypto') {
      const walletAddress = typeof formData.details === 'object' ? formData.details.walletAddress : formData.details;
      if (!walletAddress || !walletAddress.trim()) {
        setError(t('admin.paymentMethods.errors.walletAddressRequired'));
        return false;
      }
    }

    if (formData.minAmount && formData.maxAmount) {
      const min = parseFloat(formData.minAmount);
      const max = parseFloat(formData.maxAmount);
      if (min >= max) {
        setError(t('admin.paymentMethods.errors.invalidAmountRange'));
        return false;
      }
    }

    if (formData.commission < 0 || formData.commission > 100) {
      setError(t('admin.paymentMethods.errors.invalidCommission'));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const data = {
        ...formData,
        minAmount: formData.minAmount ? parseFloat(formData.minAmount) : undefined,
        maxAmount: formData.maxAmount ? parseFloat(formData.maxAmount) : undefined,
      };

      if (editingMethod) {
        await adminAPI.updatePaymentMethod(editingMethod.id, data);
      } else {
        await adminAPI.createPaymentMethod(data);
      }

      fetchPaymentMethods();
      handleCloseDialog();
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || t('admin.paymentMethods.errors.operationFailed'));
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      type: method.type,
      description: method.description || '',
      details: method.details || {},
      isActive: method.isActive,
      isVisible: method.isVisible,
      sortOrder: method.sortOrder,
      minAmount: method.minAmount?.toString() || '',
      maxAmount: method.maxAmount?.toString() || '',
      commission: method.commission,
      processingTime: method.processingTime || '',
      instructions: method.instructions || ''
    });
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!methodToDelete) return;

    try {
      await adminAPI.deletePaymentMethod(methodToDelete.id);
      fetchPaymentMethods();
      setDeleteDialogOpen(false);
      setMethodToDelete(null);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Silme işlemi sırasında hata oluştu');
    }
  };

  const handleToggleStatus = async (method: PaymentMethod, field: 'isActive' | 'isVisible') => {
    try {
      await adminAPI.togglePaymentMethodStatus(method.id, field, !method[field]);
      fetchPaymentMethods();
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Durum güncellenirken hata oluştu');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingMethod(null);
    setError('');
    setFormData({
      name: '',
      type: 'bank_transfer',
      description: '',
      details: {},
      isActive: true,
      isVisible: true,
      sortOrder: 0,
      minAmount: '',
      maxAmount: '',
      commission: 0,
      processingTime: '',
      instructions: ''
    });
  };

  const handleTypeChange = (newType: string) => {
    setFormData({
      ...formData,
      type: newType,
      details: {} // Reset details when type changes
    });
  };

  const getTypeLabel = (type: string) => {
    const option = paymentTypeOptions.find(opt => opt.value === type);
    return option ? option.label : type;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <Typography>Yükleniyor...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        {/* Header */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton onClick={() => navigate('/admin')} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <PaymentIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h4" component="h1">
              {t('admin.paymentMethods.title')}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setDialogOpen(true)}
          >
            {t('admin.paymentMethods.addMethod')}
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Payment Methods Table */}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>{t('admin.paymentMethods.sortOrder')}</TableCell>
                <TableCell>{t('admin.paymentMethods.name')}</TableCell>
                <TableCell>{t('admin.paymentMethods.type')}</TableCell>
                <TableCell>{t('admin.paymentMethods.commission')}</TableCell>
                <TableCell>{t('admin.paymentMethods.minAmount')}/{t('admin.paymentMethods.maxAmount')}</TableCell>
                <TableCell>{t('admin.paymentMethods.isActive')}</TableCell>
                <TableCell>{t('admin.paymentMethods.isVisible')}</TableCell>
                <TableCell>{t('common.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paymentMethods.map((method) => (
                <TableRow key={method.id}>
                  <TableCell>{method.sortOrder}</TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="subtitle2">{method.name}</Typography>
                      {method.description && (
                        <Typography variant="caption" color="text.secondary">
                          {method.description}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getTypeLabel(method.type)}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>%{method.commission}</TableCell>
                  <TableCell>
                    <Typography variant="caption">
                      {method.minAmount ? `₺${method.minAmount}` : 'Min: -'}
                      {' / '}
                      {method.maxAmount ? `₺${method.maxAmount}` : 'Max: -'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={method.isActive}
                      onChange={() => handleToggleStatus(method, 'isActive')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={method.isVisible}
                      onChange={() => handleToggleStatus(method, 'isVisible')}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <Tooltip title={t('common.edit')}>
                        <IconButton
                          size="small"
                          onClick={() => handleEdit(method)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton
                          size="small"
                          onClick={() => {
                            setMethodToDelete(method);
                            setDeleteDialogOpen(true);
                          }}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {paymentMethods.length === 0 && (
          <Box textAlign="center" py={4}>
            <Typography variant="h6" color="text.secondary">
              {t('admin.paymentMethods.noMethods')}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {t('admin.paymentMethods.addMethodHelp')}
            </Typography>
          </Box>
        )}
      </Paper>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingMethod ? t('admin.paymentMethods.editMethod') : t('admin.paymentMethods.addMethod')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('admin.paymentMethods.name')}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth required>
                  <InputLabel>{t('admin.paymentMethods.type')}</InputLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    label={t('admin.paymentMethods.type')}
                  >
                    {paymentTypeOptions.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label={t('admin.paymentMethods.description')}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('paymentMethods.minAmount')}
                  value={formData.minAmount}
                  onChange={(e) => setFormData({ ...formData, minAmount: e.target.value })}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('paymentMethods.maxAmount')}
                  value={formData.maxAmount}
                  onChange={(e) => setFormData({ ...formData, maxAmount: e.target.value })}
                  type="number"
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₺</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label={t('paymentMethods.commission')}
                  value={formData.commission}
                  onChange={(e) => setFormData({ ...formData, commission: parseFloat(e.target.value) || 0 })}
                  type="number"
                  InputProps={{
                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('paymentMethods.processingTime')}
                  value={formData.processingTime}
                  onChange={(e) => setFormData({ ...formData, processingTime: e.target.value })}
                  placeholder={t('paymentMethods.processingTimePlaceholder')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label={t('paymentMethods.sortOrder')}
                  value={formData.sortOrder}
                  onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })}
                  type="number"
                />
              </Grid>
              {formData.type === 'crypto' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label={t('paymentMethods.walletAddress')}
                    value={typeof formData.details === 'object' ? formData.details.walletAddress || '' : formData.details || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      details: { 
                        ...formData.details, 
                        walletAddress: e.target.value 
                      } 
                    })}
                    placeholder={t('paymentMethods.walletAddressPlaceholder')}
                    helperText={t('paymentMethods.walletAddressHelper')}
                    required
                  />
                </Grid>
              )}
              
              {formData.type === 'bank_transfer' && (
                <>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('paymentMethods.accountNumber')}
                      value={typeof formData.details === 'object' ? formData.details.accountNumber || '' : ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        details: { 
                          ...formData.details, 
                          accountNumber: e.target.value 
                        } 
                      })}
                      placeholder={t('paymentMethods.accountNumberPlaceholder')}
                      helperText={t('paymentMethods.accountNumberHelper')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('paymentMethods.accountHolder')}
                      value={typeof formData.details === 'object' ? formData.details.accountHolder || '' : ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        details: { 
                          ...formData.details, 
                          accountHolder: e.target.value 
                        } 
                      })}
                      placeholder={t('paymentMethods.accountHolderPlaceholder')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('paymentMethods.bankName')}
                      value={typeof formData.details === 'object' ? formData.details.bankName || '' : ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        details: { 
                          ...formData.details, 
                          bankName: e.target.value 
                        } 
                      })}
                      placeholder={t('paymentMethods.bankNamePlaceholder')}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label={t('paymentMethods.branch')}
                      value={typeof formData.details === 'object' ? formData.details.branch || '' : ''}
                      onChange={(e) => setFormData({ 
                        ...formData, 
                        details: { 
                          ...formData.details, 
                          branch: e.target.value 
                        } 
                      })}
                      placeholder={t('paymentMethods.branchPlaceholder')}
                    />
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label={t('paymentMethods.instructions')}
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  placeholder={t('paymentMethods.instructionsPlaceholder')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label={t('common.active')}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isVisible}
                      onChange={(e) => setFormData({ ...formData, isVisible: e.target.checked })}
                    />
                  }
                  label={t('paymentMethods.visibleToUsers')}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!formData.name || !formData.type}
          >
            {editingMethod ? t('common.update') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('paymentMethods.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('paymentMethods.deleteConfirmation', { name: methodToDelete?.name })}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            {t('common.delete')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PaymentMethods;