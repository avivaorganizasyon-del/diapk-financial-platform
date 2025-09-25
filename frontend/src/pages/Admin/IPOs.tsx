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
  Grid,
  Card,
  CardContent,
  CardActions,
  Fab,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  MonetizationOn as MonetizationOnIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/adminAPI';
import type { IPO } from '../../services/adminAPI';

const IPOs: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [ipos, setIpos] = useState<IPO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedIpo, setSelectedIpo] = useState<IPO | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    description: '',
    price: '',
    lotSize: '',
    startDate: '',
    endDate: '',
    status: 'upcoming',
    exchange: 'BIST',
  });

  useEffect(() => {
    fetchIpos();
  }, [page, statusFilter]);

  const fetchIpos = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching IPOs with params:', { page, limit: 10, status: statusFilter || undefined });
      const response = await adminAPI.getIpos({
        page,
        limit: 10,
        status: statusFilter || undefined,
      });
      console.log('IPO API Response:', response);
      setIpos(response.data?.ipos || response.ipos || []);
      setTotalPages(response.data?.totalPages || response.totalPages || 1);
    } catch (error: any) {
      console.error('Failed to load IPOs:', error);
      setError(t('admin.ipos.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await adminAPI.createIpo({
        symbol: formData.symbol,
        companyName: formData.name,
        exchange: formData.exchange,
        priceMin: parseFloat(formData.price),
        priceMax: parseFloat(formData.price),
        lotSize: parseInt(formData.lotSize),
        startDate: formData.startDate,
        endDate: formData.endDate,
        description: formData.description,
      });
      fetchIpos();
      setEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to create IPO:', error);
      setError(t('admin.ipos.createError'));
    }
  };

  const handleUpdate = async () => {
    if (!selectedIpo) return;
    try {
      await adminAPI.updateIpo(selectedIpo.id, {
        ...formData,
        price: parseFloat(formData.price),
        totalShares: parseInt(formData.totalShares),
        availableShares: parseInt(formData.availableShares),
        minInvestment: parseFloat(formData.minInvestment),
        maxInvestment: parseFloat(formData.maxInvestment),
      });
      fetchIpos();
      setEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to update IPO:', error);
      setError(t('admin.ipos.updateError'));
    }
  };

  const handleDelete = async () => {
    if (!selectedIpo) return;
    try {
      await adminAPI.deleteIpo(selectedIpo.id);
      fetchIpos();
      setDeleteDialogOpen(false);
      setSelectedIpo(null);
    } catch (error: any) {
      console.error('Failed to delete IPO:', error);
      setError(t('admin.ipos.deleteError'));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      symbol: '',
      description: '',
      price: '',
      lotSize: '',
      startDate: '',
      endDate: '',
      status: 'upcoming',
      exchange: 'BIST',
    });
    setSelectedIpo(null);
  };

  const openEditDialog = (ipo?: IPO) => {
    if (ipo) {
      setSelectedIpo(ipo);
      setFormData({
        name: ipo.companyName,
        symbol: ipo.symbol,
        description: ipo.description,
        price: ipo.priceMin.toString(),
        lotSize: ipo.lotSize.toString(),
        startDate: ipo.startDate.split('T')[0],
        endDate: ipo.endDate.split('T')[0],
        status: ipo.status,
        exchange: ipo.exchange || 'BIST',
      });
    } else {
      resetForm();
    }
    setEditDialogOpen(true);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'ongoing': return 'success';
      case 'closed': return 'info';
      case 'upcoming': return 'warning';
      case 'listed': return 'primary';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ongoing': return t('common.active');
      case 'closed': return t('common.closed');
      case 'upcoming': return t('common.upcoming');
      case 'listed': return t('common.listed');
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
          {t('admin.ipoManagement')}
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('common.status')}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="upcoming">{t('common.upcoming')}</MenuItem>
              <MenuItem value="ongoing">{t('common.active')}</MenuItem>
              <MenuItem value="closed">{t('common.closed')}</MenuItem>
              <MenuItem value="listed">{t('common.listed')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openEditDialog()}
          >
            {t('admin.newIPO')}
          </Button>
        </Box>
      </Paper>

      {/* IPO Cards */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : (
        <>
          <Grid container spacing={3}>
            {ipos.map((ipo) => (
              <Grid item xs={12} md={6} lg={4} key={ipo.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      {ipo.logo && (
                        <img
                          src={ipo.logo}
                          alt={ipo.companyName}
                          style={{ width: 40, height: 40, marginRight: 12, borderRadius: 4 }}
                        />
                      )}
                      <Box>
                        <Typography variant="h6" component="div">
                          {ipo.companyName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {ipo.symbol}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Chip
                      label={getStatusText(ipo.status)}
                      color={getStatusColor(ipo.status)}
                      size="small"
                      sx={{ mb: 2 }}
                    />
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {ipo.description}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <MonetizationOnIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        ₺{ipo.priceMin.toLocaleString()} - ₺{ipo.priceMax.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                      <TrendingUpIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {t('admin.ipos.lotSize')}: {ipo.lotSize.toLocaleString()}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <ScheduleIcon fontSize="small" color="primary" />
                      <Typography variant="body2">
                        {new Date(ipo.startDate).toLocaleDateString('tr-TR')} - {new Date(ipo.endDate).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedIpo(ipo);
                        setDialogOpen(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(ipo)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedIpo(ipo);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
          
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

      {/* IPO Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('admin.ipos.ipoDetails')}
        </DialogTitle>
        <DialogContent>
          {selectedIpo && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {selectedIpo.logo && (
                    <img
                      src={selectedIpo.logo}
                      alt={selectedIpo.name}
                      style={{ width: 60, height: 60, marginRight: 16, borderRadius: 8 }}
                    />
                  )}
                  <Box>
                    <Typography variant="h5">{selectedIpo.name}</Typography>
                    <Typography variant="h6" color="text.secondary">{selectedIpo.symbol}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>{t('admin.ipos.generalInfo')}</Typography>
                <Typography><strong>{t('admin.ipos.exchange')}:</strong> {selectedIpo.exchange}</Typography>
                <Typography><strong>{t('common.status')}:</strong> {getStatusText(selectedIpo.status)}</Typography>
                <Typography><strong>{t('admin.ipos.priceRange')}:</strong> ₺{selectedIpo.priceMin.toLocaleString()} - ₺{selectedIpo.priceMax.toLocaleString()}</Typography>
                <Typography><strong>{t('admin.ipos.lotSize')}:</strong> {selectedIpo.lotSize.toLocaleString()}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>{t('admin.ipos.dateInfo')}</Typography>
                <Typography><strong>{t('admin.ipos.startDate')}:</strong> {new Date(selectedIpo.startDate).toLocaleDateString('tr-TR')}</Typography>
                <Typography><strong>{t('admin.ipos.endDate')}:</strong> {new Date(selectedIpo.endDate).toLocaleDateString('tr-TR')}</Typography>
                {selectedIpo.prospectusUrl && (
                  <Typography><strong>{t('admin.ipos.prospectus')}:</strong> <a href={selectedIpo.prospectusUrl} target="_blank" rel="noopener noreferrer">{t('common.view')}</a></Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>{t('common.description')}</Typography>
                <Typography>{selectedIpo.description}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>{t('common.close')}</Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedIpo ? t('admin.editIPO') : t('admin.addNewIPO')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('common.companyName')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('common.symbol')}
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label={t('common.description')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.sharePrice')}
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                helperText={t('admin.ipos.priceHelperText')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.totalShares')}
                type="number"
                value={formData.lotSize}
                onChange={(e) => setFormData({ ...formData, lotSize: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.ipos.startDate')}
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.ipos.endDate')}
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('common.status')}</InputLabel>
                <Select
                  value={formData.status}
                  label={t('common.status')}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <MenuItem value="upcoming">{t('common.upcoming')}</MenuItem>
                  <MenuItem value="ongoing">{t('common.active')}</MenuItem>
                  <MenuItem value="closed">{t('common.closed')}</MenuItem>
                  <MenuItem value="listed">{t('common.listed')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('admin.ipos.exchange')}</InputLabel>
                <Select
                  value={formData.exchange}
                  label={t('admin.ipos.exchange')}
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                >
                  <MenuItem value="BIST">{t('admin.ipos.exchanges.bist')}</MenuItem>
                  <MenuItem value="NASDAQ">{t('admin.ipos.exchanges.nasdaq')}</MenuItem>
                  <MenuItem value="NYSE">{t('admin.ipos.exchanges.nyse')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={selectedIpo ? handleUpdate : handleCreate}
          >
            {selectedIpo ? t('common.update') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.ipos.deleteIPO')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.ipos.deleteConfirmation', { name: selectedIpo?.name })}
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

export default IPOs;