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
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  Avatar,
  useTheme,
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
  InputAdornment,
  Collapse,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  TrendingUp as TrendingUpIcon,
  ShowChart as ShowChartIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/adminAPI';

interface Stock {
  id: number;
  symbol: string;
  companyName: string;
  exchange: string;
  currentPrice: number;
  openPrice: number;
  highPrice: number;
  lowPrice: number;
  previousClose: number;
  volume: number;
  marketCap: number;
  sector: string;
  status: 'active' | 'suspended' | 'delisted';
  createdAt: string;
  updatedAt: string;
}

const Stocks: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const theme = useTheme();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    totalStocks: 0,
    activeStocks: 0,
    suspendedStocks: 0,
    delistedStocks: 0
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    sector: '',
    exchange: ''
  });
  
  // Dialog states
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [formData, setFormData] = useState({
    symbol: '',
    companyName: '',
    exchange: '',
    currentPrice: '',
    sector: '',
    status: 'active'
  });

  useEffect(() => {
    fetchStocks();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchStocks(1);
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [filters]);

  const fetchStocks = async (page = 1) => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: pagination.limit,
        ...filters
      };
      
      const response = await adminAPI.getStocks(params);
      
      const stocksData = response.data?.stocks || response.stocks || [];
      setStocks(stocksData);
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        page,
        total: response.data?.total || response.total || 0,
        totalPages: response.data?.totalPages || response.totalPages || 0
      }));
      
      // Calculate stats
      setStats({
        totalStocks: response.data?.total || response.total || 0,
        activeStocks: stocksData.filter((s: Stock) => s.status === 'active').length,
        suspendedStocks: stocksData.filter((s: Stock) => s.status === 'suspended').length,
        delistedStocks: stocksData.filter((s: Stock) => s.status === 'delisted').length
      });
    } catch (error: any) {
      setError('Hisse senetleri yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'delisted': return 'error';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return t('stocks.active');
      case 'suspended': return t('stocks.suspended');
      case 'delisted': return t('stocks.delisted');
      default: return status;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('tr-TR').format(num);
  };

  // Dialog handlers
  const openEditDialog = (stock?: Stock) => {
    if (stock) {
      setSelectedStock(stock);
      setFormData({
        symbol: stock.symbol,
        companyName: stock.companyName,
        exchange: stock.exchange,
        currentPrice: stock.currentPrice.toString(),
        sector: stock.sector,
        status: stock.status
      });
    } else {
      setSelectedStock(null);
      setFormData({
        symbol: '',
        companyName: '',
        exchange: '',
        currentPrice: '',
        sector: '',
        status: 'active'
      });
    }
    setEditDialogOpen(true);
  };

  const handleCreate = async () => {
    try {
      const stockData = {
        ...formData,
        currentPrice: parseFloat(formData.currentPrice)
      };
      await adminAPI.createStock(stockData);
      setEditDialogOpen(false);
      fetchStocks();
    } catch (error: any) {
      console.error('Failed to create stock:', error);
      setError('Hisse senedi oluşturulurken bir hata oluştu');
    }
  };

  const handleUpdate = async () => {
    if (!selectedStock) return;
    try {
      const stockData = {
        ...formData,
        currentPrice: parseFloat(formData.currentPrice)
      };
      await adminAPI.updateStock(selectedStock.id, stockData);
      setEditDialogOpen(false);
      fetchStocks();
    } catch (error: any) {
      console.error('Failed to update stock:', error);
      setError('Hisse senedi güncellenirken bir hata oluştu');
    }
  };

  const handleDelete = async () => {
    if (!selectedStock) return;
    try {
      await adminAPI.deleteStock(selectedStock.id);
      setDeleteDialogOpen(false);
      setSelectedStock(null);
      fetchStocks();
    } catch (error: any) {
      console.error('Failed to delete stock:', error);
      setError('Hisse senedi silinirken bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box display="flex" alignItems="center" gap={2}>
          <IconButton onClick={() => navigate('/admin')} color="primary">
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {t('admin.stocks.title')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openEditDialog()}
        >
          {t('admin.stocks.addStock')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" gap={2} alignItems="center" mb={2}>
          <TextField
            placeholder="Hisse senedi ara (sembol, şirket adı)"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ flexGrow: 1 }}
          />
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filtreler
          </Button>
        </Box>
        
        <Collapse in={showFilters}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Durum</InputLabel>
                <Select
                  value={filters.status}
                  label="Durum"
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="active">Aktif</MenuItem>
                  <MenuItem value="suspended">Askıya Alınan</MenuItem>
                  <MenuItem value="delisted">Listeden Çıkarılan</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Borsa</InputLabel>
                <Select
                  value={filters.exchange}
                  label="Borsa"
                  onChange={(e) => setFilters({ ...filters, exchange: e.target.value })}
                >
                  <MenuItem value="">Tümü</MenuItem>
                  <MenuItem value="BIST">BIST</MenuItem>
                  <MenuItem value="NASDAQ">NASDAQ</MenuItem>
                  <MenuItem value="NYSE">NYSE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                size="small"
                label="Sektör"
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
                placeholder="Sektör filtrele"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => setFilters({ search: '', status: '', sector: '', exchange: '' })}
              >
                Filtreleri Temizle
              </Button>
            </Grid>
          </Grid>
        </Collapse>
      </Paper>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                  <ShowChartIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Toplam Hisse
                  </Typography>
                  <Typography variant="h5">
                    {stats.totalStocks}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                  <TrendingUpIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Aktif Hisseler
                  </Typography>
                  <Typography variant="h5">
                    {stats.activeStocks}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.warning.main }}>
                  <ShowChartIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Askıya Alınan
                  </Typography>
                  <Typography variant="h5">
                    {stats.suspendedStocks}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                  <ShowChartIcon />
                </Avatar>
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Listeden Çıkarılan
                  </Typography>
                  <Typography variant="h5">
                    {stats.delistedStocks}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Stocks Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Sembol</TableCell>
                <TableCell>Şirket Adı</TableCell>
                <TableCell>Borsa</TableCell>
                <TableCell>Güncel Fiyat</TableCell>
                <TableCell>Hacim</TableCell>
                <TableCell>Piyasa Değeri</TableCell>
                <TableCell>Sektör</TableCell>
                <TableCell>Durum</TableCell>
                <TableCell>İşlemler</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {stocks.map((stock) => (
                <TableRow key={stock.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {stock.symbol}
                    </Typography>
                  </TableCell>
                  <TableCell>{stock.companyName}</TableCell>
                  <TableCell>
                    <Chip label={stock.exchange} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>{formatPrice(stock.currentPrice)}</TableCell>
                  <TableCell>{formatNumber(stock.volume)}</TableCell>
                  <TableCell>{formatNumber(stock.marketCap)}</TableCell>
                  <TableCell>{stock.sector || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={getStatusText(stock.status)}
                      color={getStatusColor(stock.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Box display="flex" gap={1}>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedStock(stock);
                          setDialogOpen(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openEditDialog(stock)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => {
                          setSelectedStock(stock);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination
              count={pagination.totalPages}
              page={pagination.page}
              onChange={(_, page) => fetchStocks(page)}
              color="primary"
              showFirstButton
              showLastButton
            />
          </Box>
        )}
      </Paper>
      
      {/* Results Info */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
        <Typography variant="body2" color="text.secondary">
          Toplam {pagination.total} hisse senedinden {stocks.length} tanesi gösteriliyor
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Sayfa {pagination.page} / {pagination.totalPages}
        </Typography>
      </Box>

      {/* Stock Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Hisse Senedi Detayları
        </DialogTitle>
        <DialogContent>
          {selectedStock && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box>
                    <Typography variant="h5">{selectedStock.companyName}</Typography>
                    <Typography variant="h6" color="text.secondary">{selectedStock.symbol}</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Genel Bilgiler</Typography>
                <Typography><strong>Borsa:</strong> {selectedStock.exchange}</Typography>
                <Typography><strong>Sektör:</strong> {selectedStock.sector}</Typography>
                <Typography><strong>Durum:</strong> {getStatusText(selectedStock.status)}</Typography>
                <Typography><strong>Güncel Fiyat:</strong> {formatPrice(selectedStock.currentPrice)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>Fiyat Bilgileri</Typography>
                <Typography><strong>Açılış:</strong> {formatPrice(selectedStock.openPrice)}</Typography>
                <Typography><strong>En Yüksek:</strong> {formatPrice(selectedStock.highPrice)}</Typography>
                <Typography><strong>En Düşük:</strong> {formatPrice(selectedStock.lowPrice)}</Typography>
                <Typography><strong>Önceki Kapanış:</strong> {formatPrice(selectedStock.previousClose)}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>İşlem Bilgileri</Typography>
                <Typography><strong>Hacim:</strong> {formatNumber(selectedStock.volume)}</Typography>
                <Typography><strong>Piyasa Değeri:</strong> {formatPrice(selectedStock.marketCap)}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      {/* Edit/Create Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedStock ? t('admin.editStock') : t('admin.addNewStock')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.symbol')}
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.companyName')}
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('admin.exchange')}</InputLabel>
                <Select
                  value={formData.exchange}
                  label={t('admin.exchange')}
                  onChange={(e) => setFormData({ ...formData, exchange: e.target.value })}
                >
                  <MenuItem value="BIST">BIST</MenuItem>
                  <MenuItem value="NASDAQ">NASDAQ</MenuItem>
                  <MenuItem value="NYSE">NYSE</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.currentPrice')}
                type="number"
                value={formData.currentPrice}
                onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.sector')}
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
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
                  <MenuItem value="active">{t('admin.active')}</MenuItem>
                  <MenuItem value="suspended">{t('admin.suspended')}</MenuItem>
                  <MenuItem value="delisted">{t('admin.delisted')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={selectedStock ? handleUpdate : handleCreate}
          >
            {selectedStock ? t('common.update') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.stocks.deleteTitle')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.stocks.deleteConfirmation', { name: selectedStock?.companyName, symbol: selectedStock?.symbol })}
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

export default Stocks;