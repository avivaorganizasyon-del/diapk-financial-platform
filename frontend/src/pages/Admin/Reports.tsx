import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  AccountBalance as AccountBalanceIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  DateRange as DateRangeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/adminAPI';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface ReportData {
  users?: Array<{ date: string; count: number }>;
  deposits?: Array<{ date: string; count: number; total: number }>;
}

interface DashboardStats {
  totalUsers: number;
  totalDeposits: number;
  totalDepositAmount: number;
  pendingKyc: number;
  pendingDeposits: number;
  activeIpos: number;
}

const Reports: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [reportData, setReportData] = useState<ReportData>({});
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportType, setReportType] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);

  // Set default dates (last 30 days)
  useEffect(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    setEndDate(today.toISOString().split('T')[0]);
    setStartDate(thirtyDaysAgo.toISOString().split('T')[0]);
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (reportType !== 'all') params.append('type', reportType);
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await adminAPI.getReports(params.toString());
      setReportData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || t('reports.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const response = await adminAPI.getDashboardStats();
      setDashboardStats(response.stats);
    } catch (err: any) {
      console.error('Dashboard stats error:', err);
    }
  };

  useEffect(() => {
    if (startDate && endDate) {
      fetchReports();
    }
    fetchDashboardStats();
  }, [reportType, startDate, endDate]);

  const handleExport = async (type: string) => {
    try {
      setExportLoading(true);
      const params = new URLSearchParams();
      params.append('type', type);
      params.append('format', 'json');
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);

      const response = await adminAPI.exportReport(params.toString());
      
      // Create and download file
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${type}_report_${startDate}_${endDate}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.response?.data?.error || t('reports.exportError'));
    } finally {
      setExportLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading && !reportData.users && !reportData.deposits) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" mb={3}>
        <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <AssessmentIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t('admin.reports.title')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Dashboard Stats Cards */}
      {dashboardStats && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      {t('admin.reports.totalUsers')}
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {dashboardStats.totalUsers.toLocaleString('tr-TR')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalanceIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Toplam Yatırım
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {dashboardStats.totalDeposits.toLocaleString('tr-TR')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Yatırım Tutarı
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {formatCurrency(dashboardStats.totalDepositAmount)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <DateRangeIcon color="warning" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Bekleyen KYC
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {dashboardStats.pendingKyc.toLocaleString('tr-TR')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalanceIcon color="warning" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Bekleyen Yatırım
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {dashboardStats.pendingDeposits.toLocaleString('tr-TR')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUpIcon color="info" sx={{ mr: 1 }} />
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="body2">
                      Aktif IPO
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {dashboardStats.activeIpos.toLocaleString('tr-TR')}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('admin.reports.filters')}
        </Typography>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
                <InputLabel>{t('admin.reportType')}</InputLabel>
                <Select
                  value={reportType}
                  label={t('admin.reportType')}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  <MenuItem value="all">{t('common.all')}</MenuItem>
                  <MenuItem value="users">{t('admin.users')}</MenuItem>
                  <MenuItem value="deposits">{t('admin.deposits')}</MenuItem>
                </Select>
              </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label={t('admin.reports.startDate')}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              type="date"
              label={t('admin.reports.endDate')}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="contained"
              startIcon={<RefreshIcon />}
              onClick={fetchReports}
              disabled={loading}
            >
              {t('common.refresh')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Charts */}
      <Grid container spacing={3}>
        {/* User Registration Chart */}
        {reportData.users && reportData.users.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('admin.reports.userRegistrations')}
                </Typography>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('users')}
                  disabled={exportLoading}
                >
                  {t('common.export')}
                </Button>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={reportData.users}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value: number) => [value, 'Kayıt Sayısı']}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#1976d2" 
                    strokeWidth={2}
                    name="Kayıt Sayısı"
                  />
                </LineChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}

        {/* Deposits Chart */}
        {reportData.deposits && reportData.deposits.length > 0 && (
          <Grid item xs={12} lg={6}>
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">
                  {t('admin.reports.investmentStats')}
                </Typography>
                <Button
                  size="small"
                  startIcon={<DownloadIcon />}
                  onClick={() => handleExport('deposits')}
                  disabled={exportLoading}
                >
                  Dışa Aktar
                </Button>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={reportData.deposits}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={formatDate}
                  />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip 
                    labelFormatter={formatDate}
                    formatter={(value: number, name: string) => {
                      if (name === 'Toplam Tutar') {
                        return [formatCurrency(value), name];
                      }
                      return [value, name];
                    }}
                  />
                  <Legend />
                  <Bar 
                    yAxisId="left"
                    dataKey="count" 
                    fill="#1976d2" 
                    name={t('admin.reports.investmentCount')}
                  />
                  <Bar 
                    yAxisId="right"
                    dataKey="total" 
                    fill="#4caf50" 
                    name={t('admin.reports.totalAmount')}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Export All Data */}
      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          {t('admin.reports.dataExport')}
        </Typography>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('users')}
              disabled={exportLoading}
            >
              {t('admin.reports.userData')}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('deposits')}
              disabled={exportLoading}
            >
              Yatırım Verileri
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => handleExport('kyc')}
              disabled={exportLoading}
            >
              KYC Verileri
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default Reports;