import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Card,
  Typography,
  Box,
  Button,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
  Paper,
  useTheme,
  useMediaQuery,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
  VerifiedUser as VerifiedUserIcon,
  MonetizationOn as MonetizationOnIcon,
  Assessment as AssessmentIcon,
  Security as SecurityIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  BusinessCenter as BusinessCenterIcon,
  PersonAdd as PersonAddIcon,
  Support as SupportIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import { adminAPI } from '../../services/adminAPI';

interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  pendingKyc: number;
  totalIpos: number;
  activeIpos: number;
  totalDeposits: number;
  pendingDeposits: number;
  totalStocks: number;
  activeStocks: number;
  systemHealth: 'good' | 'warning' | 'critical';
}

const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);



  useEffect(() => {
    fetchAdminStats();
    fetchRecentActivities();
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getDashboardStats();
      setStats(response.data);
      setLoading(false);
    } catch (error: any) {
      console.error('Failed to fetch admin stats:', error);
      setError(t('admin.statsLoadError'));
      // Set default stats to prevent null errors
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        pendingKyc: 0,
        totalIpos: 0,
        activeIpos: 0,
        totalDeposits: 0,
        pendingDeposits: 0,
        totalStocks: 0,
        activeStocks: 0,
        systemHealth: 'critical'
      });
      setLoading(false);
    }
  };

  // const getHealthColor = (health: string) => {
  //   switch (health) {
  //     case 'good': return '#4caf50';
  //     case 'warning': return '#ff9800';
  //     case 'critical': return '#f44336';
  //     default: return '#4caf50';
  //   }
  // };

  const getStatsData = () => {
    if (!stats) return [];
    
    return [
      {
        title: t('admin.totalUsers'),
        value: stats.totalUsers,
        icon: <PeopleIcon />,
        color: '#1976d2',
        change: '+12%'
      },
      {
        title: t('admin.activeUsers'),
        value: stats.activeUsers,
        icon: <VerifiedUserIcon />,
        color: '#2e7d32',
        change: '+8%'
      },
      {
        title: t('admin.pendingKYC'),
        value: stats.pendingKyc,
        icon: <SecurityIcon />,
        color: '#ed6c02',
        change: '-5%'
      },
      {
        title: t('admin.activeIPO'),
        value: stats.activeIpos,
        icon: <TrendingUpIcon />,
        color: '#9c27b0',
        change: '+15%'
      },
      {
        title: t('admin.activeStock'),
        value: stats.activeStocks,
        icon: <BusinessCenterIcon />,
        color: '#d32f2f',
        change: '+7%'
      }
    ];
  };

  // const quickActions = [
  //   { title: t('admin.addNewIPO'), icon: <AddIcon />, action: () => navigate('/admin/ipos'), color: '#1a237e' },
  //   { title: t('admin.addNewStock'), icon: <BusinessCenterIcon />, action: () => navigate('/admin/stocks'), color: '#d32f2f' },
  //   { title: t('admin.stockManagement'), icon: <TrendingUpIcon />, action: () => navigate('/admin/stocks'), color: '#d32f2f' },
  //   { title: t('admin.createInviteCode'), icon: <PersonAddIcon />, action: () => navigate('/admin/invite-codes'), color: '#2e7d32' },
  //   { title: t('admin.userManagement'), icon: <PeopleIcon />, action: () => navigate('/admin/users'), color: '#2e7d32' },
  //   { title: t('admin.generateReport'), icon: <AssessmentIcon />, action: () => navigate('/admin/reports'), color: '#9c27b0' },
  //   { title: t('admin.kycReviews'), icon: <VerifiedUserIcon />, action: () => navigate('/admin/kyc'), color: '#ed6c02' },
  //   { title: t('admin.publishAnnouncement'), icon: <NotificationsIcon />, action: () => navigate('/admin/announcements'), color: '#1976d2' },
  // ];

  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  const fetchRecentActivities = async () => {
    try {
      // Bu fonksiyon backend'den gerçek aktivite verilerini çekecek
      // Şimdilik boş array kullanıyoruz
      setRecentActivities([]);
    } catch (error) {
      console.error('Failed to fetch recent activities:', error);
      setRecentActivities([]);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user': return <PeopleIcon />;
      case 'kyc': return <VerifiedUserIcon />;
      case 'ipo': return <AccountBalanceIcon />;
      case 'deposit': return <MonetizationOnIcon />;
      default: return <NotificationsIcon />;
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Paper
        elevation={0}
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          mb: 4,
          color: 'white'
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 56, height: 56 }}>
            <DashboardIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant={isMobile ? 'h5' : 'h4'} sx={{ fontWeight: 700, color: 'white' }}>
              {t('admin.adminPanel')}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, color: 'white' }}>
              {t('admin.welcome', { firstName: user?.firstName, lastName: user?.lastName })}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.7, color: 'white' }}>
              {new Date().toLocaleDateString('tr-TR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Stats Cards */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200} sx={{ mb: 4 }}>
          <CircularProgress size={40} />
        </Box>
      ) : error ? (
        <Box sx={{ mb: 4 }}>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={fetchAdminStats}>
              {t('common.tryAgain')}
            </Button>
          }>
            {error}
          </Alert>
        </Box>
      ) : (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {getStatsData().map((stat, index) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
              <Card
                elevation={2}
                sx={{
                  p: 3,
                  height: '100%',
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: theme.shadows[8]
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color={stat.color}>
                      {stat.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {stat.title}
                    </Typography>
                  </Box>
                  <Avatar
                    sx={{
                      bgcolor: `${stat.color}15`,
                      color: stat.color,
                      width: 56,
                      height: 56
                    }}
                  >
                    {stat.icon}
                  </Avatar>
                </Box>
                <Chip
                  label={stat.change}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Grid container spacing={3}>

        {/* Quick Actions */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              {t('admin.quickActions')}
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SupportIcon />}
                  onClick={() => navigate('/admin/support')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#9c27b0',
                    color: '#9c27b0',
                    '&:hover': { borderColor: '#7b1fa2', bgcolor: '#f3e5f5' }
                  }}
                >
                  {t('admin.supportSystem')}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/admin/ipos')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {t('admin.addNewIPO')}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<BusinessCenterIcon />}
                  onClick={() => navigate('/admin/stocks')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#d32f2f',
                    '&:hover': { bgcolor: '#b71c1c' }
                  }}
                >
                  {t('admin.addNewStock')}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/admin/stocks')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    borderColor: '#d32f2f',
                    color: '#d32f2f',
                    '&:hover': { borderColor: '#b71c1c', bgcolor: '#ffebee' }
                  }}
                >
                  {t('admin.stockManagement')}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/admin/invite-codes')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {t('admin.createInviteCode')}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/admin/users')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {t('admin.userManagement')}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => navigate('/admin/reports')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {t('admin.generateReport')}
                </Button>
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<NotificationsIcon />}
                  onClick={() => navigate('/admin/announcements')}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  {t('admin.publishAnnouncement')}
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: 'fit-content' }}>
            <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
              {t('admin.recentActivities')}
            </Typography>
            <List sx={{ p: 0 }}>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity.id}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemAvatar>
                      <Avatar sx={{ width: 40, height: 40, bgcolor: `${theme.palette.primary.main}15`, color: theme.palette.primary.main }}>
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {activity.message}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      }
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Management Sections */}
        <Grid size={12}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${theme.palette.primary.main}15`, color: theme.palette.primary.main, width: 48, height: 48 }}>
                    <PeopleIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('admin.userManagement')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('admin.pendingOperations')}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Chip label={`${stats?.pendingKyc || 0} KYC`} size="small" color="warning" />
                    <Chip label={`${stats?.pendingDeposits || 0} ${t('admin.deposits')}`} size="small" color="info" />
                  </Box>
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate('/admin/users')}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                >
                  {t('admin.manageUsers')}
                </Button>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${theme.palette.success.main}15`, color: theme.palette.success.main, width: 48, height: 48 }}>
                    <BusinessCenterIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('admin.ipoManagement')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('admin.activeIPOs')}
                  </Typography>
                  <Typography variant="h4" sx={{ color: theme.palette.success.main, fontWeight: 700 }}>
                    {stats?.activeIpos || 0}
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<EditIcon />}
                  onClick={() => navigate('/admin/ipos')}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                >
                  {t('admin.addEditIPO')}
                </Button>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${theme.palette.secondary.main}15`, color: theme.palette.secondary.main, width: 48, height: 48 }}>
                    <AssessmentIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('admin.systemStatistics')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('admin.totalTransactionVolume')}
                  </Typography>
                  <Typography variant="h4" sx={{ color: theme.palette.secondary.main, fontWeight: 700 }}>
                    ₺{(stats?.totalDeposits || 0).toLocaleString()}
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  fullWidth
                  startIcon={<VisibilityIcon />}
                  onClick={() => navigate('/admin/reports')}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600
                  }}
                >
                  {t('admin.detailedReport')}
                </Button>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Paper elevation={1} sx={{ p: 3, borderRadius: 2, height: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                  <Avatar sx={{ bgcolor: `${theme.palette.warning.main}15`, color: theme.palette.warning.main, width: 48, height: 48 }}>
                    <TrendingUpIcon />
                  </Avatar>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {t('admin.stockManagement')}
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {t('admin.activeStocks')}
                  </Typography>
                  <Typography variant="h4" sx={{ color: theme.palette.warning.main, fontWeight: 700 }}>
                    {stats?.activeStocks || 0}
                  </Typography>
                </Box>
                <Button 
                  variant="contained" 
                  fullWidth
                  startIcon={<TrendingUpIcon />}
                  onClick={() => navigate('/admin/stocks')}
                  sx={{ 
                    textTransform: 'none',
                    borderRadius: 2,
                    fontWeight: 600,
                    bgcolor: theme.palette.warning.main,
                    '&:hover': {
                      bgcolor: theme.palette.warning.dark
                    }
                  }}
                >
                  {t('admin.manageStocks')}
                </Button>
              </Paper>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard;