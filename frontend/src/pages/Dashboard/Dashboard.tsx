import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button,
  IconButton,
  Avatar,
  Divider,
  useTheme,
  useMediaQuery,
  Fab,
  SwipeableDrawer,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  Refresh,
  Visibility,
  ShowChart,
  AccountBalance,
  BusinessCenter,
  Star,
  StarBorder,
  Add,
  FilterList,
  TouchApp,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { RootState } from '../../store';
import { fetchStocks } from '../../store/slices/stockSlice';
import { fetchActiveIPOs } from '../../store/slices/ipoSlice';
import { selectBalance } from '../../store/slices/balanceSlice';

import LoadingSpinner from '../../components/UI/LoadingSpinner';
import NewsWidget from '../../components/Dashboard/NewsWidget';

const Dashboard: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { language } = useSelector((state: RootState) => state.ui);
  const { stocks, loading: stocksLoading, total: totalStocks } = useSelector((state: RootState) => state.stocks);
  const { activeIPOs, loading: iposLoading } = useSelector((state: RootState) => state.ipos);
  const balance = useSelector(selectBalance);

  const [activeStocksCount, setActiveStocksCount] = useState(0);
  const [topGainers, setTopGainers] = useState([]);
  const [topLosers, setTopLosers] = useState([]);
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);

  useEffect(() => {
    // Fetch initial data
    dispatch(fetchStocks({ status: 'active' }) as any);
    dispatch(fetchActiveIPOs() as any);
    
    // Fetch additional stock statistics
    fetchStockStatistics();

    // Real-time data updates
    const interval = setInterval(() => {
       dispatch(fetchStocks({ status: 'active' }) as any);
       dispatch(fetchActiveIPOs() as any);
       fetchStockStatistics();
     }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [dispatch]);

  const fetchStockStatistics = async () => {
    try {
      // Use mock data for now to avoid API errors
      setActiveStocksCount(150);
      
      // Mock top gainers
      setTopGainers([
        { symbol: 'AAPL', name: 'Apple Inc.', price: 175.50, change: 5.25, changePercent: 3.08 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', price: 380.25, change: 8.75, changePercent: 2.36 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2950.75, change: 45.50, changePercent: 1.57 }
      ]);
      
      // Mock top losers
      setTopLosers([
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 245.30, change: -12.45, changePercent: -4.83 },
        { symbol: 'NFLX', name: 'Netflix Inc.', price: 425.80, change: -15.20, changePercent: -3.45 },
        { symbol: 'META', name: 'Meta Platforms', price: 315.60, change: -8.90, changePercent: -2.74 }
      ]);
    } catch (error) {
      console.error('Stock statistics fetch error:', error);
    }
  };

  const handleRefresh = () => {
    dispatch(fetchStocks({ status: 'active' }) as any);
    dispatch(fetchActiveIPOs() as any);
    fetchStockStatistics();
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price);
  };

  const formatChange = (change: number, changePercent: number) => {
    // Handle undefined or null values
    if (change === undefined || change === null || changePercent === undefined || changePercent === null) {
      return (
        <Typography variant="body2" color="text.secondary">
          N/A
        </Typography>
      );
    }
    
    const isPositive = change >= 0;
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        {isPositive ? <TrendingUp color="success" /> : <TrendingDown color="error" />}
        <Typography
          variant="body2"
          color={isPositive ? 'success.main' : 'error.main'}
        >
          {isPositive ? '+' : ''}{change.toFixed(2)} ({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)
        </Typography>
      </Box>
    );
  };

  if (stocksLoading && iposLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Container 
      maxWidth={isMobile ? false : "xl"} 
      sx={{ 
        py: { xs: 1, md: 3 },
        px: { xs: 1, sm: 2, md: 3 },
        pb: { xs: 10, md: 3 }, // Extra padding for mobile bottom nav
      }}
    >
      {/* Welcome Header */}
      <Card sx={{ 
        mb: { xs: 2, md: 3 }, 
        background: isMobile 
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
        borderRadius: { xs: 3, md: 2 },
        boxShadow: isMobile 
          ? '0 8px 32px rgba(102, 126, 234, 0.3)'
          : undefined,
      }}>
        <Box sx={{
          position: 'absolute',
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.1)',
        }} />
        <CardContent sx={{ 
          position: 'relative', 
          zIndex: 1,
          p: { xs: 2, md: 3 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: { xs: 2, sm: 0 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: { xs: 1.5, md: 2 },
              width: { xs: '100%', sm: 'auto' },
              justifyContent: { xs: 'center', sm: 'flex-start' }
            }}>
              <Avatar sx={{ 
                bgcolor: 'rgba(255, 255, 255, 0.2)', 
                width: { xs: 45, md: 60 }, 
                height: { xs: 45, md: 60 },
                fontSize: { xs: '1.1rem', md: '1.5rem' },
                border: '2px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}>
                {user?.firstName?.charAt(0)}
              </Avatar>
              <Box sx={{ textAlign: { xs: 'center', sm: 'left' } }}>
                <Typography variant="h4" component="h1" sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '1.3rem', sm: '1.5rem', md: '2rem' },
                  lineHeight: 1.2
                }}>
                  {t('dashboard.welcome')}, {user?.firstName}!
                </Typography>
                <Typography variant="body1" sx={{ 
                  opacity: 0.9, 
                  mt: 0.5,
                  fontSize: { xs: '0.85rem', md: '1rem' }
                }}>
                  {new Date().toLocaleDateString(language === 'tr' ? 'tr-TR' : 'en-US', { 
                    weekday: isMobile ? 'short' : 'long', 
                    year: 'numeric', 
                    month: isMobile ? 'short' : 'long', 
                    day: 'numeric' 
                  })}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: 1,
              alignItems: 'center'
            }}>
              {isMobile && (
                <IconButton 
                  onClick={() => setQuickActionsOpen(true)}
                  sx={{ 
                    bgcolor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    width: 44,
                    height: 44,
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.3)',
                      transform: 'scale(1.05)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <TouchApp />
                </IconButton>
              )}
              <IconButton 
                onClick={handleRefresh}
                sx={{ 
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  width: 44,
                  height: 44,
                  '&:hover': {
                    bgcolor: 'rgba(255, 255, 255, 0.3)',
                    transform: 'scale(1.05)',
                  },
                  transition: 'all 0.2s ease'
                }}
              >
                <Refresh />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Grid container spacing={{ xs: 1.5, md: 3 }}>
        {/* Portfolio Summary */}
        <Grid size={12}>
          <Card sx={{ 
            background: isMobile 
              ? 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%)',
            border: '1px solid rgba(26, 35, 126, 0.08)',
            mb: { xs: 1.5, md: 2 },
            borderRadius: { xs: 3, md: 2 },
            boxShadow: isMobile 
              ? '0 4px 20px rgba(26, 35, 126, 0.08)'
              : undefined,
          }}>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: { xs: 2, md: 3 },
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1.5,
                  width: { xs: '100%', sm: 'auto' },
                  justifyContent: { xs: 'center', sm: 'flex-start' }
                }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: { xs: 36, md: 40 }, 
                    height: { xs: 36, md: 40 },
                    boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)'
                  }}>
                    <AccountBalance sx={{ fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                  </Avatar>
                  <Typography variant="h5" sx={{ 
                    fontWeight: 600,
                    fontSize: { xs: '1.2rem', md: '1.5rem' }
                  }}>
                    {t('portfolio.title')}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size={isMobile ? "medium" : "small"}
                  onClick={() => navigate('/portfolio')}
                  endIcon={<Visibility />}
                  sx={{ 
                    borderRadius: 3,
                    minHeight: { xs: 44, md: 'auto' },
                    px: { xs: 3, md: 2 },
                    fontSize: { xs: '0.9rem', md: '0.875rem' },
                    fontWeight: 600,
                    boxShadow: '0 4px 12px rgba(26, 35, 126, 0.2)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 6px 16px rgba(26, 35, 126, 0.3)',
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {t('common.view')}
                </Button>
              </Box>
              <Grid container spacing={{ xs: 1.5, md: 2 }}>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Box sx={{ 
                    p: { xs: 1.5, md: 2 }, 
                    bgcolor: 'rgba(26, 35, 126, 0.04)', 
                    borderRadius: { xs: 3, md: 2 },
                    textAlign: 'center',
                    border: '1px solid rgba(26, 35, 126, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: isMobile ? 'scale(1.02)' : 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(26, 35, 126, 0.12)',
                    }
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      display: 'block',
                      mb: 0.5
                    }}>
                      {t('portfolio.totalValue')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: 'primary.main',
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      lineHeight: 1.2
                    }}>
                      {formatPrice(balance.totalBalance)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Box sx={{ 
                    p: { xs: 1.5, md: 2 }, 
                    bgcolor: 'rgba(76, 175, 80, 0.04)', 
                    borderRadius: { xs: 3, md: 2 },
                    textAlign: 'center',
                    border: '1px solid rgba(76, 175, 80, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: isMobile ? 'scale(1.02)' : 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(76, 175, 80, 0.12)',
                    }
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      display: 'block',
                      mb: 0.5
                    }}>
                      {t('portfolio.profitLoss')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: 'success.main',
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      lineHeight: 1.2
                    }}>
                      +{formatPrice(237.50)}
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Box sx={{ 
                    p: { xs: 1.5, md: 2 }, 
                    bgcolor: 'rgba(255, 152, 0, 0.04)', 
                    borderRadius: { xs: 3, md: 2 },
                    textAlign: 'center',
                    border: '1px solid rgba(255, 152, 0, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: isMobile ? 'scale(1.02)' : 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(255, 152, 0, 0.12)',
                    }
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      display: 'block',
                      mb: 0.5
                    }}>
                      {t('portfolio.performance')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#ff9800',
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      lineHeight: 1.2
                    }}>
                      +1.43%
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 6, md: 3 }}>
                  <Box sx={{ 
                    p: { xs: 1.5, md: 2 }, 
                    bgcolor: 'rgba(156, 39, 176, 0.04)', 
                    borderRadius: { xs: 3, md: 2 },
                    textAlign: 'center',
                    border: '1px solid rgba(156, 39, 176, 0.08)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: isMobile ? 'scale(1.02)' : 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(156, 39, 176, 0.12)',
                    }
                  }}>
                    <Typography variant="caption" color="text.secondary" sx={{ 
                      fontWeight: 600,
                      fontSize: { xs: '0.7rem', md: '0.75rem' },
                      display: 'block',
                      mb: 0.5
                    }}>
                      {t('portfolio.stocks')}
                    </Typography>
                    <Typography variant="h6" sx={{ 
                      fontWeight: 700, 
                      color: '#9c27b0',
                      fontSize: { xs: '1rem', md: '1.25rem' },
                      lineHeight: 1.2
                    }}>
                      3
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Statistics Cards */}
        <Grid container spacing={{ xs: 1.5, md: 3 }} sx={{ mb: { xs: 2, md: 3 } }}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: { xs: '100px', md: '120px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: { xs: 3, md: 2 },
              boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: isMobile ? 'scale(1.02)' : 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(102, 126, 234, 0.4)',
              }
            }}>
              <CardContent sx={{ 
                textAlign: 'center',
                p: { xs: 2, md: 3 },
                '&:last-child': { pb: { xs: 2, md: 3 } }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: { xs: 0.5, md: 1 },
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}>
                  {t('dashboard.activeStocks')}
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}>
                  {activeStocksCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: { xs: '100px', md: '120px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: { xs: 3, md: 2 },
              boxShadow: '0 8px 32px rgba(240, 147, 251, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: isMobile ? 'scale(1.02)' : 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(240, 147, 251, 0.4)',
              }
            }}>
              <CardContent sx={{ 
                textAlign: 'center',
                p: { xs: 2, md: 3 },
                '&:last-child': { pb: { xs: 2, md: 3 } }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: { xs: 0.5, md: 1 },
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}>
                  {t('dashboard.activeIPOs')}
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}>
                  {activeIPOs.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              height: { xs: '100px', md: '120px' },
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: { xs: 3, md: 2 },
              boxShadow: '0 8px 32px rgba(79, 172, 254, 0.3)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: isMobile ? 'scale(1.02)' : 'translateY(-4px)',
                boxShadow: '0 12px 40px rgba(79, 172, 254, 0.4)',
              }
            }}>
              <CardContent sx={{ 
                textAlign: 'center',
                p: { xs: 2, md: 3 },
                '&:last-child': { pb: { xs: 2, md: 3 } }
              }}>
                <Typography variant="h6" sx={{ 
                  fontWeight: 600, 
                  mb: { xs: 0.5, md: 1 },
                  fontSize: { xs: '1rem', md: '1.25rem' }
                }}>
                  {t('dashboard.totalStocks')}
                </Typography>
                <Typography variant="h3" sx={{ 
                  fontWeight: 700,
                  fontSize: { xs: '2rem', md: '3rem' }
                }}>
                  {totalStocks || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Market Overview */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <Card sx={{ 
            height: 'fit-content',
            background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: '1px solid rgba(26, 35, 126, 0.08)',
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ 
                    bgcolor: 'primary.main', 
                    width: 40, 
                    height: 40 
                  }}>
                    <ShowChart />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {t('dashboard.topStocks')}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/stocks')}
                  endIcon={<Visibility />}
                  sx={{ borderRadius: 3 }}
                >
                  {t('common.view')}
                </Button>
              </Box>
              {stocksLoading ? (
                <LoadingSpinner fullScreen={false} />
              ) : (
                <Box sx={{ mt: 2 }}>
                  {(stocks || []).map((stock, index) => (
                    <Box key={`${stock.symbol}-${index}`}>
                      <Box sx={{ 
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(26, 35, 126, 0.02)',
                        mb: 1,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: 'rgba(26, 35, 126, 0.05)',
                          transform: 'translateY(-1px)',
                        }
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mb: 1
                        }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Avatar sx={{ 
                              bgcolor: 'secondary.main', 
                              width: 32, 
                              height: 32,
                              fontSize: '0.875rem'
                            }}>
                              {stock.symbol.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {stock.symbol}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {stock.name}
                              </Typography>
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              {formatPrice(stock.price)}
                            </Typography>
                            {formatChange(stock.change, stock.changePercent)}
                          </Box>
                        </Box>
                      </Box>
                      {index < (stocks || []).slice(0, 8).length - 1 && <Divider sx={{ my: 1 }} />}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Active IPOs */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <Card sx={{ 
            height: 'fit-content',
            background: 'linear-gradient(145deg, #ffffff 0%, #f0f8ff 100%)',
            border: '1px solid rgba(76, 175, 80, 0.12)',
          }}>
            <CardContent>
              <Box sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                mb: 3,
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 2, sm: 0 }
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ 
                    bgcolor: '#4caf50', 
                    width: 40, 
                    height: 40 
                  }}>
                    <BusinessCenter />
                  </Avatar>
                  <Typography variant="h5" sx={{ fontWeight: 600 }}>
                    {t('dashboard.activeIpos')}
                  </Typography>
                </Box>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => navigate('/ipos')}
                  endIcon={<Visibility />}
                  sx={{ 
                    borderRadius: 3,
                    bgcolor: '#4caf50',
                    '&:hover': {
                      bgcolor: '#45a049',
                    }
                  }}
                >
                  {t('common.view')}
                </Button>
              </Box>
              {iposLoading ? (
                <LoadingSpinner fullScreen={false} />
              ) : (activeIPOs || []).length > 0 ? (
                <Box sx={{ mt: 2 }}>
                  {(activeIPOs || []).slice(0, 3).map((ipo, index) => (
                    <Box key={ipo.id}>
                      <Box sx={{ 
                        p: 2.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(76, 175, 80, 0.04)',
                        mb: 2,
                        border: '1px solid rgba(76, 175, 80, 0.12)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          bgcolor: 'rgba(76, 175, 80, 0.08)',
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 20px rgba(76, 175, 80, 0.15)',
                        }
                      }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'flex-start',
                          mb: 2
                        }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                              {ipo.companyName}
                            </Typography>
                            <Chip
                              label={t('ipos.active')}
                              sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                fontWeight: 600,
                                fontSize: '0.75rem'
                              }}
                              size="small"
                            />
                          </Box>
                        </Box>
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                          gap: 1.5,
                          mt: 2
                        }}>
                          <Box sx={{ 
                            p: 1.5, 
                            bgcolor: 'rgba(255, 255, 255, 0.7)', 
                            borderRadius: 2,
                            border: '1px solid rgba(76, 175, 80, 0.1)'
                          }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {ipo.symbol} • {t('ipos.priceRange')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                              {formatPrice(parseFloat(ipo.priceMin))} - {formatPrice(parseFloat(ipo.priceMax))}
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            p: 1.5, 
                            bgcolor: 'rgba(255, 255, 255, 0.7)', 
                            borderRadius: 2,
                            border: '1px solid rgba(76, 175, 80, 0.1)'
                          }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              {t('ipos.endDate')}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: '#2e7d32' }}>
                              {new Date(ipo.endDate).toLocaleDateString('tr-TR')}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  {t('stocks.noData')}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* News Widget */}
        <Grid size={{ xs: 12, lg: 6 }}>
          <NewsWidget />
        </Grid>
      </Grid>

      {/* Mobile Quick Actions Drawer */}
      {isMobile && (
        <SwipeableDrawer
          anchor="bottom"
          open={quickActionsOpen}
          onClose={() => setQuickActionsOpen(false)}
          onOpen={() => setQuickActionsOpen(true)}
          PaperProps={{
            sx: {
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              maxHeight: '50vh',
            },
          }}
        >
          <Box sx={{ p: 3 }}>
            <Box sx={{ 
              width: 40, 
              height: 4, 
              bgcolor: 'rgba(255,255,255,0.3)', 
              borderRadius: 2, 
              mx: 'auto', 
              mb: 3 
            }} />
            
            <Typography variant="h6" sx={{ 
              fontWeight: 600, 
              mb: 3, 
              textAlign: 'center' 
            }}>
              Hızlı İşlemler
            </Typography>
            
            <Grid container spacing={2}>
              <Grid size={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    navigate('/deposit');
                    setQuickActionsOpen(false);
                  }}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: 3,
                    py: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  Para Yatır
                </Button>
              </Grid>
              <Grid size={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    navigate('/stocks');
                    setQuickActionsOpen(false);
                  }}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: 3,
                    py: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  Hisse Al
                </Button>
              </Grid>
              <Grid size={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    navigate('/portfolio');
                    setQuickActionsOpen(false);
                  }}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: 3,
                    py: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  Portföy
                </Button>
              </Grid>
              <Grid size={6}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => {
                    navigate('/support');
                    setQuickActionsOpen(false);
                  }}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: 'white',
                    borderRadius: 3,
                    py: 2,
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,0.3)',
                    },
                  }}
                >
                  Destek
                </Button>
              </Grid>
            </Grid>
          </Box>
        </SwipeableDrawer>
      )}
    </Container>
  );
};

export default Dashboard;