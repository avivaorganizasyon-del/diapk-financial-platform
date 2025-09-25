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
  Avatar,
} from '@mui/material';
import {
  Edit as EditIcon,
  Block as BlockIcon,
  CheckCircle as CheckCircleIcon,
  Search as SearchIcon,
  Add as AddIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { adminAPI } from '../../services/adminAPI';
import type { User } from '../../services/adminAPI';

const Users: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user' as 'user' | 'admin',
    inviteCode: ''
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminAPI.getUsers({
        page,
        limit: 10,
        search: searchTerm || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter ? statusFilter === 'active' : undefined,
      });
      setUsers(response.data.users);
      setTotalPages(response.data.totalPages);
    } catch (error: any) {
      console.error('Failed to fetch users:', error);
      setError(t('admin.users.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (userId: number, isActive: boolean) => {
    try {
      await adminAPI.updateUserStatus(userId, { isActive });
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to update user status:', error);
      setError(t('admin.users.statusUpdateError'));
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'success' : 'error';
  };

  const getStatusText = (isActive: boolean) => {
    return isActive ? t('common.active') : t('common.inactive');
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        password: '',
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || '',
        role: user.role as 'user' | 'admin',
        inviteCode: ''
      });
    } else {
      setSelectedUser(null);
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phone: '',
        role: 'user',
        inviteCode: ''
      });
    }
    setFormErrors({});
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedUser(null);
    setFormData({
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      inviteCode: ''
    });
    setFormErrors({});
  };

  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    
    if (!formData.email) {
      errors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('auth.emailInvalid');
    }
    
    if (!selectedUser && !formData.password) {
      errors.password = t('auth.passwordRequired');
    } else if (!selectedUser && formData.password.length < 6) {
      errors.password = t('auth.passwordTooShort');
    }
    
    if (!formData.firstName) {
      errors.firstName = t('auth.firstNameRequired');
    }
    
    if (!formData.lastName) {
      errors.lastName = t('auth.lastNameRequired');
    }
    
    if (!selectedUser && !formData.inviteCode) {
      errors.inviteCode = t('auth.inviteCodeRequired');
    } else if (!selectedUser && formData.inviteCode.length !== 12) {
      errors.inviteCode = t('admin.users.inviteCodeLength');
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    try {
      setSubmitting(true);
      setError(null);
      
      if (selectedUser) {
        // Update existing user
        const updateData: any = {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role
        };
        
        if (formData.phone) {
          updateData.phone = formData.phone;
        }
        
        await adminAPI.updateUser(selectedUser.id, updateData);
      } else {
        // Create new user
        const createData: any = {
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          inviteCode: formData.inviteCode
        };
        
        if (formData.phone) {
          createData.phone = formData.phone;
        }
        
        await adminAPI.createUser(createData);
      }
      
      handleCloseDialog();
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to save user:', error);
      setError(selectedUser ? t('admin.users.updateError') : t('admin.users.createError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
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
          {t('admin.userManagement')}
        </Typography>
        <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
            >
              {t('admin.addNewUser')}
            </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder={t('admin.users.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
            }}
            sx={{ minWidth: 250 }}
          />
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>{t('admin.users.role')}</InputLabel>
            <Select
              value={roleFilter}
              label={t('admin.users.role')}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="user">{t('admin.users.user')}</MenuItem>
              <MenuItem value="admin">{t('admin.users.admin')}</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>{t('common.status')}</InputLabel>
            <Select
              value={statusFilter}
              label={t('common.status')}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="">{t('common.all')}</MenuItem>
              <MenuItem value="active">{t('common.active')}</MenuItem>
              <MenuItem value="inactive">{t('common.inactive')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Paper>

      {/* Users Table */}
      <Paper sx={{ overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('admin.users.user')}</TableCell>
                    <TableCell>{t('auth.email')}</TableCell>
                    <TableCell>{t('auth.phone')}</TableCell>
                    <TableCell>{t('admin.users.role')}</TableCell>
                    <TableCell>{t('common.status')}</TableCell>
                    <TableCell>{t('admin.users.registrationDate')}</TableCell>
                    <TableCell align="center">{t('common.actions')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar sx={{ width: 40, height: 40 }}>
                            {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {user.firstName} {user.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ID: {user.id}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role === 'admin' ? t('admin.users.admin') : t('admin.users.user')}
                          color={user.role === 'admin' ? 'primary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getStatusText(user.isActive)}
                          color={getStatusColor(user.isActive)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {new Date(user.createdAt).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog(user)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => handleStatusChange(user.id, !user.isActive)}
                          size="small"
                          color={user.isActive ? 'error' : 'success'}
                        >
                          {user.isActive ? <BlockIcon /> : <CheckCircleIcon />}
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </>
        )}
      </Paper>

      {/* User Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? t('admin.editUser') : t('admin.addNewUser')}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label={t('common.email')}
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              margin="normal"
              required
            />
            
            {!selectedUser && (
              <TextField
                fullWidth
                label={t('auth.password')}
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                error={!!formErrors.password}
                helperText={formErrors.password}
                margin="normal"
                required
              />
            )}
            
            {!selectedUser && (
              <TextField
                fullWidth
                label={t('admin.inviteCode')}
                value={formData.inviteCode}
                onChange={(e) => handleInputChange('inviteCode', e.target.value.toUpperCase())}
                error={!!formErrors.inviteCode}
                helperText={formErrors.inviteCode}
                margin="normal"
                required
                inputProps={{ maxLength: 12 }}
                placeholder={t('admin.inviteCodePlaceholder')}
              />
            )}
            
            <TextField
              fullWidth
              label={t('auth.firstName')}
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              error={!!formErrors.firstName}
              helperText={formErrors.firstName}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label={t('auth.lastName')}
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              error={!!formErrors.lastName}
              helperText={formErrors.lastName}
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label={t('auth.phone')}
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              margin="normal"
              placeholder={t('auth.phonePlaceholder')}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>{t('admin.users.role')}</InputLabel>
              <Select
                value={formData.role}
                label={t('admin.users.role')}
                onChange={(e) => handleInputChange('role', e.target.value)}
              >
                <MenuItem value="user">{t('admin.users.user')}</MenuItem>
                <MenuItem value="admin">{t('admin.users.admin')}</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <CircularProgress size={20} />
            ) : (
              selectedUser ? t('common.update') : t('common.add')
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Users;