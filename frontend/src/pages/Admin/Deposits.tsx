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
  Pagination,
  CircularProgress,
  Alert,
  Avatar,
  Grid,
  Card,
  CardContent,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  AccountBalance as AccountBalanceIcon,
  Receipt as ReceiptIcon,
  Payment as PaymentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/adminAPI';
import type { Deposit } from '../../services/adminAPI';

const Deposits: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [manualPaymentDialogOpen, setManualPaymentDialogOpen] = useState(false);
  const [manualPaymentData, setManualPaymentData] = useState({
    userId: '',
    amount: '',
    method: 'manual_payment',
    description: '',
    transactionId: '',
    paymentMethod: 'bank_transfer'
  });

  useEffect(() => {
    fetchDeposits();
  }, [page, statusFilter]);

  const fetchDeposits = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDeposits({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      setDeposits(response.data.deposits);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch deposits:', error);
      setError(t('admin.deposits.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (depositId: number, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await adminAPI.reviewDeposit(depositId, { status, rejectionReason: reason });
      fetchDeposits();
      setReviewDialogOpen(false);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Failed to review deposit:', error);
      setError(t('admin.deposits.reviewError'));
    }
  };

  const handleManualPayment = async () => {
    try {
      const response = await adminAPI.createManualDeposit({
        userId: parseInt(manualPaymentData.userId),
        amount: parseFloat(manualPaymentData.amount),
        method: manualPaymentData.paymentMethod,
        description: manualPaymentData.description,
        transactionId: manualPaymentData.transactionId || `MANUAL_${Date.now()}`
      });
      
      fetchDeposits();
      setManualPaymentDialogOpen(false);
      setManualPaymentData({
        userId: '',
        amount: '',
        method: 'manual_payment',
        description: '',
        transactionId: '',
        paymentMethod: 'bank_transfer'
      });
    } catch (error: any) {
      console.error('Failed to create manual payment:', error);
      setError(t('admin.deposits.manualPaymentError'));
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'success';
      case 'rejected': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved': return t('common.approved');
      case 'rejected': return t('common.rejected');
      case 'pending': return t('common.pending');
      default: return status;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton onClick={() => navigate('/admin')} size="small">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 600 }}>
            {t('admin.depositManagement')}
          </Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          {t('admin.deposits.description')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('common.status')}</InputLabel>
              <Select
                value={statusFilter}
                label={t('common.status')}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="">{t('common.all')}</MenuItem>
                <MenuItem value="pending">{t('common.pending')}</MenuItem>
                <MenuItem value="approved">{t('common.approved')}</MenuItem>
                <MenuItem value="rejected">{t('common.rejected')}</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="outlined"
              startIcon={<SearchIcon />}
              onClick={fetchDeposits}
              fullWidth
            >
              {t('common.refresh')}
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              startIcon={<PaymentIcon />}
              onClick={() => setManualPaymentDialogOpen(true)}
              fullWidth
            >
              {t('admin.deposits.addManualPayment')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>{t('common.user')}</TableCell>
                  <TableCell>{t('common.amount')}</TableCell>
                  <TableCell>{t('admin.deposits.bank')}</TableCell>
                  <TableCell>{t('admin.deposits.transactionId')}</TableCell>
                  <TableCell>{t('common.status')}</TableCell>
                  <TableCell>{t('common.date')}</TableCell>
                  <TableCell align="center">{t('common.actions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {deposit.User.firstName.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {deposit.User.firstName} {deposit.User.lastName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {deposit.User.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {formatCurrency(deposit.amount)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {deposit.bankName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {deposit.accountNumber}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {deposit.transactionId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
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
                    <TableCell align="center">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedDeposit(deposit);
                          setDialogOpen(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      {deposit.status === 'pending' && (
                        <>
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleReview(deposit.id, 'approved')}
                          >
                            <CheckIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => {
                              setSelectedDeposit(deposit);
                              setReviewDialogOpen(true);
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}

      {/* Deposit Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('admin.deposits.depositDetails')}
        </DialogTitle>
        <DialogContent>
          {selectedDeposit && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('admin.deposits.userInfo')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.fullName')}
                      </Typography>
                      <Typography variant="body1">
                        {selectedDeposit.User.firstName} {selectedDeposit.User.lastName}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.email')}
                      </Typography>
                      <Typography variant="body1">
                        {selectedDeposit.User.email}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.phone')}
                      </Typography>
                      <Typography variant="body1">
                        {selectedDeposit.User.phone || t('common.notSpecified')}
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('admin.deposits.depositInfo')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.amount')}
                      </Typography>
                      <Typography variant="h5" color="primary" fontWeight={600}>
                        {formatCurrency(selectedDeposit.amount)}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.deposits.bank')}
                      </Typography>
                      <Typography variant="body1">
                        {selectedDeposit.bankName}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.deposits.accountNumber')}
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace">
                        {selectedDeposit.accountNumber}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.deposits.transactionId')}
                      </Typography>
                      <Typography variant="body1" fontFamily="monospace">
                        {selectedDeposit.transactionId}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.status')}
                      </Typography>
                      <Chip
                        label={getStatusText(selectedDeposit.status)}
                        color={getStatusColor(selectedDeposit.status) as any}
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('admin.deposits.applicationDate')}
                      </Typography>
                      <Typography variant="body1">
                        {formatDate(selectedDeposit.createdAt)}
                      </Typography>
                    </Box>
                    {selectedDeposit.rejectionReason && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          {t('admin.deposits.rejectionReason')}
                        </Typography>
                        <Typography variant="body1" color="error">
                          {selectedDeposit.rejectionReason}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
              {selectedDeposit.receipt && (
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {t('admin.deposits.receipt')}
                      </Typography>
                      <Box sx={{ textAlign: 'center' }}>
                        <img
                          src={selectedDeposit.receipt}
                          alt={t('admin.deposits.receipt')}
                          style={{ maxWidth: '100%', maxHeight: '400px', objectFit: 'contain' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.close')}</Button>
          {selectedDeposit?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                startIcon={<CheckIcon />}
                onClick={() => {
                  if (selectedDeposit) {
                    handleReview(selectedDeposit.id, 'approved');
                    setDialogOpen(false);
                  }
                }}
              >
                {t('common.approve')}
              </Button>
              <Button
                variant="contained"
                color="error"
                startIcon={<CloseIcon />}
                onClick={() => {
                  setDialogOpen(false);
                  setReviewDialogOpen(true);
                }}
              >
                {t('common.reject')}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={reviewDialogOpen} onClose={() => setReviewDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admin.deposits.rejectDeposit')}</DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t('admin.deposits.rejectConfirmation')}
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('admin.deposits.rejectionReason')}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder={t('admin.deposits.rejectionReasonPlaceholder')}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setReviewDialogOpen(false);
            setRejectionReason('');
          }}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedDeposit && rejectionReason.trim()) {
                handleReview(selectedDeposit.id, 'rejected', rejectionReason);
              }
            }}
            disabled={!rejectionReason.trim()}
          >
            {t('common.reject')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Manual Payment Dialog */}
      <Dialog open={manualPaymentDialogOpen} onClose={() => setManualPaymentDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('admin.deposits.addManualPayment')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={t('admin.deposits.userId')}
              value={manualPaymentData.userId}
              onChange={(e) => setManualPaymentData({ ...manualPaymentData, userId: e.target.value })}
              margin="normal"
              type="number"
              required
            />
            <TextField
              fullWidth
              label={t('common.amount')}
              value={manualPaymentData.amount}
              onChange={(e) => setManualPaymentData({ ...manualPaymentData, amount: e.target.value })}
              margin="normal"
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">₺</InputAdornment>,
              }}
              required
            />
            <FormControl fullWidth margin="normal" required>
              <InputLabel>{t('admin.deposits.paymentMethod')}</InputLabel>
              <Select
                value={manualPaymentData.paymentMethod}
                onChange={(e) => setManualPaymentData({ ...manualPaymentData, paymentMethod: e.target.value })}
                label={t('admin.deposits.paymentMethod')}
              >
                <MenuItem value="bank_transfer">{t('admin.deposits.bankTransfer')}</MenuItem>
                <MenuItem value="eft">{t('admin.deposits.eft')}</MenuItem>
                <MenuItem value="cash">{t('admin.deposits.cash')}</MenuItem>
                <MenuItem value="credit_card">{t('admin.deposits.creditCard')}</MenuItem>
                <MenuItem value="crypto">{t('admin.deposits.crypto')}</MenuItem>
                <MenuItem value="other">{t('admin.deposits.other')}</MenuItem>
              </Select>
            </FormControl>
            
            {/* Ödeme Bilgileri */}
            {manualPaymentData.paymentMethod && (
              <Card sx={{ mt: 2, mb: 2, bgcolor: 'grey.50' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    {t('admin.deposits.paymentInfo')}
                  </Typography>
                  {manualPaymentData.paymentMethod === 'bank_transfer' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('admin.deposits.bankTransferInfo')}:</strong>
                      </Typography>
                      <Typography variant="body2">• {t('admin.deposits.bank')}: {t('admin.deposits.bankName')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.accountNo')}: {t('admin.deposits.bankAccountNumber')}</Typography>
                      <Typography variant="body2">• IBAN: {t('admin.deposits.bankIban')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.accountHolder')}: {t('admin.deposits.companyName')}</Typography>
                    </Box>
                  )}
                  {manualPaymentData.paymentMethod === 'eft' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('admin.deposits.eftInfo')}:</strong>
                      </Typography>
                      <Typography variant="body2">• {t('admin.deposits.bank')}: {t('admin.deposits.eftBankName')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.accountNo')}: {t('admin.deposits.eftAccountNumber')}</Typography>
                      <Typography variant="body2">• IBAN: {t('admin.deposits.eftIban')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.accountHolder')}: {t('admin.deposits.companyName')}</Typography>
                    </Box>
                  )}
                  {manualPaymentData.paymentMethod === 'cash' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('admin.deposits.cashPayment')}:</strong>
                      </Typography>
                      <Typography variant="body2">• {t('admin.deposits.officeAddress')}: {t('admin.deposits.officeAddressValue')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.workingHours')}: {t('admin.deposits.workingHoursValue')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.phone')}: {t('admin.deposits.phoneNumber')}</Typography>
                    </Box>
                  )}
                  {manualPaymentData.paymentMethod === 'credit_card' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('admin.deposits.creditCardPayment')}:</strong>
                      </Typography>
                      <Typography variant="body2">• {t('admin.deposits.virtualPosInfo')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.secure3dInfo')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.commissionInfo')}: {t('admin.deposits.commissionRate')}</Typography>
                    </Box>
                  )}
                  {manualPaymentData.paymentMethod === 'crypto' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('admin.deposits.cryptoPayment')}:</strong>
                      </Typography>
                      <Typography variant="body2">• Bitcoin (BTC): {t('admin.deposits.bitcoinAddress')}</Typography>
                      <Typography variant="body2">• Ethereum (ETH): {t('admin.deposits.ethereumAddress')}</Typography>
                      <Typography variant="body2">• USDT (TRC20): {t('admin.deposits.usdtAddress')}</Typography>
                    </Box>
                  )}
                  {manualPaymentData.paymentMethod === 'other' && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        <strong>{t('admin.deposits.otherPaymentMethods')}:</strong>
                      </Typography>
                      <Typography variant="body2">• {t('admin.deposits.contactSupport')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.phone')}: {t('admin.deposits.phoneNumber')}</Typography>
                      <Typography variant="body2">• {t('admin.deposits.email')}: {t('admin.deposits.supportEmail')}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
            
            <TextField
              fullWidth
              label={t('admin.deposits.transactionIdOptional')}
              value={manualPaymentData.transactionId}
              onChange={(e) => setManualPaymentData({ ...manualPaymentData, transactionId: e.target.value })}
              margin="normal"
              placeholder={t('admin.deposits.transactionIdPlaceholder')}
            />
            <TextField
              fullWidth
              multiline
              rows={3}
              label={t('common.description')}
              value={manualPaymentData.description}
              onChange={(e) => setManualPaymentData({ ...manualPaymentData, description: e.target.value })}
              margin="normal"
              placeholder={t('admin.deposits.descriptionPlaceholder')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setManualPaymentDialogOpen(false);
            setManualPaymentData({
              userId: '',
              amount: '',
              method: 'manual_payment',
              description: '',
              transactionId: '',
              paymentMethod: 'bank_transfer'
            });
          }}>
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            onClick={handleManualPayment}
            disabled={!manualPaymentData.userId || !manualPaymentData.amount}
          >
            {t('admin.deposits.addPayment')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Deposits;