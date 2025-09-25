import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Card,
  CardContent,
  Button,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Alert,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Search,
  Refresh,
  TrendingUp,
  TrendingDown,
  Star,
  StarBorder,
  ShowChart,
  AccountBalance,
  Assessment,
  BusinessCenter,
  Schedule
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

interface Favorite {
  id: number;
  userId: number;
  symbol: string;
  type: 'stock' | 'crypto' | 'forex';
  createdAt: string;
  updatedAt: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import {
  fetchStocks,
  fetchFavoriteStocks,
  addToFavorites,
  removeFromFavorites,
  setFilters,
  setPagination,
} from '../../store/slices/stockSlice';
import { fetchBalance, selectBalance, selectBalanceLoading } from '../../store/slices/balanceSlice';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Stocks: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const dispatch = useDispatch();
  const { stocks, loading, error, filters, pagination } = useSelector((state: RootState) => state.stocks);
  const total = pagination.total;
  const favoriteStocks = useSelector((state: RootState) => state.stocks.favorites);
  
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const balance = useSelector(selectBalance);
  const balanceLoading = useSelector(selectBalanceLoading);
  const [tabValue, setTabValue] = useState(0);
  const [activeStocks, setActiveStocks] = useState([]);
  const [favoriteStocksList, setFavoriteStocksList] = useState<Favorite[]>([]);
  const [myPortfolio, setMyPortfolio] = useState([]);



