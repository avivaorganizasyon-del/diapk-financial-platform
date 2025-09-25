import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
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
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
  Schedule as ScheduleIcon,
  Public as PublicIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI, Announcement } from '../../services/adminAPI';

// Define extended interface for local use
interface ExtendedAnnouncement extends Announcement {
  type?: 'info' | 'warning' | 'success' | 'error';
  priority?: 'low' | 'medium' | 'high';
  isPublished?: boolean;
  expiryDate?: string;
  viewCount?: number;
}

const Announcements: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [announcements, setAnnouncements] = useState<ExtendedAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<ExtendedAnnouncement | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success' | 'error',
    priority: 'medium' as 'low' | 'medium' | 'high',
    isActive: true,
    isPublished: false,
    publishDate: '',
    expiryDate: '',
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [page, typeFilter]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getAnnouncements({
        page,
        limit: 10,
        type: typeFilter || undefined,
      });
      setAnnouncements(response.data.announcements);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch announcements:', error);
      setError(t('admin.announcements.loadError'));
      // Set mock data for development
      setAnnouncements([
        {
          id: 1,
          title: t('announcements.newIpoAnnouncement'),
          content: t('announcements.newIpoContent'),
          type: 'info',
          priority: 'high',
          isActive: true,
          isPublished: true,
          publishDate: '2024-01-10T09:00:00Z',
          expiryDate: '2024-01-20T23:59:59Z',
          createdAt: '2024-01-09T10:00:00Z',
          updatedAt: '2024-01-09T10:00:00Z',
          viewCount: 1250,
        },
        {
          id: 2,
          title: t('announcements.systemMaintenance'),
          content: t('announcements.systemMaintenanceContent'),
          type: 'warning',
          priority: 'medium',
          isActive: true,
          isPublished: false,
          publishDate: '2024-01-18T00:00:00Z',
          createdAt: '2024-01-08T14:30:00Z',
          updatedAt: '2024-01-08T14:30:00Z',
          viewCount: 0,
        },
      ]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await adminAPI.createAnnouncement(formData);
      fetchAnnouncements();
      setEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to create announcement:', error);
      setError(t('admin.announcements.createError'));
    }
  };

  const handleUpdate = async () => {
    if (!selectedAnnouncement) return;
    try {
      await adminAPI.updateAnnouncement(selectedAnnouncement.id, formData);
      fetchAnnouncements();
      setEditDialogOpen(false);
      resetForm();
    } catch (error: any) {
      console.error('Failed to update announcement:', error);
      setError(t('admin.announcements.updateError'));
    }
  };

  const handleDelete = async () => {
    if (!selectedAnnouncement) return;
    try {
      await adminAPI.deleteAnnouncement(selectedAnnouncement.id);
      fetchAnnouncements();
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (error: any) {
      console.error('Failed to delete announcement:', error);
      setError(t('admin.announcements.deleteError'));
    }
  };

  const handleToggleStatus = async (id: number, field: 'isActive' | 'isPublished') => {
    try {
      const announcement = announcements.find(a => a.id === id);
      if (!announcement) return;
      
      await adminAPI.updateAnnouncement(id, {
        ...announcement,
        [field]: !announcement[field],
      });
      fetchAnnouncements();
    } catch (error: any) {
      console.error('Failed to toggle announcement status:', error);
      setError(t('admin.announcements.statusUpdateError'));
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      priority: 'medium',
      isActive: true,
      isPublished: false,
      publishDate: '',
      expiryDate: '',
    });
    setSelectedAnnouncement(null);
  };

  const openEditDialog = (announcement?: Announcement) => {
    if (announcement) {
      setSelectedAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
        priority: announcement.priority,
        isActive: announcement.isActive,
        isPublished: announcement.isPublished,
        publishDate: announcement.publishDate.split('T')[0],
        expiryDate: announcement.expiryDate ? announcement.expiryDate.split('T')[0] : '',
      });
    } else {
      resetForm();
    }
    setEditDialogOpen(true);
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'success': return t('common.success');
      case 'warning': return t('common.warning');
      case 'error': return t('common.error');
      case 'info': return t('common.info');
      default: return type;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return t('common.high');
      case 'medium': return t('common.medium');
      case 'low': return t('common.low');
      default: return priority;
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
          {t('admin.announcementManagement')}
        </Typography>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>{t('admin.announcements.type')}</InputLabel>
            <Select
              value={typeFilter}
              label={t('admin.announcements.type')}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="info">{t('common.info')}</MenuItem>
              <MenuItem value="warning">{t('common.warning')}</MenuItem>
              <MenuItem value="success">{t('common.success')}</MenuItem>
              <MenuItem value="error">{t('common.error')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => openEditDialog()}
          >
            {t('admin.newAnnouncement')}
          </Button>
        </Box>
      </Paper>

      {/* Announcements */}
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
            {announcements.map((announcement) => (
              <Grid item xs={12} key={announcement.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" component="div">
                            {announcement.title}
                          </Typography>
                          <Chip
                            label={getTypeText(announcement.type || 'info')}
                            color={getTypeColor(announcement.type || 'info')}
                            size="small"
                          />
                          <Chip
                            label={getPriorityText(announcement.priority || 'medium')}
                            color={getPriorityColor(announcement.priority || 'medium')}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {announcement.content}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <ScheduleIcon fontSize="small" color="action" />
                            <Typography variant="caption">
                              {t('admin.announcements.publishDate')}: {new Date(announcement.publishDate).toLocaleDateString('tr-TR')}
                            </Typography>
                          </Box>
                          {announcement.expiryDate && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <ScheduleIcon fontSize="small" color="action" />
                              <Typography variant="caption">
                                {t('admin.announcements.expiryDate')}: {new Date(announcement.expiryDate).toLocaleDateString('tr-TR')}
                              </Typography>
                            </Box>
                          )}
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <PublicIcon fontSize="small" color="action" />
                            <Typography variant="caption">
                              {announcement.viewCount} {t('admin.announcements.views')}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, ml: 2 }}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={announcement.isActive}
                              onChange={() => handleToggleStatus(announcement.id, 'isActive')}
                              size="small"
                            />
                          }
                          label={t('common.active')}
                          labelPlacement="start"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={announcement.isPublished}
                              onChange={() => handleToggleStatus(announcement.id, 'isPublished')}
                              size="small"
                            />
                          }
                          label={t('admin.announcements.published')}
                          labelPlacement="start"
                        />
                      </Box>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedAnnouncement(announcement);
                        setDialogOpen(true);
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => openEditDialog(announcement)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setSelectedAnnouncement(announcement);
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

      {/* Announcement Detail Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {t('admin.announcements.announcementDetails')}
        </DialogTitle>
        <DialogContent>
          {selectedAnnouncement && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h5" gutterBottom>
                  {selectedAnnouncement.title}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip
                    label={getTypeText(selectedAnnouncement.type)}
                    color={getTypeColor(selectedAnnouncement.type)}
                    size="small"
                  />
                  <Chip
                    label={getPriorityText(selectedAnnouncement.priority)}
                    color={getPriorityColor(selectedAnnouncement.priority)}
                    size="small"
                    variant="outlined"
                  />
                  <Chip
                    label={selectedAnnouncement.isActive ? t('common.active') : t('common.inactive')}
                    color={selectedAnnouncement.isActive ? 'success' : 'default'}
                    size="small"
                  />
                  <Chip
                    label={selectedAnnouncement.isPublished ? t('admin.announcements.published') : t('admin.announcements.draft')}
                    color={selectedAnnouncement.isPublished ? 'info' : 'default'}
                    size="small"
                  />
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  {t('admin.announcements.content')}
                </Typography>
                <Typography>{selectedAnnouncement.content}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {t('admin.announcements.dates')}
                </Typography>
                <Typography><strong>{t('admin.announcements.publishDate')}:</strong> {new Date(selectedAnnouncement.publishDate).toLocaleDateString('tr-TR')}</Typography>
                {selectedAnnouncement.expiryDate && (
                  <Typography><strong>{t('admin.announcements.expiryDate')}:</strong> {new Date(selectedAnnouncement.expiryDate).toLocaleDateString('tr-TR')}</Typography>
                )}
                <Typography><strong>{t('common.createdAt')}:</strong> {new Date(selectedAnnouncement.createdAt).toLocaleDateString('tr-TR')}</Typography>
                <Typography><strong>{t('common.updatedAt')}:</strong> {new Date(selectedAnnouncement.updatedAt).toLocaleDateString('tr-TR')}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" gutterBottom>
                  {t('admin.announcements.statistics')}
                </Typography>
                <Typography><strong>{t('admin.announcements.views')}:</strong> {selectedAnnouncement.viewCount}</Typography>
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
          {selectedAnnouncement ? t('admin.announcements.editAnnouncement') : t('admin.announcements.addNewAnnouncement')}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label={t('admin.announcements.title')}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label={t('admin.announcements.content')}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('admin.announcements.type')}</InputLabel>
                <Select
                  value={formData.type}
                  label={t('admin.announcements.type')}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                >
                  <MenuItem value="info">{t('common.info')}</MenuItem>
                  <MenuItem value="warning">{t('common.warning')}</MenuItem>
                  <MenuItem value="success">{t('common.success')}</MenuItem>
                  <MenuItem value="error">{t('common.error')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>{t('common.priority')}</InputLabel>
                <Select
                  value={formData.priority}
                  label={t('common.priority')}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                >
                  <MenuItem value="low">{t('common.low')}</MenuItem>
                  <MenuItem value="medium">{t('common.medium')}</MenuItem>
                  <MenuItem value="high">{t('common.high')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.announcements.publishDate')}
                type="date"
                value={formData.publishDate}
                onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label={t('admin.announcements.expiryDateOptional')}
                type="date"
                value={formData.expiryDate}
                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                }
                label={t('common.active')}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isPublished}
                    onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                }
                label={t('admin.announcements.publish')}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>{t('common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={selectedAnnouncement ? handleUpdate : handleCreate}
          >
            {selectedAnnouncement ? t('common.update') : t('common.add')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>{t('admin.announcements.deleteAnnouncement')}</DialogTitle>
        <DialogContent>
          <Typography>
            {t('admin.announcements.deleteConfirmation', { title: selectedAnnouncement?.title })}
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

export default Announcements;