import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Chip,
  Grid,
  Tabs,
  Tab,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  BusinessCenter,
  Refresh,
  CheckCircle,
  Schedule,
  Cancel,
  TrendingUp,
  TrendingDown,
  Remove,
  AccountBalance
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import {
  fetchIPOs,
  fetchActiveIPOs,
  fetchUpcomingIPOs,
  fetchMySubscriptions,
  subscribeToIPO,
  cancelSubscription,
  setFilters,
} from '../../store/slices/ipoSlice';
import { fetchBalance, selectBalance, selectBalanceLoading } from '../../store/slices/balanceSlice';
import { userAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

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

const IPOs: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { 
    activeIPOs, 
    upcomingIPOs, 
    mySubscriptions, 
    loading, 
    error 
  } = useSelector((state: RootState) => state.ipos);

  // Güvenli erişim için fallback değerleri
  const safeActiveIPOs = activeIPOs || [];
  const safeUpcomingIPOs = upcomingIPOs || [];
  const safeMySubscriptions = mySubscriptions || [];

  const [tabValue, setTabValue] = useState(0);
  const [subscribeDialog, setSubscribeDialog] = useState({ open: false, ipo: null });
  const [subscriptionData, setSubscriptionData] = useState({
    quantity: '',
    pricePerShare: ''
  });
  const [cancelRequestDialog, setCancelRequestDialog] = useState({ open: false, subscription: null });
  const [cancelRequestMessage, setCancelRequestMessage] = useState('');
  const balance = useSelector(selectBalance);
  const balanceLoading = useSelector(selectBalanceLoading);

  useEffect(() => {
    dispatch(fetchActiveIPOs() as any);
    dispatch(fetchUpcomingIPOs() as any);
    dispatch(fetchMySubscriptions() as any);
    dispatch(fetchBalance() as any);
  }, [dispatch]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    dispatch(fetchActiveIPOs() as any);
    dispatch(fetchUpcomingIPOs() as any);
    dispatch(fetchMySubscriptions() as any);
    dispatch(fetchBalance() as any);
  };

  const handleSubscribeClick = (ipo: any) => {
    setSubscribeDialog({ open: true, ipo });
    // Otomatik olarak minimum fiyatı ata
    setSubscriptionData({ 
      quantity: '', 
      pricePerShare: ipo.priceMin ? ipo.priceMin.toString() : '' 
    });
  };

  const handleSubscribeSubmit = async () => {
    if (subscribeDialog.ipo && subscriptionData.quantity) {
      // Otomatik olarak minimum fiyatı kullan
      const pricePerShare = subscribeDialog.ipo.priceMin || parseFloat(subscriptionData.pricePerShare);
      const quantity = parseInt(subscriptionData.quantity);
      const lotSize = subscribeDialog.ipo.lotSize || 1;
      
      // Lot büyüklüğü kontrolü
      if (quantity % lotSize !== 0) {
        alert(t('ipos.lotSizeError', { lotSize }));
        return;
      }
      
      const totalAmount = quantity * pricePerShare;
      
      // Bakiye kontrolü
      if (totalAmount > balance.availableBalance) {
        alert(t('ipos.insufficientBalanceError', { available: balance.availableBalance.toFixed(2), required: totalAmount.toFixed(2) }));
        return;
      }
      
      const subscriptionPayload = {
        ipoId: subscribeDialog.ipo.id,
        quantity,
        pricePerShare
      };
      
      try {
        await dispatch(subscribeToIPO(subscriptionPayload) as any);
        // Subscription başarılı olduktan sonra abonelikleri ve bakiyeyi yeniden yükle
        dispatch(fetchMySubscriptions() as any);
        dispatch(fetchBalance() as any);
        setSubscribeDialog({ open: false, ipo: null });
        setSubscriptionData({ quantity: '', pricePerShare: '' });
      } catch (error) {
        console.error('Subscription failed:', error);
      }
    }
  };

  const handleRequestCancellation = (subscription: any) => {
    setCancelRequestDialog({ open: true, subscription });
    setCancelRequestMessage('');
  };

  const handleSubmitCancelRequest = async () => {
    if (!cancelRequestMessage.trim()) {
      alert(t('ipos.cancelReasonRequired'));
      return;
    }

    try {
      // Burada yöneticiye iptal talebi gönderilecek
      // Şimdilik sadece kullanıcıya bilgi veriyoruz
      alert(t('ipos.cancelRequestSent', { message: cancelRequestMessage }));
      
      setCancelRequestDialog({ open: false, subscription: null });
      setCancelRequestMessage('');
    } catch (error) {
      console.error('Cancel request failed:', error);
      alert(t('ipos.cancelRequestError'));
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'upcoming': return 'warning';
      case 'closed': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle />;
      case 'upcoming': return <Schedule />;
      case 'closed': return <Cancel />;
      default: return <Remove />;
    }
  };

  const renderIPOCard = (ipo: any, showSubscribeButton = false) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={ipo.id}>
      <Card 
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          background: isMobile ? 'rgba(255,255,255,0.95)' : 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          border: isMobile ? 'none' : '1px solid rgba(26, 35, 126, 0.08)',
          borderRadius: isMobile ? 3 : 2,
          boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.15)' : 1,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: isMobile ? 'none' : 'translateY(-2px)',
            boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.2)' : '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
      >
        <CardContent sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: isMobile ? 1.5 : 2,
            flexDirection: isMobile ? 'column' : 'row',
            textAlign: isMobile ? 'center' : 'left'
          }}>
            <Avatar sx={{ 
              bgcolor: 'primary.main', 
              mr: isMobile ? 0 : 2, 
              mb: isMobile ? 1 : 0,
              width: isMobile ? 40 : 48, 
              height: isMobile ? 40 : 48,
              fontSize: isMobile ? '1rem' : '1.2rem',
              fontWeight: 600
            }}>
              {ipo.companyName.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1, width: '100%' }}>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ 
                  fontWeight: 600, 
                  mb: 0.5,
                  color: 'text.primary'
                }}
              >
                {ipo.companyName}
              </Typography>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                color="text.secondary"
              >
                {ipo.symbol}
              </Typography>
            </Box>
            <Chip
              icon={getStatusIcon(ipo.status)}
              label={t(`ipos.${ipo.status}`)}
              color={getStatusColor(ipo.status) as any}
              size={isMobile ? "small" : "small"}
              sx={{
                fontWeight: 500,
                mt: isMobile ? 1 : 0,
                '& .MuiChip-icon': {
                  fontSize: isMobile ? '0.875rem' : '1rem'
                }
              }}
            />
          </Box>

          <Box sx={{ mb: isMobile ? 2 : 3 }}>
             <Grid container spacing={isMobile ? 1.5 : 2}>
               <Grid item xs={6}>
                <Box>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: isMobile ? '0.65rem' : '0.75rem'
                    }}
                  >
                    {t('ipos.priceRange')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}
                  >
                    {formatPrice(parseFloat(ipo.priceMin))} - {formatPrice(parseFloat(ipo.priceMax))}
                  </Typography>
                </Box>
              </Grid>
               <Grid item xs={6}>
                <Box>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: isMobile ? '0.65rem' : '0.75rem'
                    }}
                  >
                    {t('ipos.totalShares')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: isMobile ? '0.75rem' : '0.875rem'
                    }}
                  >
                    {new Intl.NumberFormat('tr-TR', { notation: 'compact' }).format(ipo.totalShares)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ 
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 0.5
            }}>
              {t('ipos.startDate')} - {t('ipos.endDate')}
            </Typography>
            <Typography variant="body2" sx={{ 
              fontWeight: 600,
              color: 'text.primary'
            }}>
              {formatDate(ipo.startDate)} - {formatDate(ipo.endDate)}
            </Typography>
          </Box>

          {ipo.listingDate && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="caption" color="text.secondary" sx={{ 
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: 0.5
              }}>
                {t('ipos.listingDate')}
              </Typography>
              <Typography variant="body2" sx={{ 
                fontWeight: 600,
                color: 'text.primary'
              }}>
                {formatDate(ipo.listingDate)}
              </Typography>
            </Box>
          )}

          {showSubscribeButton && (
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleSubscribeClick(ipo)}
              sx={{
                mt: isMobile ? 1.5 : 2,
                py: isMobile ? 1 : 1.5,
                fontSize: isMobile ? '0.8rem' : '0.95rem',
                fontWeight: 600,
                borderRadius: isMobile ? 1.5 : 2,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                  transform: isMobile ? 'none' : 'translateY(-1px)'
                }
              }}
            >
              {t('ipos.subscribe')}
            </Button>
          )}
        </CardContent>
      </Card>
    </Grid>
  );

  const renderSubscriptionCard = (subscription: any) => (
    <Grid item xs={12} sm={6} md={4} lg={3} key={subscription.id}>
      <Card 
        sx={{
          height: '100%',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          border: '1px solid rgba(26, 35, 126, 0.08)',
          borderRadius: 2,
          transition: 'all 0.2s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
          }
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar sx={{ 
              bgcolor: 'success.main', 
              mr: 2, 
              width: 48, 
              height: 48,
              fontSize: '1.2rem',
              fontWeight: 600
            }}>
              {subscription.ipo?.companyName?.charAt(0)}
            </Avatar>
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" sx={{ 
                fontWeight: 600, 
                mb: 0.5,
                color: 'text.primary'
              }}>
                {subscription.ipo?.companyName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subscription.ipo?.symbol}
              </Typography>
              <Chip
                label={t('ipos.subscribed')}
                color="success"
                size="small"
                sx={{
                  mt: 1,
                  fontWeight: 500
                }}
              />
            </Box>
          </Box>

          <Box sx={{ mb: isMobile ? 2 : 3 }}>
             <Grid container spacing={isMobile ? 1 : 2}>
               <Grid item xs={4}>
                <Box>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: isMobile ? '0.6rem' : '0.75rem'
                    }}
                  >
                    {t('ipos.quantity')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ 
                      fontWeight: 600,
                      color: 'text.primary',
                      fontSize: isMobile ? '0.7rem' : '0.875rem'
                    }}
                  >
                    {new Intl.NumberFormat('tr-TR').format(subscription.quantity)}
                  </Typography>
                </Box>
              </Grid>
               <Grid item xs={4}>
                <Box>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: isMobile ? '0.6rem' : '0.75rem'
                    }}
                  >
                    {t('ipos.pricePerShare')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ 
                      fontWeight: 600,
                      color: 'primary.main',
                      fontSize: isMobile ? '0.7rem' : '0.875rem'
                    }}
                  >
                    {formatPrice(subscription.pricePerShare)}
                  </Typography>
                </Box>
              </Grid>
               <Grid item xs={4}>
                <Box>
                  <Typography 
                    variant="caption" 
                    color="text.secondary" 
                    sx={{ 
                      fontWeight: 500,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: isMobile ? '0.6rem' : '0.75rem'
                    }}
                  >
                    {t('ipos.totalAmount')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    sx={{ 
                      fontWeight: 600,
                      color: 'success.main',
                      fontSize: isMobile ? '0.7rem' : '0.875rem'
                    }}
                  >
                    {formatPrice(subscription.quantity * subscription.pricePerShare)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Button
            variant="outlined"
            color="warning"
            fullWidth
            onClick={() => handleRequestCancellation(subscription)}
            sx={{
              py: isMobile ? 1 : 1.2,
              fontWeight: 600,
              fontSize: isMobile ? '0.75rem' : '0.9rem',
              borderRadius: isMobile ? 1.5 : 2,
              borderColor: 'warning.main',
              color: 'warning.main',
              '&:hover': {
                backgroundColor: 'warning.main',
                color: 'white',
                transform: isMobile ? 'none' : 'translateY(-1px)'
              }
            }}
          >
            {t('ipos.requestCancellation')}
          </Button>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <Container 
      maxWidth={isMobile ? false : "xl"} 
      sx={{ 
        py: isMobile ? 2 : 4,
        px: isMobile ? 1 : 3,
        background: isMobile ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent'
      }}
    >
      {/* Header */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: isMobile ? 3 : 4,
        mx: isMobile ? -1 : 0,
        p: isMobile ? 2 : 0,
        background: isMobile ? 'rgba(255,255,255,0.1)' : 'transparent',
        backdropFilter: isMobile ? 'blur(10px)' : 'none',
        borderRadius: isMobile ? 2 : 0,
        boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.1)' : 'none',
        flexDirection: { xs: 'column', sm: 'row' },
        gap: { xs: 2, sm: 0 }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isMobile && (
            <Avatar sx={{ 
              bgcolor: 'rgba(255,255,255,0.2)', 
              width: 40, 
              height: 40,
              color: 'white'
            }}>
              <BusinessCenter />
            </Avatar>
          )}
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            sx={{ 
              fontWeight: 600,
              color: isMobile ? 'white' : 'text.primary'
            }}
          >
            {t('ipos.title')}
          </Typography>
        </Box>
        <Button
          startIcon={<Refresh />}
          onClick={handleRefresh}
          size={isMobile ? "small" : "medium"}
          sx={{ 
            borderRadius: 3,
            px: isMobile ? 2 : 3,
            py: isMobile ? 1 : 1.5,
            fontSize: isMobile ? '0.8rem' : '0.875rem',
            color: isMobile ? 'white' : 'primary.main',
            borderColor: isMobile ? 'rgba(255,255,255,0.3)' : 'primary.main',
            '&:hover': {
              borderColor: isMobile ? 'rgba(255,255,255,0.5)' : 'primary.dark',
              backgroundColor: isMobile ? 'rgba(255,255,255,0.1)' : 'primary.light'
            }
          }}
        >
          {t('common.refresh')}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Balance Card */}
      <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 3 }}>
        <Grid item xs={12}>
          <Card sx={{
            background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
            color: 'white',
            borderRadius: isMobile ? 3 : 2,
            boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.15)' : 3
          }}>
            <CardContent sx={{ p: isMobile ? 2 : 3 }}>
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: isMobile ? 1.5 : 2,
                flexDirection: isMobile ? 'column' : 'row',
                textAlign: isMobile ? 'center' : 'left'
              }}>
                <Avatar sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  width: isMobile ? 48 : 56, 
                  height: isMobile ? 48 : 56 
                }}>
                  <AccountBalance sx={{ fontSize: isMobile ? 24 : 28 }} />
                </Avatar>
                <Box sx={{ flex: 1, width: '100%' }}>
                  <Typography 
                    variant={isMobile ? "body1" : "h6"} 
                    sx={{ 
                      fontWeight: 600, 
                      mb: isMobile ? 1.5 : 1 
                    }}
                  >
                    {t('balance.title')}
                  </Typography>
                  <Grid container spacing={isMobile ? 2 : 3}>
                    <Grid item xs={12} sm={4}>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        sx={{ opacity: 0.9 }}
                      >
                        {t('balance.total')}
                      </Typography>
                      <Typography 
                        variant={isMobile ? "body1" : "h6"} 
                        sx={{ fontWeight: 700 }}
                      >
                        {balanceLoading ? '...' : `${balance.totalBalance.toFixed(2)} TL`}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        sx={{ opacity: 0.9 }}
                      >
                        {t('balance.reserved')}
                      </Typography>
                      <Typography 
                        variant={isMobile ? "body1" : "h6"} 
                        sx={{ fontWeight: 700 }}
                      >
                        {balanceLoading ? '...' : `${balance.reservedAmount.toFixed(2)} TL`}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography 
                        variant={isMobile ? "caption" : "body2"} 
                        sx={{ opacity: 0.9 }}
                      >
                        {t('balance.available')}
                      </Typography>
                      <Typography 
                        variant={isMobile ? "body1" : "h6"} 
                        sx={{ fontWeight: 700 }}
                      >
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

      {/* Summary Cards - Portfolio Style */}
       <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 3 : 4 }}>
         <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            height: isMobile ? '100px' : '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: isMobile ? 3 : 2,
            boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.15)' : 3
          }}>
            <CardContent sx={{ 
              textAlign: 'center',
              p: isMobile ? 1.5 : 2
            }}>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ 
                  fontWeight: 600, 
                  mb: isMobile ? 0.5 : 1 
                }}
              >
                {t('ipos.active')}
              </Typography>
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                sx={{ fontWeight: 700 }}
              >
                {safeActiveIPOs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
         <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            height: isMobile ? '100px' : '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: isMobile ? 3 : 2,
            boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.15)' : 3
          }}>
            <CardContent sx={{ 
              textAlign: 'center',
              p: isMobile ? 1.5 : 2
            }}>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ 
                  fontWeight: 600, 
                  mb: isMobile ? 0.5 : 1 
                }}
              >
                {t('ipos.upcoming')}
              </Typography>
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                sx={{ fontWeight: 700 }}
              >
                {safeUpcomingIPOs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
         <Grid item xs={12} md={4}>
          <Card sx={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            height: isMobile ? '100px' : '120px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: isMobile ? 3 : 2,
            boxShadow: isMobile ? '0 8px 32px rgba(0,0,0,0.15)' : 3
          }}>
            <CardContent sx={{ 
              textAlign: 'center',
              p: isMobile ? 1.5 : 2
            }}>
              <Typography 
                variant={isMobile ? "body1" : "h6"} 
                sx={{ 
                  fontWeight: 600, 
                  mb: isMobile ? 0.5 : 1 
                }}
              >
                {t('ipos.mySubscriptions')}
              </Typography>
              <Typography 
                variant={isMobile ? "h4" : "h3"} 
                sx={{ fontWeight: 700 }}
              >
                {safeMySubscriptions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs Section */}
       <Grid container spacing={isMobile ? 2 : 3}>
         <Grid item xs={12}>
          <Paper elevation={isMobile ? 0 : 1} sx={{ 
            background: isMobile ? 'transparent' : 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
            border: isMobile ? 'none' : '1px solid rgba(26, 35, 126, 0.08)',
            borderRadius: isMobile ? 0 : 1
          }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant={isMobile ? "fullWidth" : "standard"}
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                '& .MuiTab-root': {
                  fontWeight: 600,
                  fontSize: isMobile ? '0.875rem' : '1rem',
                  textTransform: 'none',
                  minHeight: isMobile ? 48 : 64,
                  px: isMobile ? 1 : 2,
                  '&.Mui-selected': {
                    color: 'primary.main'
                  }
                }
              }}
            >
              <Tab label={t('ipos.active')} />
              <Tab label={t('ipos.upcoming')} />
              <Tab label={t('ipos.mySubscriptions')} />
            </Tabs>
          </Paper>
        </Grid>

        {/* Content Section */}
         <Grid item xs={12}>
          <TabPanel value={tabValue} index={0}>
            <Card sx={{ 
              background: isMobile ? 'transparent' : 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              border: isMobile ? 'none' : '1px solid rgba(26, 35, 126, 0.08)',
              boxShadow: isMobile ? 'none' : 1,
              borderRadius: isMobile ? 0 : 1
            }}>
              <CardContent sx={{ p: isMobile ? 1 : 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: isMobile ? 2 : 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 1.5 }}>
                    <Avatar sx={{ 
                      bgcolor: 'primary.main', 
                      width: isMobile ? 32 : 40, 
                      height: isMobile ? 32 : 40 
                    }}>
                      <BusinessCenter sx={{ fontSize: isMobile ? 18 : 24 }} />
                    </Avatar>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      sx={{ fontWeight: 600 }}
                    >
                      {t('ipos.active')}
                    </Typography>
                  </Box>
                </Box>
                
                {loading ? (
                  <LoadingSpinner fullScreen={false} />
                ) : safeActiveIPOs.length > 0 ? (
                  <Grid container spacing={isMobile ? 2 : 3}>
                    {safeActiveIPOs.map((ipo) => renderIPOCard(ipo, true))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      {t('ipos.noActiveIPOs')}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Card sx={{ 
              background: isMobile ? 'transparent' : 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              border: isMobile ? 'none' : '1px solid rgba(26, 35, 126, 0.08)',
              boxShadow: isMobile ? 'none' : 1,
              borderRadius: isMobile ? 0 : 1
            }}>
              <CardContent sx={{ p: isMobile ? 1 : 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: isMobile ? 2 : 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 1.5 }}>
                    <Avatar sx={{ 
                      bgcolor: 'warning.main', 
                      width: isMobile ? 32 : 40, 
                      height: isMobile ? 32 : 40 
                    }}>
                      <Schedule sx={{ fontSize: isMobile ? 18 : 24 }} />
                    </Avatar>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      sx={{ fontWeight: 600 }}
                    >
                      {t('ipos.upcoming')}
                    </Typography>
                  </Box>
                </Box>
                
                {loading ? (
                  <LoadingSpinner fullScreen={false} />
                ) : safeUpcomingIPOs.length > 0 ? (
                  <Grid container spacing={isMobile ? 2 : 3}>
                    {safeUpcomingIPOs.map((ipo) => renderIPOCard(ipo, false))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      {t('ipos.noUpcomingIPOs')}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Card sx={{ 
              background: isMobile ? 'transparent' : 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
              border: isMobile ? 'none' : '1px solid rgba(26, 35, 126, 0.08)',
              boxShadow: isMobile ? 'none' : 1,
              borderRadius: isMobile ? 0 : 1
            }}>
              <CardContent sx={{ p: isMobile ? 1 : 3 }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center', 
                  mb: isMobile ? 2 : 3,
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 2, sm: 0 }
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: isMobile ? 1 : 1.5 }}>
                    <Avatar sx={{ 
                      bgcolor: 'success.main', 
                      width: isMobile ? 32 : 40, 
                      height: isMobile ? 32 : 40 
                    }}>
                      <AccountBalance sx={{ fontSize: isMobile ? 18 : 24 }} />
                    </Avatar>
                    <Typography 
                      variant={isMobile ? "h6" : "h5"} 
                      sx={{ fontWeight: 600 }}
                    >
                      {t('ipos.mySubscriptions')}
                    </Typography>
                  </Box>
                </Box>
                
                {loading ? (
                  <LoadingSpinner fullScreen={false} />
                ) : safeMySubscriptions.length > 0 ? (
                  <Grid container spacing={isMobile ? 2 : 3}>
                    {safeMySubscriptions.map((subscription) => renderSubscriptionCard(subscription))}
                  </Grid>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant={isMobile ? "caption" : "body2"}>
                      {t('ipos.noSubscriptions')}
                    </Typography>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </TabPanel>
        </Grid>
      </Grid>

      {/* Subscribe Dialog */}
      <Dialog
        open={subscribeDialog.open}
        onClose={() => setSubscribeDialog({ open: false, ipo: null })}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: isMobile ? 0 : 2,
            margin: isMobile ? 0 : 2
          }
        }}
      >
        <DialogTitle sx={{ 
          fontSize: isMobile ? '1.1rem' : '1.25rem',
          fontWeight: 600,
          pb: isMobile ? 1 : 2
        }}>
          {t('ipos.subscribe')} - {subscribeDialog.ipo?.companyName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Bakiye Bilgisi */}
            <Box sx={{ 
              mb: isMobile ? 2 : 3, 
              p: isMobile ? 1.5 : 2, 
              bgcolor: 'primary.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'primary.200' 
            }}>
              <Typography 
                variant={isMobile ? "body2" : "subtitle2"} 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1, 
                  color: 'primary.main',
                  fontSize: isMobile ? '0.9rem' : '0.875rem'
                }}
              >
                💰 {t('balance.title')}
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={4}>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}
                  >
                    {t('balance.available')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "body2" : "body1"} 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '0.8rem' : '1rem'
                    }}
                  >
                    {balance.availableBalance.toFixed(2)} TL
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}
                  >
                    {t('balance.reserved')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "body2" : "body1"} 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '0.8rem' : '1rem'
                    }}
                  >
                    {balance.reservedAmount.toFixed(2)} TL
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}
                  >
                    {t('balance.total')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "body2" : "body1"} 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '0.8rem' : '1rem'
                    }}
                  >
                    {balance.totalBalance.toFixed(2)} TL
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            {/* IPO Fiyat Bilgileri */}
            <Box sx={{ 
              mb: isMobile ? 2 : 3, 
              p: isMobile ? 1.5 : 2, 
              bgcolor: 'grey.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'grey.200' 
            }}>
              <Typography 
                variant={isMobile ? "body2" : "subtitle2"} 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1,
                  fontSize: isMobile ? '0.9rem' : '0.875rem'
                }}
              >
                📊 {t('ipos.priceInfo')}
              </Typography>
              <Grid container spacing={isMobile ? 1 : 2}>
                <Grid item xs={4}>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}
                  >
                    {t('ipos.minPrice')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "body2" : "body1"} 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'success.main',
                      fontSize: isMobile ? '0.8rem' : '1rem'
                    }}
                  >
                    {subscribeDialog.ipo?.priceMin} TL
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}
                  >
                    {t('ipos.maxPrice')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "body2" : "body1"} 
                    sx={{ 
                      fontWeight: 600, 
                      color: 'error.main',
                      fontSize: isMobile ? '0.8rem' : '1rem'
                    }}
                  >
                    {subscribeDialog.ipo?.priceMax} TL
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography 
                    variant={isMobile ? "caption" : "body2"} 
                    color="text.secondary"
                    sx={{ fontSize: isMobile ? '0.7rem' : '0.875rem' }}
                  >
                    {t('ipos.lotSize')}
                  </Typography>
                  <Typography 
                    variant={isMobile ? "body2" : "body1"} 
                    sx={{ 
                      fontWeight: 600,
                      fontSize: isMobile ? '0.8rem' : '1rem'
                    }}
                  >
                    {subscribeDialog.ipo?.lotSize} {t('ipos.shares')}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            
            <TextField
              fullWidth
              label={`${t('ipos.quantity')} (${t('ipos.lot')}: ${subscribeDialog.ipo?.lotSize || 1} ${t('ipos.shares')})`}
              type="number"
              value={subscriptionData.quantity}
              onChange={(e) => {
                const quantity = e.target.value;
                const pricePerShare = subscribeDialog.ipo?.priceMin || 0;
                setSubscriptionData({ 
                  ...subscriptionData, 
                  quantity,
                  pricePerShare: pricePerShare.toString()
                });
              }}
              inputProps={{
                min: subscribeDialog.ipo?.lotSize || 1,
                step: subscribeDialog.ipo?.lotSize || 1
              }}
              helperText={`${t('ipos.minLotSize')}: ${subscribeDialog.ipo?.lotSize || 1} ${t('ipos.shares')}. ${t('ipos.autoMinPrice')} (${subscribeDialog.ipo?.priceMin} TL).`}
              sx={{ 
                mb: isMobile ? 1.5 : 2,
                '& .MuiInputLabel-root': {
                  fontSize: isMobile ? '0.85rem' : '1rem'
                },
                '& .MuiInputBase-input': {
                  fontSize: isMobile ? '0.9rem' : '1rem'
                },
                '& .MuiFormHelperText-root': {
                  fontSize: isMobile ? '0.7rem' : '0.75rem'
                }
              }}
            />
            
            {/* Otomatik Fiyat Bilgisi */}
            <Box sx={{ 
              mb: isMobile ? 1.5 : 2, 
              p: isMobile ? 1.5 : 2, 
              bgcolor: 'info.50', 
              borderRadius: 1, 
              border: '1px solid', 
              borderColor: 'info.200' 
            }}>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                sx={{ 
                  fontWeight: 600, 
                  color: 'info.main', 
                  mb: 1,
                  fontSize: isMobile ? '0.8rem' : '0.875rem'
                }}
              >
                ℹ️ {t('ipos.autoPricing')}
              </Typography>
              <Typography 
                variant={isMobile ? "caption" : "body2"} 
                color="text.secondary"
                sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}
              >
                {t('ipos.autoPricingDesc', { price: subscribeDialog.ipo?.priceMin })}
              </Typography>
            </Box>
            {subscriptionData.quantity && subscriptionData.pricePerShare && (
              <Box sx={{ 
                mt: isMobile ? 1.5 : 2, 
                p: isMobile ? 1.5 : 2, 
                bgcolor: 'grey.100', 
                borderRadius: 1 
              }}>
                <Typography 
                  variant={isMobile ? "caption" : "body2"} 
                  color="text.secondary"
                  sx={{ fontSize: isMobile ? '0.8rem' : '0.875rem' }}
                >
                  {t('ipos.totalAmount')}: {formatPrice(parseFloat(subscriptionData.quantity) * parseFloat(subscriptionData.pricePerShare))}
                </Typography>
                {parseFloat(subscriptionData.quantity) * parseFloat(subscriptionData.pricePerShare) > balance.availableBalance && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mt: 1,
                      '& .MuiAlert-message': {
                        fontSize: isMobile ? '0.75rem' : '0.875rem'
                      }
                    }}
                  >
                    {t('ipos.insufficientBalance', { balance: balance.availableBalance.toFixed(2) })}
                  </Alert>
                )}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: isMobile ? 2 : 3,
          gap: isMobile ? 1 : 2,
          flexDirection: isMobile ? 'column' : 'row'
        }}>
          <Button 
            onClick={() => setSubscribeDialog({ open: false, ipo: null })}
            fullWidth={isMobile}
            sx={{
              fontSize: isMobile ? '0.85rem' : '0.875rem',
              py: isMobile ? 1.2 : 1
            }}
          >
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubscribeSubmit}
            variant="contained"
            disabled={!subscriptionData.quantity || parseFloat(subscriptionData.quantity) <= 0}
            fullWidth={isMobile}
            sx={{
              fontSize: isMobile ? '0.85rem' : '0.875rem',
              py: isMobile ? 1.2 : 1
            }}
          >
            {t('ipos.subscribe')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Cancel Request Dialog */}
      <Dialog
        open={cancelRequestDialog.open}
        onClose={() => setCancelRequestDialog({ open: false, subscription: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          📧 {t('ipos.cancelRequest')} - {cancelRequestDialog.subscription?.ipo?.companyName}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            {/* Abonelik Bilgileri */}
            <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1, border: '1px solid', borderColor: 'grey.200' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                📊 {t('ipos.subscriptionInfo')}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t('ipos.company')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {cancelRequestDialog.subscription?.ipo?.companyName}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t('ipos.quantity')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                    {cancelRequestDialog.subscription?.quantity}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="text.secondary">
                    {t('ipos.totalAmount')}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {cancelRequestDialog.subscription && formatPrice(cancelRequestDialog.subscription.quantity * cancelRequestDialog.subscription.pricePerShare)}
                  </Typography>
                </Grid>
              </Grid>
            </Box>

            {/* Uyarı Mesajı */}
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                {t('ipos.cancelWarning')}
              </Typography>
            </Alert>
            
            <TextField
              fullWidth
              label={t('ipos.cancelReason')}
              multiline
              rows={4}
              value={cancelRequestMessage}
              onChange={(e) => setCancelRequestMessage(e.target.value)}
              placeholder={t('ipos.cancelReasonPlaceholder')}
              helperText={t('ipos.cancelReasonHelper')}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelRequestDialog({ open: false, subscription: null })}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleSubmitCancelRequest}
            variant="contained"
            color="warning"
            disabled={!cancelRequestMessage.trim()}
          >
            📧 {t('ipos.sendRequest')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default IPOs;