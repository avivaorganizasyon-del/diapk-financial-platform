import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  AccountBalance,
  Receipt,
  History,
  CloudUpload,
  Info,
  CheckCircle,
  Pending,
  Cancel,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import { depositAPI } from '../../services/api';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  description?: string;
  isActive: boolean;
  isVisible: boolean;
  processingTime: string;
  minAmount: number;
  maxAmount: number;
  currency: string;
  commission?: number;
  details?: any;
  instructions?: string;
}

interface DepositData {
  amount: string;
  method: string;
  transactionId: string;
  bankName: string;
  accountNumber: string;
  receipt: File | null;
  notes: string;
}

interface UserDeposit {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  method: string;
  transactionId: string;
  bankName?: string;
  accountNumber?: string;
  rejectionReason?: string;
  createdAt: string;
}

const Deposit: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [depositData, setDepositData] = useState<DepositData>({
    amount: '',
    method: 'bank_transfer',
    transactionId: '',
    bankName: '',
    accountNumber: '',
    receipt: null,
    notes: ''
  });
  
  const [deposits, setDeposits] = useState<UserDeposit[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [depositDialog, setDepositDialog] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<PaymentMethod | null>(null);



  useEffect(() => {
    fetchDeposits();
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await depositAPI.getPaymentMethods();
      setPaymentMethods(response.data.paymentMethods || []);
      if (response.data.paymentMethods?.length > 0) {
        setSelectedPaymentMethod(response.data.paymentMethods[0]);
        setDepositData(prev => ({
          ...prev,
          method: response.data.paymentMethods[0].id
        }));
      }
    } catch (error: any) {
      console.error('Payment methods fetch error:', error);
      // Fallback to default payment methods
      const defaultMethods = [
        {
          id: 'bank_transfer',
          name: t('deposit.bankTransfer'),
          type: 'bank_transfer',
          isActive: true,
          processingTime: t('deposit.businessDays'),
          minAmount: 10,
          maxAmount: 50000,
          currency: 'TRY'
        }
      ];
      setPaymentMethods(defaultMethods);
      setSelectedPaymentMethod(defaultMethods[0]);
      setDepositData(prev => ({ ...prev, method: 'bank_transfer' }));
    }
  };

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      const response = await depositAPI.getUserDeposits({ page: 1, limit: 10 });
      setDeposits(response.data.deposits || response.data);
    } catch (error: any) {
      console.error('Deposits fetch error:', error);
      // Fallback mock data for testing
      setDeposits([
        {
          id: 1,
          amount: 5000,
          status: 'pending' as const,
          method: 'bank_transfer',
          transactionId: 'TXN001',
          bankName: 'Türkiye İş Bankası',
          accountNumber: 'TR33 0006 4000 0011 2345 6789 01',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          amount: 3000,
          status: 'approved' as const,
          method: 'bank_transfer',
          transactionId: 'TXN002',
          bankName: 'Garanti BBVA',
          accountNumber: 'TR56 0006 2000 0000 1234 5678 90',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ]);
      setError('');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!depositData.amount || parseFloat(depositData.amount) <= 0) {
      newErrors.amount = t('deposit.validAmountRequired');
    }
    
    if (parseFloat(depositData.amount) < 10) {
      newErrors.amount = t('deposit.minimumAmountError');
    }
    
    if (!depositData.transactionId.trim()) {
      newErrors.transactionId = t('deposit.transactionIdRequired');
    }
    
    if (!depositData.bankName.trim()) {
      newErrors.bankName = t('deposit.bankNameRequired');
    }
    
    if (!depositData.accountNumber.trim()) {
      newErrors.accountNumber = t('deposit.accountNumberRequired');
    }
    
    // Dekont/makbuz yüklemesi isteğe bağlı
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (file: File | null) => {
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          receipt: t('deposit.invalidFileType')
        }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({
          ...prev,
          receipt: t('deposit.fileSizeError')
        }));
        return;
      }
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.receipt;
        return newErrors;
      });
    }
    
    setDepositData(prev => ({
      ...prev,
      receipt: file
    }));
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      const formData = new FormData();
      formData.append('amount', depositData.amount);
      formData.append('method', depositData.method);
      formData.append('transactionId', depositData.transactionId);
      formData.append('bankName', depositData.bankName);
      formData.append('accountNumber', depositData.accountNumber);
      formData.append('notes', depositData.notes);
      
      if (depositData.receipt) {
        formData.append('receipt', depositData.receipt);
      }
      
      const response = await depositAPI.createDeposit(formData);
      
      setSuccess(t('deposit.submitSuccess'));
      setDepositDialog(false);
      
      // Reset form
      setDepositData({
        amount: '',
        method: 'bank_transfer',
        transactionId: '',
        bankName: '',
        accountNumber: '',
        receipt: null,
        notes: ''
      });
      
      // Refresh deposits
      fetchDeposits();
      
    } catch (error: any) {
      console.error('Deposit submission error:', error);
      setError(error.response?.data?.error || t('deposit.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'warning';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return t('deposit.approved');
      case 'rejected': return t('deposit.rejected');
      default: return t('deposit.pending');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle />;
      case 'rejected': return <Cancel />;
      default: return <Pending />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('deposit.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('deposit.description')}
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Yeni Yatırım */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  {t('deposit.newDeposit')}
                </Typography>
              </Box>
              
              <Button
                variant="contained"
                size="large"
                startIcon={<CloudUpload />}
                onClick={() => setDepositDialog(true)}
                fullWidth
                sx={{ py: 2 }}
              >
                {t('deposit.loadBalance')}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Hesap Bilgileri */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <Info sx={{ mr: 2, color: 'info.main' }} />
                <Typography variant="h6">
                  {t('deposit.accountInfo')}
                </Typography>
              </Box>
              
              {paymentMethods.filter(method => method.isActive && method.isVisible).map((method, index) => (
                <Box key={index} sx={{ mb: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {method.name}
                  </Typography>
                  
                  {method.type === 'crypto' && method.details && (
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2">
                        <strong>{t('deposit.walletAddress')}:</strong>
                      </Typography>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: 'monospace', 
                          bgcolor: 'grey.100', 
                          p: 1, 
                          borderRadius: 0.5, 
                          mt: 0.5,
                          wordBreak: 'break-all'
                        }}
                      >
                        {typeof method.details === 'object' ? method.details.walletAddress : method.details}
                      </Typography>
                    </Box>
                  )}
                  
                  {method.type === 'bank_transfer' && method.details && (
                    <Box sx={{ mt: 1 }}>
                      {typeof method.details === 'object' ? (
                        <>
                          {method.details.accountNumber && (
                            <Typography variant="body2">
                              <strong>{t('deposit.account')}:</strong> {method.details.accountNumber}
                            </Typography>
                          )}
                          {method.details.accountHolder && (
                            <Typography variant="body2">
                              <strong>{t('deposit.accountHolder')}:</strong> {method.details.accountHolder}
                            </Typography>
                          )}
                          {method.details.branch && (
                            <Typography variant="body2">
                              <strong>{t('deposit.branch')}:</strong> {method.details.branch}
                            </Typography>
                          )}
                        </>
                      ) : (
                        <Typography variant="body2">
                          {method.details}
                        </Typography>
                      )}
                    </Box>
                  )}
                  
                  <Box sx={{ mt: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      Min: {formatCurrency(method.minAmount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Max: {formatCurrency(method.maxAmount)}
                    </Typography>
                    {method.processingTime && (
                      <Typography variant="caption" color="text.secondary">
                        {t('deposit.processingTime')}: {method.processingTime}
                      </Typography>
                    )}
                  </Box>
                  
                  {method.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
                      {method.description}
                    </Typography>
                  )}
                </Box>
              ))}
              
              {paymentMethods.filter(method => method.isActive && method.isVisible).length === 0 && (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Şu anda aktif ödeme yöntemi bulunmamaktadır.
                  </Typography>
                </Box>
              )}
              
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Yukarıdaki ödeme yöntemlerinden birini kullanarak bakiye yükleyebilirsiniz.
                </Typography>
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Yatırım Geçmişi */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <History sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6">
                  {t('deposit.depositHistory')}
                </Typography>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : deposits.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    {t('deposit.noDeposits')}
                  </Typography>
                </Box>
              ) : (
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>{t('deposit.amount')}</TableCell>
                        <TableCell>{t('deposit.transactionId')}</TableCell>
                        <TableCell>{t('deposit.status')}</TableCell>
                        <TableCell>{t('deposit.date')}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {deposits.map((deposit) => (
                        <TableRow key={deposit.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {formatCurrency(deposit.amount)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontFamily="monospace">
                              {deposit.transactionId}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              icon={getStatusIcon(deposit.status)}
                              label={getStatusText(deposit.status)}
                              color={getStatusColor(deposit.status) as any}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(deposit.createdAt)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Yatırım Dialog */}
      <Dialog open={depositDialog} onClose={() => setDepositDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <AccountBalance color="primary" />
            {t('deposit.title')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t('deposit.depositAmount')}
                  type="number"
                  value={depositData.amount}
                  onChange={(e) => setDepositData(prev => ({ ...prev, amount: e.target.value }))}
                  error={!!errors.amount}
                  helperText={errors.amount || t('deposit.minimumAmount')}
                  InputProps={{
                    endAdornment: <InputAdornment position="end">TL</InputAdornment>,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('deposit.paymentMethod')}</InputLabel>
                  <Select
                    value={depositData.method}
                    onChange={(e) => {
                      const method = paymentMethods.find(pm => pm.id === e.target.value);
                      setSelectedPaymentMethod(method || null);
                      setDepositData(prev => ({ ...prev, method: e.target.value }));
                    }}
                    label={t('deposit.paymentMethod')}
                  >
                    {paymentMethods.map((method) => (
                      <MenuItem key={method.id} value={method.id}>
                        {method.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Ödeme Yöntemi Bilgileri */}
              {selectedPaymentMethod && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {selectedPaymentMethod.name} - {t('deposit.details')}
                    </Typography>
                    {selectedPaymentMethod.description && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>{t('deposit.description')}:</strong> {selectedPaymentMethod.description}
                        </Typography>
                      )}
                    <Typography variant="body2">
                        <strong>{t('deposit.processingTime')}:</strong> {selectedPaymentMethod.processingTime}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('deposit.minAmount')}:</strong> {selectedPaymentMethod.minAmount} {selectedPaymentMethod.currency}
                      </Typography>
                      <Typography variant="body2">
                        <strong>{t('deposit.maxAmount')}:</strong> {selectedPaymentMethod.maxAmount} {selectedPaymentMethod.currency}
                      </Typography>
                    {selectedPaymentMethod.commission && selectedPaymentMethod.commission > 0 && (
                        <Typography variant="body2">
                          <strong>{t('deposit.commission')}:</strong> %{selectedPaymentMethod.commission}
                        </Typography>
                      )}
                    {selectedPaymentMethod.type === 'crypto' && selectedPaymentMethod.details && (
                      <Typography variant="body2" sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontFamily: 'monospace' }}>
                        <strong>{t('deposit.walletAddress')}:</strong><br />
                        {typeof selectedPaymentMethod.details === 'string' ? selectedPaymentMethod.details : selectedPaymentMethod.details.walletAddress || 'Belirtilmemiş'}
                      </Typography>
                    )}
                    {selectedPaymentMethod.instructions && (
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          <strong>{t('deposit.instructions')}:</strong> {selectedPaymentMethod.instructions}
                        </Typography>
                      )}
                  </Alert>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={selectedPaymentMethod?.type === 'crypto' ? t('deposit.transactionHash') : t('deposit.transactionReference')}
                  value={depositData.transactionId}
                  onChange={(e) => setDepositData(prev => ({ ...prev, transactionId: e.target.value }))}
                  error={!!errors.transactionId}
                  helperText={errors.transactionId || (selectedPaymentMethod?.type === 'crypto' ? t('deposit.blockchainHashHelp') : '')}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={selectedPaymentMethod?.type === 'crypto' ? t('deposit.senderWallet') : t('deposit.bankName')}
                  value={depositData.bankName}
                  onChange={(e) => setDepositData(prev => ({ ...prev, bankName: e.target.value }))}
                  error={!!errors.bankName}
                  helperText={errors.bankName || (selectedPaymentMethod?.type === 'crypto' ? t('deposit.senderWalletHelp') : '')}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={selectedPaymentMethod?.type === 'crypto' ? t('deposit.receiverWallet') : t('deposit.accountNumber')}
                  value={depositData.accountNumber}
                  onChange={(e) => setDepositData(prev => ({ ...prev, accountNumber: e.target.value }))}
                  error={!!errors.accountNumber}
                  helperText={errors.accountNumber || (selectedPaymentMethod?.type === 'crypto' ? 'Ödemeyi gönderdiğiniz hedef cüzdan adresi' : '')}
                />
              </Grid>
              <Grid item xs={12}>
                <Box>
                  <input
                    id="receipt-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0] || null;
                      handleFileChange(file);
                    }}
                    style={{ display: 'none' }}
                  />
                  <label htmlFor="receipt-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<Receipt />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      {t('deposit.uploadReceipt')}
                    </Button>
                  </label>
                  {depositData.receipt && (
                    <Typography variant="body2" color="success.main">
                      ✓ {depositData.receipt.name}
                    </Typography>
                  )}
                  {errors.receipt && (
                    <Typography variant="body2" color="error">
                      {errors.receipt}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                    {t('deposit.acceptedFormats')}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label={t('deposit.notes')}
                  multiline
                  rows={3}
                  value={depositData.notes}
                  onChange={(e) => setDepositData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder={t('deposit.notesPlaceholder')}
                />
              </Grid>
            </Grid>
            
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositDialog(false)} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting}
            startIcon={submitting ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {submitting ? t('deposit.submitting') : t('deposit.submitApplication')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Deposit;