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
  Snackbar,
} from '@mui/material';
import {
  Add as AddIcon,
  ContentCopy as CopyIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  FilterList as FilterIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/adminAPI';

interface InviteCode {
  id: number;
  code: string;
  isUsed: boolean;
  usedBy: number | null;
  createdBy: number;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  creator?: {
    firstName: string;
    lastName: string;
  };
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const InviteCodes: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'used' | 'unused'>('all');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [expiresAt, setExpiresAt] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const fetchInviteCodes = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params: any = { page, limit: 10 };
      if (filter === 'used') params.isUsed = true;
      if (filter === 'unused') params.isUsed = false;
      
      const response = await adminAPI.getInviteCodes(params);
      setInviteCodes(response.data.inviteCodes || response.data.codes || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err: any) {
      setError(err.response?.data?.error || t('inviteCodes.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateInviteCode = async () => {
    try {
      setCreating(true);
      const data: any = {};
      if (expiresAt) {
        data.expiresAt = expiresAt;
      }
      
      const response = await adminAPI.createInviteCode(data);
      setSnackbar({
        open: true,
        message: t('inviteCodes.createSuccess'),
        severity: 'success'
      });
      setCreateDialogOpen(false);
      setExpiresAt('');
      fetchInviteCodes();
    } catch (err: any) {
      setSnackbar({
        open: true,
        message: err.response?.data?.error || t('inviteCodes.createError'),
        severity: 'error'
      });
    } finally {
      setCreating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setSnackbar({
      open: true,
      message: t('inviteCodes.copied'),
      severity: 'success'
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    fetchInviteCodes();
  }, [page, filter]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Paper elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => navigate('/admin')} color="primary">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h4" fontWeight={700}>
              {t('inviteCodes.title')}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchInviteCodes}
              disabled={loading}
            >
{t('common.refresh')}
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
{t('inviteCodes.addCode')}
            </Button>
          </Box>
        </Box>
        
        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FilterIcon color="action" />
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              value={filter}
              label={t('common.status')}
              onChange={(e) => {
                setFilter(e.target.value as any);
                setPage(1);
              }}
            >
              <MenuItem value="all">{t('common.all')}</MenuItem>
              <MenuItem value="unused">{t('inviteCodes.unused')}</MenuItem>
              <MenuItem value="used">{t('inviteCodes.used')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Content */}
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
          <CircularProgress size={40} />
        </Box>
      ) : error ? (
        <Alert severity="error" action={
          <Button color="inherit" size="small" onClick={fetchInviteCodes}>
{t('common.retry')}
          </Button>
        }>
          {error}
        </Alert>
      ) : (
        <>
          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {t('inviteCodes.totalCodes')}
                  </Typography>
                  <Typography variant="h4">
                    {inviteCodes.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {t('inviteCodes.unused')}
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {inviteCodes.filter(code => !code.isUsed).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    {t('inviteCodes.used')}
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {inviteCodes.filter(code => code.isUsed).length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Table */}
          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('inviteCodes.code')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('inviteCodes.createdBy')}</TableCell>
                    <TableCell>{t('inviteCodes.usedBy')}</TableCell>
                    <TableCell>{t('inviteCodes.expiresAt')}</TableCell>
                    <TableCell>{t('inviteCodes.createdAt')}</TableCell>
                    <TableCell>{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {inviteCodes.map((code) => (
                    <TableRow key={code.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="body2" fontFamily="monospace" fontWeight={600}>
                            {code.code}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => copyToClipboard(code.code)}
                            title={t('inviteCodes.copy')}
                          >
                            <CopyIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={code.isUsed ? t('inviteCodes.used') : t('inviteCodes.active')}
                          color={code.isUsed ? 'error' : 'success'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {code.creator ? `${code.creator.firstName} ${code.creator.lastName}` : '-'}
                      </TableCell>
                      <TableCell>
                        {code.user ? (
                          <Box>
                            <Typography variant="body2">
                              {code.user.firstName} {code.user.lastName}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {code.user.email}
                            </Typography>
                          </Box>
                        ) : '-'}
                      </TableCell>
                      <TableCell>
                        {code.expiresAt ? (
                          <Typography variant="body2">
                            {formatDate(code.expiresAt)}
                          </Typography>
                        ) : (
                          <Chip label={t('inviteCodes.unlimited')} size="small" variant="outlined" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatDate(code.createdAt)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => copyToClipboard(code.code)}
                          title={t('inviteCodes.copy')}
                        >
                          <CopyIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, newPage) => setPage(newPage)}
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        </>
      )}

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t('inviteCodes.createTitle')}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={t('inviteCodes.expiryDate')}
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              InputLabelProps={{ shrink: true }}
              helperText={t('inviteCodes.expiryHelp')}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            onClick={handleCreateInviteCode}
            variant="contained"
            disabled={creating}
          >
            {creating ? <CircularProgress size={20} /> : t('common.create')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default InviteCodes;