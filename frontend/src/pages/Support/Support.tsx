import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  IconButton,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Support as SupportIcon,
  Send,
  AttachFile,
  Person,
  AdminPanelSettings,
  Schedule,
  PriorityHigh,
  Message,
  Add,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { supportAPI } from '../../services/api';
import type { RootState } from '../../store';

interface SupportMessage {
  id: number;
  ticketId: number;
  senderId: number;
  senderType: 'user' | 'admin';
  message: string;
  attachments?: string[];
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

interface NewTicketData {
  subject: string;
  category: string;
  priority: string;
  message: string;
  attachments: File[];
}

const Support: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useSelector((state: RootState) => state.auth);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [newTicketData, setNewTicketData] = useState<NewTicketData>({
    subject: '',
    category: 'general',
    priority: 'medium',
    message: '',
    attachments: []
  });
  
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showNewTicket, setShowNewTicket] = useState(false);

  const categories = [
    { value: 'general', label: t('support.categoryGeneral') },
    { value: 'account', label: t('support.categoryAccount') },
    { value: 'deposit', label: t('support.categoryDeposit') },
    { value: 'kyc', label: t('support.categoryKyc') },
    { value: 'trading', label: t('support.categoryTrading') },
    { value: 'technical', label: t('support.categoryTechnical') },
    { value: 'complaint', label: t('support.categoryComplaint') }
  ];

  const priorities = [
    { value: 'low', label: t('support.priorityLow'), color: 'success' },
    { value: 'medium', label: t('support.priorityMedium'), color: 'warning' },
    { value: 'high', label: t('support.priorityHigh'), color: 'error' },
    { value: 'urgent', label: t('support.priorityUrgent'), color: 'error' }
  ];

  useEffect(() => {
    fetchTickets();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [selectedTicket?.messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await supportAPI.getTickets({ page: 1, limit: 20 });
      // Backend returns { success: true, data: [...] }
      const ticketsData = response.data.data || response.data.tickets || response.data;
      setTickets(Array.isArray(ticketsData) ? ticketsData : []);
    } catch (error: any) {
      console.error('Tickets fetch error:', error);
      setTickets([]);
      setError(error.response?.data?.message || t('support.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicketData.subject.trim() || !newTicketData.message.trim()) {
      setError(t('support.requiredFields'));
      return;
    }
    
    try {
      setSubmitting(true);
      setError('');
      
      // Create ticket using supportAPI
      const response = await supportAPI.createTicket({
        subject: newTicketData.subject,
        category: newTicketData.category,
        priority: newTicketData.priority,
        message: newTicketData.message,
        attachments: newTicketData.attachments
      });
      
      // Backend returns { success: true, data: ticket }
      const newTicket: SupportTicket = response.data.data || response.data;
      
      setTickets(prev => [newTicket, ...prev]);
      setSelectedTicket(newTicket);
      setSuccess(t('support.ticketCreated'));
      setShowNewTicket(false);
      
      // Reset form
      setNewTicketData({
        subject: '',
        category: 'general',
        priority: 'medium',
        message: '',
        attachments: []
      });
      
    } catch (error: any) {
      console.error('Create ticket error:', error);
      setError(t('support.ticketCreateError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleTicketSelect = async (ticket: SupportTicket) => {
    try {
      // Fetch fresh ticket data to ensure we have the latest messages
      const response = await supportAPI.getTicket(ticket.id);
      const freshTicket = response.data.data || response.data;
      setSelectedTicket(freshTicket);
    } catch (error) {
      console.error('Error fetching ticket details:', error);
      // Fallback to the ticket from the list
      setSelectedTicket(ticket);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    
    try {
      setSendingMessage(true);
      
      // Send message using supportAPI
      const response = await supportAPI.sendMessage(selectedTicket.id, {
        message: newMessage
      });
      
      setNewMessage('');
      
      // Refresh tickets to get updated data including any admin messages
      await fetchTickets();
      
      // Update selected ticket with fresh data from server
      const refreshedTickets = await supportAPI.getTickets({ page: 1, limit: 20 });
      const ticketsData = refreshedTickets.data.data || refreshedTickets.data.tickets || refreshedTickets.data;
      const refreshedTicket = Array.isArray(ticketsData) ? ticketsData.find(t => t.id === selectedTicket.id) : null;
      if (refreshedTicket) {
        setSelectedTicket(refreshedTicket);
        // Also update the tickets list
        setTickets(prev => prev.map(ticket => 
          ticket.id === selectedTicket.id ? refreshedTicket : ticket
        ));
      }
      
    } catch (error: any) {
      console.error('Send message error:', error);
      setError(t('support.messageError'));
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'info';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return t('support.statusOpen');
      case 'in_progress': return t('support.statusInProgress');
      case 'resolved': return t('support.statusResolved');
      case 'closed': return t('support.statusClosed');
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    const p = priorities.find(p => p.value === priority);
    return p?.color || 'default';
  };

  const getPriorityText = (priority: string) => {
    const p = priorities.find(p => p.value === priority);
    return p?.label || priority;
  };

  const getCategoryText = (category: string) => {
    const c = categories.find(c => c.value === category);
    return c?.label || category;
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

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t('support.title')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('support.description')}
        </Typography>
      </Box>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Ticket List */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ pb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">
                  {t('support.supportRequests')}
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Add />}
                  onClick={() => setShowNewTicket(true)}
                >
                  {t('support.new')}
                </Button>
              </Box>
            </CardContent>
            
            <Box sx={{ flex: 1, overflow: 'auto' }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress />
                </Box>
              ) : tickets.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4, px: 2 }}>
                  <SupportIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    {t('support.noTickets')}
                  </Typography>
                  <Button
                    variant="outlined"
                    startIcon={<Add />}
                    onClick={() => setShowNewTicket(true)}
                    sx={{ mt: 2 }}
                  >
                    {t('support.createFirstTicket')}
                  </Button>
                </Box>
              ) : (
                <List sx={{ p: 0 }}>
                  {tickets.map((ticket) => (
                    <ListItem
                      key={ticket.id}
                      button={true}
                      selected={selectedTicket?.id === ticket.id}
                      onClick={() => handleTicketSelect(ticket)}
                      sx={{
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <>
                            <Typography variant="subtitle2" noWrap>
                              {ticket.subject}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                              <Chip
                                label={getStatusText(ticket.status)}
                                color={getStatusColor(ticket.status) as any}
                                size="small"
                              />
                              <Chip
                                label={getPriorityText(ticket.priority)}
                                color={getPriorityColor(ticket.priority) as any}
                                size="small"
                              />
                            </Box>
                          </>
                        }
                        secondary={
                          <Typography variant="caption" color="text.secondary">
                            {getCategoryText(ticket.category)} • {formatDate(ticket.updatedAt)}
                          </Typography>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Chat Area */}
        <Grid item xs={12} md={8}>
          {showNewTicket ? (
            <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {t('support.newTicket')}
                </Typography>
                
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('support.subject')}
                      value={newTicketData.subject}
                      onChange={(e) => setNewTicketData(prev => ({ ...prev, subject: e.target.value }))}
                      placeholder={t('support.subjectPlaceholder')}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('support.category')}</InputLabel>
                      <Select
                        value={newTicketData.category}
                        onChange={(e) => setNewTicketData(prev => ({ ...prev, category: e.target.value }))}
                        label={t('support.category')}
                      >
                        {categories.map((category) => (
                          <MenuItem key={category.value} value={category.value}>
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>{t('support.priority')}</InputLabel>
                      <Select
                        value={newTicketData.priority}
                        onChange={(e) => setNewTicketData(prev => ({ ...prev, priority: e.target.value }))}
                        label={t('support.priority')}
                      >
                        {priorities.map((priority) => (
                          <MenuItem key={priority.value} value={priority.value}>
                            {priority.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label={t('support.message')}
                      multiline
                      rows={8}
                      value={newTicketData.message}
                      onChange={(e) => setNewTicketData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder={t('support.messagePlaceholder')}
                    />
                  </Grid>
                </Grid>
                
                <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                  <Button
                    onClick={() => setShowNewTicket(false)}
                    disabled={submitting}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="contained"
                    onClick={handleCreateTicket}
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} /> : <Send />}
                  >
                      {submitting ? t('support.creating') : t('support.createTicket')}
                    </Button>
                </Box>
              </CardContent>
            </Card>
          ) : selectedTicket ? (
            <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column' }}>
              {/* Chat Header */}
              <CardContent sx={{ pb: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <Box>
                    <Typography variant="h6" gutterBottom>
                      {selectedTicket.subject}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={getStatusText(selectedTicket.status)}
                        color={getStatusColor(selectedTicket.status) as any}
                        size="small"
                      />
                      <Chip
                        label={getPriorityText(selectedTicket.priority)}
                        color={getPriorityColor(selectedTicket.priority) as any}
                        size="small"
                      />
                      <Chip
                        label={getCategoryText(selectedTicket.category)}
                        variant="outlined"
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    #{selectedTicket.id}
                  </Typography>
                </Box>
              </CardContent>
              
              {/* Messages */}
              <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
                {selectedTicket.messages.map((message) => (
                  <Box
                    key={message.id}
                    sx={{
                      display: 'flex',
                      mb: 2,
                      justifyContent: message.senderType === 'user' ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <Box
                      sx={{
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: message.senderType === 'user' ? 'row-reverse' : 'row',
                        alignItems: 'flex-start',
                        gap: 1
                      }}
                    >
                      <Avatar
                        sx={{
                          bgcolor: message.senderType === 'user' ? 'primary.main' : 'secondary.main',
                          width: 32,
                          height: 32
                        }}
                      >
                        {message.senderType === 'user' ? <Person /> : <AdminPanelSettings />}
                      </Avatar>
                      <Box>
                        <Paper
                          sx={{
                            p: 2,
                            bgcolor: message.senderType === 'user' ? 'primary.light' : 'grey.100',
                            color: message.senderType === 'user' ? 'primary.contrastText' : 'text.primary'
                          }}
                        >
                          <Typography variant="body2">
                            {message.message}
                          </Typography>
                        </Paper>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            textAlign: message.senderType === 'user' ? 'right' : 'left'
                          }}
                        >
                          {formatDate(message.createdAt)}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
                <div ref={messagesEndRef} />
              </Box>
              
              {/* Message Input */}
              <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    placeholder={t('support.typeMessage')}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    multiline
                    maxRows={3}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small">
                            <AttachFile />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                  />
                  <Button
                    variant="contained"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendingMessage}
                    sx={{ minWidth: 'auto', px: 2 }}
                  >
                    {sendingMessage ? <CircularProgress size={20} /> : <Send />}
                  </Button>
                </Box>
              </Box>
            </Card>
          ) : (
            <Card sx={{ height: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <SupportIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  {t('support.selectTicket')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('support.selectTicketDescription')}
                </Typography>
              </Box>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default Support;