  useEffect(() => {
    dispatch(fetchStocks({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      exchange: filters.exchange,
      sector: filters.sector,
      status: 'active', // Sadece aktif hisse senetlerini getir
    }) as any);
    dispatch(fetchFavoriteStocks() as any);
    dispatch(fetchBalance() as any);
    fetchActiveStocks();
    fetchMyPortfolio();

    // Real-time data updates
    const interval = setInterval(() => {
      dispatch(fetchBalance() as any);
      fetchActiveStocks();
      fetchMyPortfolio();
      dispatch(fetchStocks({
        page: pagination.page,
        limit: pagination.limit,
        search: filters.search,
        exchange: filters.exchange,
        sector: filters.sector,
        status: 'active', // Sadece aktif hisse senetlerini getir
      }) as any);
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    setFavoriteStocksList(favoriteStocks);
  }, [favoriteStocks]);

  const handleSearch = () => {
    dispatch(setFilters({ ...filters, search: searchTerm }));
    dispatch(setPagination({ ...pagination, page: 1 }));
    // Arama sonuçlarında da sadece aktif hisse senetlerini göster
    dispatch(fetchStocks({
      page: 1,
      limit: pagination.limit,
      search: searchTerm,
      exchange: filters.exchange,
      sector: filters.sector,
      status: 'active',
    }) as any);
  };

  const handleRefresh = () => {
    dispatch(fetchStocks({
      page: pagination.page,
      limit: pagination.limit,
      search: filters.search,
      exchange: filters.exchange,
      sector: filters.sector,
      status: 'active', // Sadece aktif hisse senetlerini getir
    }) as any);
    dispatch(fetchBalance() as any);
    fetchActiveStocks();
    fetchMyPortfolio();
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const fetchActiveStocks = async () => {
    try {
      const response = await fetch('/api/stocks?status=active&limit=20');
      const data = await response.json();
      if (data.stocks) {
        setActiveStocks(data.stocks);
      }
    } catch (error) {
      console.error('Error fetching active stocks:', error);
    }
  };

  const fetchMyPortfolio = async () => {
    try {
      const response = await fetch('/api/user/portfolio');
      const data = await response.json();
      if (data.success) {
        setMyPortfolio(data.data);
      }
    } catch (error) {
      console.error('Error fetching portfolio:', error);
    }
  };

  const handleFavoriteToggle = (symbol: string) => {
    const isFavorite = favoriteStocks && favoriteStocks.some(stock => stock.symbol === symbol);
    if (isFavorite) {
      const favoriteStock = favoriteStocks.find(stock => stock.symbol === symbol);
      if (favoriteStock) {
        dispatch(removeFromFavorites(favoriteStock.id.toString()) as any);
      }
    } else {
      dispatch(addToFavorites({ symbol, type: 'stock' }) as any);
    }
  };

  const handleToggleFavorite = (stockId: string) => {
    const stock = favoriteStocksList.find(s => s.id === stockId);
    if (stock) {
      handleFavoriteToggle(stock.symbol);
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    dispatch(setPagination({ ...pagination, page: value }));
  };

  const formatPrice = (price: number) => {
    // Fiyat değeri geçerli değilse varsayılan değer göster
    if (price === undefined || price === null || isNaN(price)) {
      return '$0.00';
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    if (change === undefined || change === null || changePercent === undefined || changePercent === null) {
      return (
        <Typography variant="body2" color="text.secondary">
          -
        </Typography>
      );
    }
    const isPositive = change >= 0;
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {isPositive ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
        <Typography
          component="span"
          variant="body2"
          color={isPositive ? 'success.main' : 'error.main'}
        >
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </Typography>
      </Box>
    );
  };

  const columns: GridColDef[] = [
    {
      field: 'favorite',
      headerName: '',
      width: isMobile ? 50 : 60,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => {
        const isFavorite = favoriteStocks && favoriteStocks.some(stock => stock.symbol === params.row.symbol);
        return (
          <IconButton
            size="small"
            onClick={() => handleFavoriteToggle(params.row.symbol)}
          >
            {isFavorite ? <Star color="warning" /> : <StarBorder />}
          </IconButton>
        );
      },
    },
    {
      field: 'symbol',
      headerName: t('stocks.symbol'),
      width: isMobile ? 80 : 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant={isMobile ? "body2" : "subtitle2"} fontWeight="bold">
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: t('stocks.name'),
      width: isMobile ? 150 : 250,
      flex: isMobile ? 0 : 1,
      hideable: isSmallMobile,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant={isMobile ? "body2" : "body1"} noWrap>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'price',
      headerName: t('stocks.price'),
      width: isMobile ? 90 : 120,
      renderCell: (params: GridRenderCellParams) => (
        <Typography variant={isMobile ? "body2" : "subtitle2"} fontWeight="bold">
          {formatPrice(params.value)}
        </Typography>
      ),
    },
    {
      field: 'change',
      headerName: t('stocks.change'),
      width: isMobile ? 100 : 150,
      renderCell: (params: GridRenderCellParams) => 
        formatChange(params.value, params.row.changePercent),
    },
    {
      field: 'volume',
      headerName: t('stocks.volume'),
      width: isMobile ? 80 : 120,
      hideable: isSmallMobile,
      renderCell: (params: GridRenderCellParams) => {
        const volume = params.value;
        const formattedVolume = (volume === undefined || volume === null || isNaN(volume)) 
          ? '0' 
          : new Intl.NumberFormat('en-US', { notation: isMobile ? 'compact' : 'standard' }).format(volume);
        return (
          <Typography variant="body2">
            {formattedVolume}
          </Typography>
        );
      },
    },
    {
      field: 'exchange',
      headerName: t('stocks.exchange'),
      width: isMobile ? 70 : 100,
      hideable: isSmallMobile,
      renderCell: (params: GridRenderCellParams) => (
        <Chip label={params.value} size="small" variant="outlined" />
      ),
    },
  ];

  if (loading && (!stocks || stocks.length === 0)) {
    return <LoadingSpinner />;
  }

  return (
    <Container 
      maxWidth={isMobile ? false : "xl"} 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh',
        '& > *': {
          position: 'relative',
          zIndex: 1
        }
      }}>
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: isMobile ? 3 : 4,
        p: isMobile ? 2 : 3,
        background: 'rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: 3,
        border: '1px solid rgba(255, 255, 255, 0.2)',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1.5 : 0 }}>
          {isMobile && (
            <Avatar sx={{ 
              bgcolor: 'rgba(255, 255, 255, 0.2)', 
              width: 40, 
              height: 40 
            }}>
              <ShowChart />
            </Avatar>
          )}
          <Typography 
            variant={isMobile ? "h4" : "h3"} 
            component="h1" 
            sx={{ 
              fontWeight: 800,
              color: 'white',
              textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              letterSpacing: '-0.02em'
            }}
          >
            {t('stocks.title')}
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={loading}
          size={isMobile ? "small" : "medium"}
          sx={{
            bgcolor: 'rgba(255, 255, 255, 0.2)',
            color: 'white',
            fontWeight: 600,
            borderRadius: 2,
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            px: isMobile ? 2 : 3,
            fontSize: isMobile ? '0.875rem' : '1rem',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.3)',
              transform: 'translateY(-2px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            },
            '&:disabled': {
              bgcolor: 'rgba(255, 255, 255, 0.1)',
              color: 'rgba(255, 255, 255, 0.5)'
            }
          }}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {/* Balance Card */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: 2
          }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
                  <AccountBalance sx={{ fontSize: 28 }} />
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {t('balance.title')}
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {t('balance.total')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {balanceLoading ? '...' : `${balance.totalBalance.toFixed(2)} TL`}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {t('balance.reserved')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {balanceLoading ? '...' : `${balance.reservedAmount.toFixed(2)} TL`}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {t('balance.available')}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {balanceLoading ? '...' : `${balance.availableBalance.toFixed(2)} TL`}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t('stocks.totalStocks')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {stocks?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t('stocks.favorites')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {favoriteStocks?.length || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            height: '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t('stocks.activeMarkets')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                3
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider', 
        mb: 3,
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '12px 12px 0 0',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
      }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange} 
          aria-label="stock tabs"
          variant={isMobile ? "scrollable" : "standard"}
          scrollButtons={isMobile ? "auto" : false}
          allowScrollButtonsMobile={isMobile}
          sx={{
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab 
            icon={isMobile ? undefined : <ShowChart />} 
            label={t('stocks.activeStocks')} 
            sx={{ 
              minHeight: isMobile ? 48 : 64, 
              fontWeight: 600,
              fontSize: isMobile ? '0.875rem' : '1rem',
              minWidth: isMobile ? 'auto' : 160,
              px: isMobile ? 1 : 2
            }}
          />
          <Tab 
            icon={isMobile ? undefined : <Star />} 
            label={t('stocks.myFavorites')} 
            sx={{ 
              minHeight: isMobile ? 48 : 64, 
              fontWeight: 600,
              fontSize: isMobile ? '0.875rem' : '1rem',
              minWidth: isMobile ? 'auto' : 160,
              px: isMobile ? 1 : 2
            }}
          />
          <Tab 
            icon={isMobile ? undefined : <BusinessCenter />} 
            label={t('stocks.myPortfolio')} 
            sx={{ 
              minHeight: isMobile ? 48 : 64, 
              fontWeight: 600,
              fontSize: isMobile ? '0.875rem' : '1rem',
              minWidth: isMobile ? 'auto' : 160,
              px: isMobile ? 1 : 2
            }}
          />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Active Stocks Tab */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ 
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              border: '1px solid rgba(26, 35, 126, 0.08)',
              p: 3,
              mb: 3
            }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              mb: 3 
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 40, 
                height: 40 
              }}>
                <Search />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('stocks.searchAndFilters')}
              </Typography>
            </Box>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  placeholder={t('stocks.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                    endAdornment: !isMobile ? (
                      <InputAdornment position="end">
                        <Button 
                          onClick={handleSearch}
                          sx={{ borderRadius: 2 }}
                        >
                          {t('common.search')}
                        </Button>
                      </InputAdornment>
                    ) : undefined,
                  }}
                />
              </Grid>
              {isMobile && (
                <Grid item xs={12}>
                  <Button 
                    fullWidth
                    variant="contained"
                    onClick={handleSearch}
                    startIcon={<Search />}
                    sx={{ borderRadius: 2, mb: 1 }}
                  >
                    {t('common.search')}
                  </Button>
                </Grid>
              )}
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('stocks.exchange')}</InputLabel>
                  <Select
                    value={filters.exchange || ''}
                    label={t('stocks.exchange')}
                    onChange={(e) => dispatch(setFilters({ ...filters, exchange: e.target.value }))}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    <MenuItem value="BIST">BIST</MenuItem>
                    <MenuItem value="NYSE">NYSE</MenuItem>
                    <MenuItem value="NASDAQ">NASDAQ</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>{t('stocks.sector')}</InputLabel>
                  <Select
                    value={filters.sector || ''}
                    label={t('stocks.sector')}
                    onChange={(e) => dispatch(setFilters({ ...filters, sector: e.target.value }))}
                    sx={{ borderRadius: 2 }}
                  >
                    <MenuItem value="">{t('common.all')}</MenuItem>
                    <MenuItem value="Technology">Technology</MenuItem>
                    <MenuItem value="Finance">Finance</MenuItem>
                    <MenuItem value="Healthcare">Healthcare</MenuItem>
                    <MenuItem value="Energy">Energy</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Favorites */}
      {favoriteStocks && favoriteStocks.length > 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper elevation={1} sx={{ 
              background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              border: '1px solid rgba(26, 35, 126, 0.08)',
              p: 3,
              mb: 3
            }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 1.5, 
                mb: 3 
              }}>
                <Avatar sx={{ 
                  bgcolor: 'warning.main', 
                  width: 40, 
                  height: 40 
                }}>
                  <Star />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  {t('navigation.favorites')}
                </Typography>
              </Box>
              <Grid container spacing={2}>
                {(favoriteStocks || []).slice(0, isMobile ? 2 : 4).map((stock, index) => (
                  <Grid item xs={12} sm={6} md={isMobile ? 6 : 3} key={`favorite-${stock.symbol}-${index}`}>
                    <Card
                      elevation={2}
                      sx={{
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        borderRadius: 3,
                        background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
                        border: '1px solid rgba(26, 35, 126, 0.08)',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: '0 8px 25px rgba(26, 35, 126, 0.15)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      <CardContent sx={{ p: 2.5 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                          <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                            {stock.symbol}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleFavoriteToggle(stock.symbol);
                            }}
                            sx={{ 
                              color: 'warning.main',
                              '&:hover': {
                                bgcolor: 'warning.light',
                                color: 'warning.dark'
                              }
                            }}
                          >
                            <Star />
                          </IconButton>
                        </Box>
                        <Typography color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                          {stock.type.toUpperCase()}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                          <Typography variant="body2" color="text.secondary">
                            {t('common.addedToFavorites')}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Data Grid */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '1px solid rgba(26, 35, 126, 0.08)',
            borderRadius: 3,
            overflow: 'hidden'
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1.5, 
              p: 3,
              borderBottom: '1px solid rgba(26, 35, 126, 0.08)'
            }}>
              <Avatar sx={{ 
                bgcolor: 'primary.main', 
                width: 40, 
                height: 40 
              }}>
                <Assessment />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {t('stocks.stocksList')}
              </Typography>
            </Box>
            <Box sx={{ height: isMobile ? 400 : 600, width: '100%' }}>
              <DataGrid
                rows={stocks || []}
                columns={columns}
                loading={loading}
                pagination
                paginationMode="server"
                rowCount={total || 0}
                page={pagination.page - 1}
                pageSize={pagination.limit}
                onPageChange={(page) => dispatch(setPagination({ ...pagination, page: page + 1 }))}
                disableSelectionOnClick
                getRowId={(row) => `${row.symbol || row.id}-${row.updatedAt || Date.now()}`}
                density={isMobile ? 'compact' : 'standard'}
                sx={{
                  border: 'none',
                  '& .MuiDataGrid-cell': {
                    borderBottom: '1px solid rgba(26, 35, 126, 0.08)',
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    padding: isMobile ? '4px 8px' : '8px 16px',
                  },
                  '& .MuiDataGrid-columnHeaders': {
                    backgroundColor: 'rgba(26, 35, 126, 0.04)',
                    borderBottom: '2px solid rgba(26, 35, 126, 0.12)',
                    fontWeight: 600,
                    fontSize: isMobile ? '0.75rem' : '0.875rem',
                    minHeight: isMobile ? '40px !important' : '56px !important',
                  },
                  '& .MuiDataGrid-columnHeader': {
                    padding: isMobile ? '4px 8px' : '8px 16px',
                  },
                  '& .MuiDataGrid-row': {
                    minHeight: isMobile ? '40px !important' : '52px !important',
                    '&:hover': {
                      backgroundColor: 'rgba(26, 35, 126, 0.04)',
                    },
                  },
                  '& .MuiDataGrid-footerContainer': {
                    borderTop: '1px solid rgba(26, 35, 126, 0.08)',
                    backgroundColor: 'rgba(26, 35, 126, 0.02)',
                    minHeight: isMobile ? '40px' : '52px',
                  },
                  '& .MuiDataGrid-cell:focus': {
                    outline: 'none',
                  },
                  '& .MuiDataGrid-virtualScroller': {
                    overflowX: 'auto',
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Custom Pagination */}
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper elevation={1} sx={{ 
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '1px solid rgba(26, 35, 126, 0.08)',
            p: isMobile ? 2 : 3,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 3
          }}>
            <Pagination
              count={Math.ceil((total || 0) / pagination.limit)}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "medium" : "large"}
              showFirstButton={!isSmallMobile}
              showLastButton={!isSmallMobile}
              siblingCount={isMobile ? 0 : 1}
              boundaryCount={isMobile ? 1 : 2}
              sx={{
                '& .MuiPaginationItem-root': {
                  borderRadius: 2,
                  fontWeight: 600,
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  minWidth: isMobile ? '32px' : '40px',
                  height: isMobile ? '32px' : '40px',
                  '&:hover': {
                    backgroundColor: 'rgba(26, 35, 126, 0.08)',
                  },
                },
                '& .Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    backgroundColor: 'primary.dark',
                  },
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
      </TabPanel>

      {/* Favorites Tab */}
      <TabPanel value={tabValue} index={1}>
        <Grid container spacing={isMobile ? 2 : 3}>
          {!favoriteStocksList || favoriteStocksList.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ 
                p: isMobile ? 3 : 4, 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <Star sx={{ fontSize: isMobile ? 48 : 64, color: 'grey.400', mb: 2 }} />
                <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary">
                  {t('stocks.noFavorites')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('stocks.noFavoritesDesc')}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            favoriteStocksList?.map((stock: any) => (
              <Grid item xs={12} sm={6} md={4} key={stock.id}>
                <Card sx={{ 
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }
                }}>
                  <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      mb: isMobile ? 1.5 : 2,
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 1 : 0
                    }}>
                      <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
                        {stock.symbol}
                      </Typography>
                      <IconButton
                        onClick={() => handleToggleFavorite(stock.id)}
                        color="warning"
                        size={isMobile ? "small" : "medium"}
                      >
                        <Star />
                      </IconButton>
                    </Box>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isMobile ? 1.5 : 2,
                        textAlign: isMobile ? 'center' : 'left'
                      }}
                    >
                      {stock.type.toUpperCase()}
                    </Typography>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center',
                      flexDirection: 'column',
                      gap: 1
                    }}>
                      <Typography variant="body2" color="text.secondary">
                        {t('common.addedToFavorites')}
                      </Typography>
                      <Chip
                        label={stock.type}
                        color="primary"
                        size={isMobile ? "small" : "medium"}
                        icon={stock.changePercent >= 0 ? <TrendingUp /> : <TrendingDown />}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </TabPanel>

      {/* Portfolio Tab */}
      <TabPanel value={tabValue} index={2}>
        <Grid container spacing={isMobile ? 2 : 3}>
          {!myPortfolio || myPortfolio.length === 0 ? (
            <Grid item xs={12}>
              <Paper sx={{ 
                p: isMobile ? 3 : 4, 
                textAlign: 'center',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                borderRadius: 3,
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <BusinessCenter sx={{ fontSize: isMobile ? 48 : 64, color: 'grey.400', mb: 2 }} />
                <Typography variant={isMobile ? "h6" : "h5"} color="text.secondary">
                  {t('stocks.noPortfolio')}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {t('stocks.noPortfolioDesc')}
                </Typography>
              </Paper>
            </Grid>
          ) : (
            myPortfolio?.map((holding: any) => (
              <Grid item xs={12} sm={6} md={4} key={holding.id}>
                <Card sx={{ 
                  height: '100%',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: 3,
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)'
                  }
                }}>
                  <CardContent sx={{ p: isMobile ? 2 : 2.5 }}>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      sx={{ 
                        fontWeight: 600, 
                        mb: 1,
                        textAlign: isMobile ? 'center' : 'left'
                      }}
                    >
                      {holding.stock?.symbol}
                    </Typography>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: isMobile ? 1.5 : 2,
                        textAlign: isMobile ? 'center' : 'left'
                      }}
                    >
                      {holding.stock?.name}
                    </Typography>
                    <Box sx={{ 
                      mb: isMobile ? 1.5 : 2,
                      display: 'flex',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 0.5 : 1,
                      justifyContent: isMobile ? 'center' : 'flex-start'
                    }}>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ textAlign: isMobile ? 'center' : 'left' }}
                      >
                        {t('stocks.quantity')}: {holding.quantity}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ textAlign: isMobile ? 'center' : 'left' }}
                      >
                        {t('stocks.averagePrice')}: {holding.averagePrice?.toFixed(2)} TL
                      </Typography>
                    </Box>
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? 1 : 0
                    }}>
                      <Typography variant={isMobile ? "h6" : "h5"} sx={{ fontWeight: 600 }}>
                        {(holding.quantity * holding.stock?.currentPrice)?.toFixed(2)} TL
                      </Typography>
                      <Chip
                        label={`${holding.totalReturn > 0 ? '+' : ''}${holding.totalReturn?.toFixed(2)} TL`}
                        color={holding.totalReturn >= 0 ? 'success' : 'error'}
                        size={isMobile ? "small" : "medium"}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      </TabPanel>
    </Container>
  );
};

export default Stocks;