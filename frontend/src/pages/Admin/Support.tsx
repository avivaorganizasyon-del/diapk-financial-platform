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
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
} from '@mui/material';
import {
  Visibility as VisibilityIcon,
  ArrowBack as ArrowBackIcon,
  Support as SupportIcon,
  Send as SendIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/adminAPI';

interface SupportMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderType: 'user' | 'admin';
  message: string;
  createdAt: string;
  sender: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const AdminSupport: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [showTicketDialog, setShowTicketDialog] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusOptions = [
    { value: '', label: t('support.allStatuses') },
    { value: 'open', label: t('support.open') },
    { value: 'in_progress', label: t('support.inProgress') },
    { value: 'resolved', label: t('support.resolved') },
    { value: 'closed', label: t('support.closed') }
  ];

  const categoryOptions = [
    { value: '', label: t('support.allCategories') },
    { value: 'general', label: t('support.general') },
    { value: 'account', label: t('support.account') },
    { value: 'deposit', label: t('support.deposit') },
    { value: 'withdrawal', label: t('support.withdrawal') },
    { value: 'trading', label: t('support.trading') },
    { value: 'technical', label: t('support.technical') }
  ];

  const priorityOptions = [
    { value: '', label: t('support.allPriorities') },
    { value: 'low', label: t('support.low') },
    { value: 'medium', label: t('support.medium') },
    { value: 'high', label: t('support.high') },
    { value: 'urgent', label: t('support.urgent') }
  ];

  useEffect(() => {
    fetchTickets();
  }, [page, statusFilter, categoryFilter, priorityFilter]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await adminAPI.getSupportTickets({
        page,
        limit: 20,
        status: statusFilter || undefined,
        category: categoryFilter || undefined,
        priority: priorityFilter || undefined
      });
      
      const data = response.data;
      setTickets(data.data || []);
      setTotalPages(data.pagination?.pages || 1);
    } catch (error: any) {
      console.error('Tickets fetch error:', error);
      setError(t('support.ticketsLoadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setNewStatus(ticket.status);
    setShowTicketDialog(true);
  };

  const handleSendMessage = async () => {
    if (!selectedTicket || !newMessage.trim()) return;

    try {
      setSendingMessage(true);
      await adminAPI.sendAdminMessage(selectedTicket.id, {
        message: newMessage
      });
      
      setSuccess(t('support.messageSentSuccess'));
      setNewMessage('');
      
      // Refresh ticket data
      await fetchTickets();
      
      // Fetch fresh ticket data to update selected ticket
      try {
        const ticketResponse = await adminAPI.getTicketById(selectedTicket.id);
        setSelectedTicket(ticketResponse.data);
      } catch (ticketError) {
        console.error('Error fetching updated ticket:', ticketError);
        // Fallback to finding in tickets array
        const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
        if (updatedTicket) {
          setSelectedTicket(updatedTicket);
        }
      }
    } catch (error: any) {
      console.error('Send message error:', error);
      setError(t('support.messageSendError'));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedTicket || !newStatus) return;

    try {
      setUpdatingStatus(true);
      await adminAPI.updateTicketStatus(selectedTicket.id, {
        status: newStatus as any,
        adminNote: adminNote || undefined
      });
      
      setSuccess(t('support.statusUpdatedSuccess'));
      setAdminNote('');
      // Refresh tickets
      await fetchTickets();
      // Update selected ticket
      const updatedTicket = tickets.find(t => t.id === selectedTicket.id);
      if (updatedTicket) {
        setSelectedTicket({ ...updatedTicket, status: newStatus as any });
      }
    } catch (error: any) {
      console.error('Update status error:', error);
      setError(t('support.statusUpdateError'));
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('tr-TR');
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/admin')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <SupportIcon sx={{ mr: 2, fontSize: 32 }} />
        <Typography variant="h4" component="h1">
          {t('support.supportSystemManagement')}
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('support.status')}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label={t('support.status')}
              >
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('support.category')}</InputLabel>
              <Select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                label={t('support.category')}
              >
                {categoryOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel>{t('support.priority')}</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label={t('support.priority')}
              >
                {priorityOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Button
              variant="outlined"
              onClick={() => {
                setStatusFilter('');
                setCategoryFilter('');
                setPriorityFilter('');
                setPage(1);
              }}
              fullWidth
            >
              {t('support.clearFilters')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Tickets Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>{t('support.user')}</TableCell>
                <TableCell>{t('support.subject')}</TableCell>
                <TableCell>{t('support.category')}</TableCell>
                <TableCell>{t('support.priority')}</TableCell>
                <TableCell>{t('support.status')}</TableCell>
                <TableCell>{t('support.createdAt')}</TableCell>
                <TableCell>{t('support.lastUpdate')}</TableCell>
                <TableCell>{t('support.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    <Typography variant="body2" color="text.secondary">
                      {t('support.noTicketsFound')}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow key={ticket.id} hover>
                    <TableCell>{ticket.id}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {ticket.user.firstName} {ticket.user.lastName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ maxWidth: 200 }} noWrap>
                        {ticket.subject}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={categoryOptions.find(c => c.value === ticket.category)?.label || ticket.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={priorityOptions.find(p => p.value === ticket.priority)?.label || ticket.priority}
                        color={getPriorityColor(ticket.priority) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={statusOptions.find(s => s.value === ticket.status)?.label || ticket.status}
                        color={getStatusColor(ticket.status) as any}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(ticket.createdAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption">
                        {formatDate(ticket.updatedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleTicketClick(ticket)}
                        color="primary"
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
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

      {/* Ticket Detail Dialog */}
      <Dialog
        open={showTicketDialog}
        onClose={() => setShowTicketDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTicket && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {t('support.supportTicket')} #{selectedTicket.id}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip
                    label={statusOptions.find(s => s.value === selectedTicket.status)?.label}
                    color={getStatusColor(selectedTicket.status) as any}
                    size="small"
                  />
                  <Chip
                    label={priorityOptions.find(p => p.value === selectedTicket.priority)?.label}
                    color={getPriorityColor(selectedTicket.priority) as any}
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="subtitle1" sx={{ mt: 1 }}>
                {selectedTicket.subject}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {t('support.user')}: {selectedTicket.user.firstName} {selectedTicket.user.lastName} ({selectedTicket.user.email})
              </Typography>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                {/* Messages */}
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    {t('support.messages')}
                  </Typography>
                  <Card variant="outlined" sx={{ maxHeight: 400, overflow: 'auto' }}>
                    <List>
                      {selectedTicket.messages.map((message, index) => (
                        <React.Fragment key={message.id}>
                          <ListItem alignItems="flex-start">
                            <Avatar sx={{ mr: 2, bgcolor: message.senderType === 'admin' ? 'primary.main' : 'secondary.main' }}>
                              {message.senderType === 'admin' ? <AdminIcon /> : <PersonIcon />}
                            </Avatar>
                            <ListItemText
                              primary={
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="subtitle2">
                                    {message.sender.firstName} {message.sender.lastName}
                                    <Chip
                                      label={message.senderType === 'admin' ? t('support.admin') : t('support.user')}
                                      size="small"
                                      sx={{ ml: 1 }}
                                      color={message.senderType === 'admin' ? 'primary' : 'default'}
                                    />
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    {formatDate(message.createdAt)}
                                  </Typography>
                                </Box>
                              }
                              secondary={
                                <Typography variant="body2" sx={{ mt: 1, whiteSpace: 'pre-wrap' }}>
                                  {message.message}
                                </Typography>
                              }
                            />
                          </ListItem>
                          {index < selectedTicket.messages.length - 1 && <Divider />}
                        </React.Fragment>
                      ))}
                    </List>
                  </Card>

                  {/* Send Message */}
                  <Box sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label={t('support.newMessage')}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={t('support.writeMessageToUser')}
                    />
                    <Button
                      variant="contained"
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendingMessage}
                      startIcon={sendingMessage ? <CircularProgress size={20} /> : <SendIcon />}
                      sx={{ mt: 1 }}
                    >
                      {sendingMessage ? t('support.sending') : t('support.sendMessage')}
                    </Button>
                  </Box>
                </Grid>

                {/* Status Update */}
                <Grid item xs={12} md={4}>
                  <Typography variant="h6" gutterBottom>
                    {t('support.updateStatus')}
                  </Typography>
                  <Card variant="outlined" sx={{ p: 2 }}>
                    <FormControl fullWidth sx={{ mb: 2 }}>
                      <InputLabel>{t('support.newStatus')}</InputLabel>
                      <Select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        label={t('support.newStatus')}
                      >
                        {statusOptions.slice(1).map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      multiline
                      rows={3}
                      label={t('support.adminNoteOptional')}
                      value={adminNote}
                      onChange={(e) => setAdminNote(e.target.value)}
                      placeholder={t('support.statusChangeNote')}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      onClick={handleUpdateStatus}
                      disabled={!newStatus || newStatus === selectedTicket.status || updatingStatus}
                      fullWidth
                    >
                      {updatingStatus ? t('support.updating') : t('support.updateStatus')}
                    </Button>
                  </Card>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowTicketDialog(false)}>
                {t('common.close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default AdminSupport;