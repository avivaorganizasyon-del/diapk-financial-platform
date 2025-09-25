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
  CardMedia,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/adminAPI';
import type { KycApplication } from '../../services/adminAPI';

const KYC: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [kycs, setKycs] = useState<KycApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedKyc, setSelectedKyc] = useState<KycApplication | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchKycs();
  }, [page, statusFilter]);

  const fetchKycs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getKycApplications({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      setKycs(response.data.kycs);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch KYC applications:', error);
      setError(t('admin.kyc.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (kycId: number, status: 'approved' | 'rejected', reason?: string) => {
    try {
      await adminAPI.reviewKyc(kycId, { status, rejectionReason: reason });
      fetchKycs();
      setReviewDialogOpen(false);
      setRejectionReason('');
    } catch (error: any) {
      console.error('Failed to review KYC:', error);
      setError(t('admin.kyc.reviewError'));
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 700, flexGrow: 1 }}>
          {t('admin.kycReviews')}
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <FormControl sx={{ minWidth: 150 }}>
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
        </Box>
      </Paper>

      {/* KYC Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.user')}</TableCell>
                    <TableCell>{t('admin.documentType')}</TableCell>
                    <TableCell>{t('admin.documentNumber')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('admin.applicationDate')}</TableCell>
                    <TableCell align="center">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {kycs.map((kyc) => (
                    <TableRow key={kyc.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {kyc.user.firstName.charAt(0)}{kyc.user.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {kyc.user.firstName} {kyc.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {kyc.user.email}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{kyc.documentType}</TableCell>
                      <TableCell>{kyc.documentNumber}</TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(kyc.status)}
                          color={getStatusColor(kyc.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(kyc.createdAt).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => {
                            setSelectedKyc(kyc);
                            setDialogOpen(true);
                          }}
                          size="small"
                        >
                          <VisibilityIcon />
                        </IconButton>
                        {kyc.status === 'pending' && (
                          <>
                            <IconButton
                              onClick={() => handleReview(kyc.id, 'approved')}
                              size="small"
                              color="success"
                            >
                              <CheckIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                setSelectedKyc(kyc);
                                setReviewDialogOpen(true);
                              }}
                              size="small"
                              color="error"
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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* KYC Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('admin.kycApplicationDetails')}
        </DialogTitle>
        <DialogContent>
          {selectedKyc && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('admin.userInfo')}
                </Typography>
                <Typography><strong>{t('admin.fullName')}:</strong> {selectedKyc.user.firstName} {selectedKyc.user.lastName}</Typography>
                <Typography><strong>{t('auth.email')}:</strong> {selectedKyc.user.email}</Typography>
                <Typography><strong>{t('auth.phone')}:</strong> {selectedKyc.user.phone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('admin.documentInfo')}
                </Typography>
                <Typography><strong>{t('admin.documentType')}:</strong> {selectedKyc.documentType}</Typography>
                <Typography><strong>{t('admin.documentNumber')}:</strong> {selectedKyc.documentNumber}</Typography>
                <Typography><strong>{t('common.status')}:</strong> {getStatusText(selectedKyc.status)}</Typography>
                {selectedKyc.rejectionReason && (
                  <Typography><strong>{t('admin.rejectionReason')}:</strong> {selectedKyc.rejectionReason}</Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('admin.documentPhotos')}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={selectedKyc.frontImage}
                        alt={t('admin.kyc.frontSide')}
                        sx={{ objectFit: 'contain' }}
                      />
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="caption">{t('admin.frontSide')}</Typography>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={selectedKyc.backImage}
                        alt={t('admin.kyc.backSide')}
                        sx={{ objectFit: 'contain' }}
                      />
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="caption">{t('admin.backSide')}</Typography>
                      </Box>
                    </Card>
                  </Grid>
                  <Grid item xs={4}>
                    <Card>
                      <CardMedia
                        component="img"
                        height="200"
                        image={selectedKyc.selfieImage}
                        alt={t('admin.kyc.selfie')}
                        sx={{ objectFit: 'contain' }}
                      />
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Typography variant="caption">{t('admin.selfie')}</Typography>
                      </Box>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.close')}</Button>
          {selectedKyc?.status === 'pending' && (
            <>
              <Button
                variant="contained"
                color="success"
                onClick={() => {
                  if (selectedKyc) {
                    handleReview(selectedKyc.id, 'approved');
                    setDialogOpen(false);
                  }
                }}
              >
                {t('common.approve')}
              </Button>
              <Button
                variant="contained"
                color="error"
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
        <DialogTitle>
          {t('admin.rejectKycApplication')}
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            label={t('admin.rejectionReason')}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              if (selectedKyc) {
                handleReview(selectedKyc.id, 'rejected', rejectionReason);
              }
            }}
            disabled={!rejectionReason.trim()}
          >
            {t('common.reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default KYC;