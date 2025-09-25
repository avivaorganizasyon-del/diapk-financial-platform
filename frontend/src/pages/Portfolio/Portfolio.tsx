import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Avatar,
  Chip,
  Button,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Divider,
  Alert,
  useTheme,
  useMediaQuery,
  Fab,
  SwipeableDrawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ShowChart,
  Refresh,
  Visibility,
  PieChart,
  Timeline,
  MonetizationOn,
  Add,
  FilterList,
  TouchApp,
  SwapVert,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

interface PortfolioStock {
  id: number;
  symbol: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  totalCost: number;
  profitLoss: number;
  profitLossPercent: number;
  lastUpdate: string;
}

const Portfolio: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const { user } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(false);
  const [portfolioStocks, setPortfolioStocks] = useState<PortfolioStock[]>([]);
  const [portfolioSummary, setPortfolioSummary] = useState({
    totalValue: 0,
    totalCost: 0,
    totalProfitLoss: 0,
    totalProfitLossPercent: 0,
    stockCount: 0,
  });
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockPortfolioStocks: PortfolioStock[] = [
        {
          id: 1,
          symbol: 'AAPL',
          name: 'Apple Inc.',
          quantity: 50,
          averagePrice: 150.00,
          currentPrice: 175.50,
          totalValue: 8775.00,
          totalCost: 7500.00,
          profitLoss: 1275.00,
          profitLossPercent: 17.00,
          lastUpdate: '2024-01-15 16:00:00'
        },
        {
          id: 2,
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          quantity: 25,
          averagePrice: 2800.00,
          currentPrice: 2950.75,
          totalValue: 73768.75,
          totalCost: 70000.00,
          profitLoss: 3768.75,
          profitLossPercent: 5.38,
          lastUpdate: '2024-01-15 16:00:00'
        },
        {
          id: 3,
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          quantity: 30,
          averagePrice: 350.00,
          currentPrice: 380.25,
          totalValue: 11407.50,
          totalCost: 10500.00,
          profitLoss: 907.50,
          profitLossPercent: 8.64,
          lastUpdate: '2024-01-15 16:00:00'
        }
      ];

      setPortfolioStocks(mockPortfolioStocks);

      // Calculate portfolio summary
      const totalValue = mockPortfolioStocks.reduce((sum, stock) => sum + stock.totalValue, 0);
      const totalCost = mockPortfolioStocks.reduce((sum, stock) => sum + stock.totalCost, 0);
      const totalProfitLoss = totalValue - totalCost;
      const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

      setPortfolioSummary({
        totalValue,
        totalCost,
        totalProfitLoss,
        totalProfitLossPercent,
        stockCount: mockPortfolioStocks.length,
      });
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0;
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
        {isPositive ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
        <Typography
          component="span"
          variant="body2"
          color={isPositive ? 'success.main' : 'error.main'}
          sx={{ fontWeight: 600 }}
        >
          {isPositive ? '+' : ''}{formatPrice(change)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </Typography>
      </Box>
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container 
      maxWidth={isMobile ? false : "xl"} 
      sx={{ 
        py: { xs: 1, md: 3 },
        px: { xs: 1, sm: 2, md: 3 },
        background: isMobile ? 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)' : 'transparent',
        minHeight: isMobile ? '100vh' : 'auto',
        pb: isMobile ? 10 : { xs: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: isMobile ? 2 : 3,
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 },
        background: isMobile ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
        borderRadius: isMobile ? 4 : 0,
        p: isMobile ? 2 : 0,
        color: isMobile ? 'white' : 'inherit',
        boxShadow: isMobile ? '0 8px 32px rgba(102, 126, 234, 0.3)' : 'none',
      }}>
        <Box>
          {isMobile && (
            <Avatar sx={{
              bgcolor: 'rgba(255, 255, 255, 0.2)',
              mb: 1,
              mx: 'auto',
              width: 48,
              height: 48
            }}>
              <AccountBalance />
            </Avatar>
          )}
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            sx={{
              fontWeight: 700,
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            {t('portfolio.title', 'My Portfolio')}
          </Typography>
        </Box>
        <Button
          variant={isMobile ? "outlined" : "contained"}
          startIcon={<Refresh />}
          onClick={fetchPortfolioData}
          disabled={loading}
          sx={{
            minWidth: 120,
            ...(isMobile && {
              borderColor: 'rgba(255, 255, 255, 0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            })
          }}
        >
          {t('common.refresh', 'Refresh')}
        </Button>
        {isMobile && (
          <IconButton
            onClick={() => navigate('/dashboard')}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)'
              }
            }}
          >
            <Visibility />
          </IconButton>
        )}
      </Box>

      {/* Portfolio Summary Cards */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 3 : 4 }}>
        {/* Total Value Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: isMobile 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            borderRadius: isMobile ? 3 : 2,
            boxShadow: isMobile 
              ? '0 8px 32px rgba(102, 126, 234, 0.3)' 
              : '0 4px 20px rgba(102, 126, 234, 0.3)',
            transform: isMobile ? 'none' : 'translateY(0)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: isMobile ? 'scale(1.02)' : 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)'
            }
          }}>
            <Box sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <AccountBalance sx={{ fontSize: 24 }} />
            </Box>
            <CardContent sx={{
              position: 'relative',
              zIndex: 1,
              pb: isMobile ? 2 : '16px !important'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1
              }}>
                <Avatar sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48
                }}>
                  <MonetizationOn />
                </Avatar>
              </Box>
              <Typography 
                variant={isMobile ? "subtitle2" : "h6"} 
                sx={{
                  opacity: 0.9,
                  mb: 0.5,
                  fontSize: isMobile ? '0.875rem' : '1.25rem'
                }}
              >
                {t('portfolio.totalValue', 'Total Value')}
              </Typography>
              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                sx={{
                  fontWeight: 700,
                  fontSize: isMobile ? '1.25rem' : '2.125rem'
                }}
              >
                {formatPrice(portfolioSummary.totalValue)}
              </Typography>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                sx={{
                  opacity: 0.8,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {portfolioSummary.stockCount} {t('portfolio.stocks', 'stocks')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total P&L Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: portfolioSummary.totalProfitLoss >= 0 
              ? (isMobile 
                  ? 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)' 
                  : 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)')
              : (isMobile 
                  ? 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)' 
                  : 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)'),
            color: 'white',
            borderRadius: isMobile ? 3 : 2,
            boxShadow: isMobile 
              ? '0 8px 32px rgba(86, 171, 47, 0.3)' 
              : '0 4px 20px rgba(86, 171, 47, 0.3)',
            transform: isMobile ? 'none' : 'translateY(0)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: isMobile ? 'scale(1.02)' : 'translateY(-4px)',
              boxShadow: portfolioSummary.totalProfitLoss >= 0 
                ? '0 12px 40px rgba(86, 171, 47, 0.4)' 
                : '0 12px 40px rgba(255, 65, 108, 0.4)'
            }
          }}>
            <Box sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {portfolioSummary.totalProfitLoss >= 0 ? 
                <TrendingUp sx={{ fontSize: 24 }} /> : 
                <TrendingDown sx={{ fontSize: 24 }} />
              }
            </Box>
            <CardContent sx={{
              position: 'relative',
              zIndex: 1,
              pb: isMobile ? 2 : '16px !important'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1
              }}>
                <Avatar sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48
                }}>
                  {portfolioSummary.totalProfitLoss >= 0 ?
                    <TrendingUp /> : <TrendingDown />
                  }
                </Avatar>
              </Box>
              <Typography 
                variant={isMobile ? "subtitle2" : "h6"} 
                sx={{
                  opacity: 0.9,
                  mb: 0.5,
                  fontSize: isMobile ? '0.875rem' : '1.25rem'
                }}
              >
                {t('portfolio.totalProfitLoss', 'Total P&L')}
              </Typography>
              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                sx={{
                  fontWeight: 700,
                  fontSize: isMobile ? '1.25rem' : '2.125rem'
                }}
              >
                {formatPrice(portfolioSummary.totalProfitLoss)}
              </Typography>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                sx={{
                  opacity: 0.8,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {portfolioSummary.totalProfitLossPercent.toFixed(2)}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Total Cost Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: isMobile 
              ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' 
              : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            borderRadius: isMobile ? 3 : 2,
            boxShadow: isMobile 
              ? '0 8px 32px rgba(79, 172, 254, 0.3)' 
              : '0 4px 20px rgba(79, 172, 254, 0.3)',
            transform: isMobile ? 'none' : 'translateY(0)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: isMobile ? 'scale(1.02)' : 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)'
            }
          }}>
            <Box sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ShowChart sx={{ fontSize: 24 }} />
            </Box>
            <CardContent sx={{
              position: 'relative',
              zIndex: 1,
              pb: isMobile ? 2 : '16px !important'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1
              }}>
                <Avatar sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48
                }}>
                  <ShowChart />
                </Avatar>
              </Box>
              <Typography 
                variant={isMobile ? "subtitle2" : "h6"} 
                sx={{
                  opacity: 0.9,
                  mb: 0.5,
                  fontSize: isMobile ? '0.875rem' : '1.25rem'
                }}
              >
                {t('portfolio.totalCost', 'Total Cost')}
              </Typography>
              <Typography 
                variant={isMobile ? "h6" : "h4"} 
                sx={{
                  fontWeight: 700,
                  fontSize: isMobile ? '1.25rem' : '2.125rem'
                }}
              >
                {formatPrice(portfolioSummary.totalCost)}
              </Typography>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                sx={{
                  opacity: 0.8,
                  fontSize: isMobile ? '0.75rem' : '0.875rem'
                }}
              >
                {t('portfolio.invested', 'Invested')}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Portfolio Performance Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{
            background: isMobile 
              ? 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' 
              : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            color: '#333',
            borderRadius: isMobile ? 3 : 2,
            boxShadow: isMobile 
              ? '0 8px 32px rgba(168, 237, 234, 0.3)' 
              : '0 4px 20px rgba(168, 237, 234, 0.3)',
            transform: isMobile ? 'none' : 'translateY(0)',
            transition: 'all 0.3s ease',
            '&:hover': {
              transform: isMobile ? 'scale(1.02)' : 'translateY(-4px)',
              boxShadow: '0 12px 40px rgba(168, 237, 234, 0.4)'
            }
          }}>
            <Box sx={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 60,
              height: 60,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Timeline sx={{ fontSize: 24, color: '#333' }} />
            </Box>
            <CardContent sx={{
              position: 'relative',
              zIndex: 1,
              pb: isMobile ? 2 : '16px !important'
            }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1
              }}>
                <Avatar sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  width: isMobile ? 40 : 48,
                  height: isMobile ? 40 : 48
                }}>
                  <PieChart sx={{ color: '#333' }} />
                </Avatar>
              </Box>
              <Typography 
                variant={isMobile ? "h6" : "h5"} 
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  fontSize: isMobile ? '1.125rem' : '1.5rem'
                }}
              >
                {t('portfolio.performance', 'Performance')}
              </Typography>
              <Button
                variant="contained"
                size={isMobile ? "small" : "medium"}
                startIcon={<Visibility />}
                onClick={() => navigate('/analytics')}
                sx={{
                  bgcolor: '#333',
                  color: 'white',
                  '&:hover': {
                    bgcolor: '#555'
                  }
                }}
              >
                {t('common.viewDetails', 'View Details')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Holdings Table/Cards */}
      <Card sx={{
        borderRadius: isMobile ? 3 : 2,
        boxShadow: isMobile 
          ? '0 8px 32px rgba(0, 0, 0, 0.1)' 
          : '0 4px 20px rgba(0, 0, 0, 0.1)',
        overflow: 'hidden'
      }}>
        <Box sx={{
          p: isMobile ? 2 : 3,
          background: isMobile 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
            : 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          color: isMobile ? 'white' : '#333'
        }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <Avatar sx={{
              bgcolor: isMobile ? 'rgba(255, 255, 255, 0.2)' : '#667eea',
              width: isMobile ? 40 : 48,
              height: isMobile ? 40 : 48
            }}>
              <AccountBalance sx={{ color: isMobile ? 'white' : 'white' }} />
            </Avatar>
            <Typography 
              variant={isMobile ? "h6" : "h5"} 
              sx={{
                fontWeight: 700,
                flex: 1,
                ml: 2
              }}
            >
              {t('portfolio.holdings', 'My Holdings')}
            </Typography>
          </Box>
        </Box>

        <CardContent sx={{ p: isMobile ? 1 : 3 }}>
          {portfolioStocks.length > 0 ? (
            isMobile ? (
              // Mobile Card View
              portfolioStocks.map((stock) => {
                const allocation = (stock.totalValue / portfolioSummary.totalValue) * 100;
                return (
                  <Card key={stock.id} sx={{
                    mb: 2,
                    borderRadius: 3,
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                    border: '1px solid rgba(0, 0, 0, 0.05)',
                    overflow: 'hidden',
                    background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)'
                    }
                  }}>
                    <CardContent sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Avatar sx={{
                          bgcolor: stock.profitLoss >= 0 ? '#4caf50' : '#f44336',
                          width: 40,
                          height: 40,
                          mr: 2,
                          fontSize: '0.875rem',
                          fontWeight: 700
                        }}>
                          {stock.symbol.substring(0, 2)}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {stock.symbol}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {stock.name}
                          </Typography>
                        </Box>
                      </Box>

                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('portfolio.quantity', 'Quantity')}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {stock.quantity}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('portfolio.currentPrice', 'Current Price')}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatPrice(stock.currentPrice)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('portfolio.totalValue', 'Total Value')}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatPrice(stock.totalValue)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            {t('portfolio.profitLoss', 'P&L')}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {formatChange(stock.profitLoss, stock.profitLossPercent)}
                          </Typography>
                        </Grid>
                      </Grid>

                      <Box sx={{ mt: 2 }}>
                        <Typography variant="caption" color="text.secondary">
                          {t('portfolio.allocation', 'Allocation')}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={allocation}
                          sx={{
                            mt: 0.5,
                            height: 6,
                            borderRadius: 3,
                            '& .MuiLinearProgress-bar': {
                              borderRadius: 3,
                              backgroundColor: stock.profitLoss >= 0 ? '#4caf50' : '#f44336'
                            }
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {allocation.toFixed(1)}%
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              // Desktop Table View
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>{t('portfolio.stock', 'Stock')}</TableCell>
                      <TableCell align="right">{t('portfolio.quantity', 'Quantity')}</TableCell>
                      <TableCell align="right">{t('portfolio.avgPrice', 'Avg Price')}</TableCell>
                      <TableCell align="right">{t('portfolio.currentPrice', 'Current Price')}</TableCell>
                      <TableCell align="right">{t('portfolio.totalValue', 'Total Value')}</TableCell>
                      <TableCell align="right">{t('portfolio.profitLoss', 'P&L')}</TableCell>
                      <TableCell align="right">{t('portfolio.allocation', 'Allocation')}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {portfolioStocks.map((stock) => {
                      const allocation = (stock.totalValue / portfolioSummary.totalValue) * 100;
                      return (
                        <TableRow key={stock.id} hover>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{
                                bgcolor: stock.profitLoss >= 0 ? '#4caf50' : '#f44336',
                                width: 32,
                                height: 32,
                                mr: 2,
                                fontSize: '0.75rem'
                              }}>
                                {stock.symbol.substring(0, 2)}
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                  {stock.symbol}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {stock.name}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {stock.quantity}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2">
                              {formatPrice(stock.averagePrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatPrice(stock.currentPrice)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {formatPrice(stock.totalValue)}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            {formatChange(stock.profitLoss, stock.profitLossPercent)}
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <LinearProgress
                                variant="determinate"
                                value={allocation}
                                sx={{
                                  width: 60,
                                  height: 6,
                                  borderRadius: 3,
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 3,
                                    backgroundColor: stock.profitLoss >= 0 ? '#4caf50' : '#f44336'
                                  }
                                }}
                              />
                              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                                {allocation.toFixed(1)}%
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )
          ) : (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              <Typography variant="body2">
                {t('portfolio.noHoldings', 'No holdings found. Start investing to see your portfolio here.')}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mobile Quick Actions */}
      {isMobile && (
        <>
          <Fab
            color="primary"
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)',
                transform: 'scale(1.1)'
              }
            }}
            onClick={() => setQuickActionsOpen(true)}
          >
            <TouchApp />
          </Fab>

          <SwipeableDrawer
            anchor="bottom"
            open={quickActionsOpen}
            onClose={() => setQuickActionsOpen(false)}
            onOpen={() => setQuickActionsOpen(true)}
            sx={{
              '& .MuiDrawer-paper': {
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
              }
            }}
          >
            <Box sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, textAlign: 'center', fontWeight: 600 }}>
                {t('portfolio.quickActions', 'Quick Actions')}
              </Typography>
              <List>
                <ListItem>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Add />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #4a9b28 0%, #96d9b8 100%)'
                      }
                    }}
                    onClick={() => {
                      setQuickActionsOpen(false);
                      navigate('/stocks');
                    }}
                  >
                    {t('portfolio.buyStocks', 'Buy Stocks')}
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<SwapVert />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%)'
                      }
                    }}
                    onClick={() => {
                      setQuickActionsOpen(false);
                      navigate('/trade');
                    }}
                  >
                    {t('portfolio.trade', 'Trade')}
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Timeline />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%)'
                      }
                    }}
                    onClick={() => {
                      setQuickActionsOpen(false);
                      navigate('/analytics');
                    }}
                  >
                    {t('portfolio.analytics', 'Analytics')}
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<FilterList />}
                    sx={{
                      py: 1.5,
                      borderRadius: 3,
                      background: 'linear-gradient(135deg, #ff416c 0%, #ff4b2b 100%)',
                      '&:hover': {
                        background: 'linear-gradient(135deg, #e63946 0%, #f77f00 100%)'
                      }
                    }}
                    onClick={() => {
                      setQuickActionsOpen(false);
                      navigate('/watchlist');
                    }}
                  >
                    {t('portfolio.watchlist', 'Watchlist')}
                  </Button>
                </ListItem>
              </List>
            </Box>
          </SwipeableDrawer>
        </>
      )}
    </Container>
  );
};

export default Portfolio;