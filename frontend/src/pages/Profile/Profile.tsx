import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Chip,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Input,
} from '@mui/material';
import {
  Person,
  Edit,
  Security,
  VerifiedUser,
  Pending,
  Error as ErrorIcon,
  CloudUpload,
  PhotoCamera,
  AccountBalance,
  HourglassEmpty,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import { updateProfile, changePassword } from '../../store/slices/authSlice';
import { userAPI, depositAPI } from '../../services/api';
import LoadingSpinner from '../../components/UI/LoadingSpinner';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  
  const { user, loading } = useSelector((state: RootState) => state.auth);
  
  const [editMode, setEditMode] = useState(false);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [kycDialog, setKycDialog] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [kycData, setKycData] = useState({
    identityNumber: '',
    dateOfBirth: '',
    address: '',
    documentType: 'identity_card',
    documentNumber: '',
    documentFront: null as File | null,
    documentBack: null as File | null,
    selfie: null as File | null,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState('');
  const [kycSubmitting, setKycSubmitting] = useState(false);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [depositLoading, setDepositLoading] = useState(false);
  const [totalBalance, setTotalBalance] = useState(0);
  const [pendingDeposits, setPendingDeposits] = useState<any[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(localStorage.getItem('language') || 'tr');

  const validateProfileForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!profileData.firstName.trim()) {
      newErrors.firstName = t('auth.firstNameRequired');
    }
    
    if (!profileData.lastName.trim()) {
      newErrors.lastName = t('auth.lastNameRequired');
    }
    
    if (!profileData.email) {
      newErrors.email = t('auth.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(profileData.email)) {
      newErrors.email = t('auth.emailInvalid');
    }
    
    if (!profileData.phone) {
      newErrors.phone = t('auth.phoneRequired');
    } else if (!/^[+]?[0-9]{10,15}$/.test(profileData.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('auth.phoneInvalid');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateKycForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!kycData.identityNumber.trim() || kycData.identityNumber.length !== 11) {
      newErrors.identityNumber = t('profile.identityNumberError');
    }
    
    if (!kycData.dateOfBirth) {
      newErrors.dateOfBirth = t('profile.dateOfBirthRequired');
    }
    
    if (!kycData.address.trim()) {
      newErrors.address = t('profile.addressRequired');
    }
    
    if (!kycData.documentNumber.trim()) {
      newErrors.documentNumber = t('profile.documentNumberRequired');
    }
    
    if (!kycData.documentFront) {
      newErrors.documentFront = t('profile.documentFrontRequired');
    }
    
    if (!kycData.selfie) {
        newErrors.selfie = t('profile.selfieRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (field: string, file: File | null) => {
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          [field]: 'Sadece JPG, JPEG ve PNG dosyaları kabul edilir'
        }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setErrors(prev => ({
          ...prev,
          [field]: 'Dosya boyutu 5MB\'dan küçük olmalıdır'
        }));
        return;
      }
      
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    setKycData(prev => ({
      ...prev,
      [field]: file
    }));
  };

  const handleKycSubmit = async () => {
    if (!validateKycForm()) return;
    
    try {
      setKycSubmitting(true);
      setErrors({});
      
      const formData = new FormData();
      formData.append('identityNumber', kycData.identityNumber);
      formData.append('dateOfBirth', kycData.dateOfBirth);
      formData.append('address', kycData.address);
      formData.append('documentType', kycData.documentType);
      formData.append('documentNumber', kycData.documentNumber);
      
      if (kycData.documentFront) {
        formData.append('documentFront', kycData.documentFront);
      }
      if (kycData.documentBack) {
        formData.append('documentBack', kycData.documentBack);
      }
      if (kycData.selfie) {
        formData.append('selfie', kycData.selfie);
      }
      
      await userAPI.submitKyc(formData);
      
      setSuccess(t('profile.kycSubmitSuccess'));
      setKycDialog(false);
      
      // Reset form
      setKycData({
        identityNumber: '',
        dateOfBirth: '',
        address: '',
        documentType: 'identity_card',
        documentNumber: '',
        documentFront: null,
        documentBack: null,
        selfie: null,
      });
      
      // Refresh user data
      window.location.reload();
      
    } catch (error: any) {
      console.error('KYC submission error:', error);
      setErrors({ submit: error.response?.data?.error || t('profile.kycSubmitError') });
    } finally {
      setKycSubmitting(false);
    }
  };

  const validatePasswordForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!passwordData.currentPassword) {
      newErrors.currentPassword = t('profile.currentPassword') + ' ' + t('auth.passwordRequired').toLowerCase();
    }
    
    if (!passwordData.newPassword) {
      newErrors.newPassword = t('auth.passwordRequired');
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = t('auth.passwordTooShort');
    }
    
    if (!passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = t('auth.passwordRequired');
    } else if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      newErrors.confirmNewPassword = t('auth.passwordsNotMatch');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfileForm()) return;
    
    try {
      await dispatch(updateProfile(profileData) as any).unwrap();
      setEditMode(false);
      setSuccess(t('profile.profileUpdated'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleLanguageChange = (event: any) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
    i18n.changeLanguage(newLanguage);
    setSuccess(t('profile.languageChanged'));
    setTimeout(() => setSuccess(''), 3000);
  };

  const getLanguageName = (code: string) => {
    const languages: { [key: string]: string } = {
      tr: t('profile.languageTurkish'),
      en: t('profile.languageEnglish'),
      de: t('profile.languageGerman'),
      fr: t('profile.languageFrench'),
      es: t('profile.languageSpanish')
    };
    return languages[code] || code;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) return;
    
    try {
      await dispatch(changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      }) as any).unwrap();
      
      setPasswordDialog(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
      setSuccess(t('profile.passwordChanged'));
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      // Error handled by slice
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const fetchUserDeposits = async () => {
    try {
      setDepositLoading(true);
      const response = await depositAPI.getUserDeposits();
      const depositsData = response.data.deposits || [];
      
      setDeposits(depositsData);
      
      // Calculate total approved balance
      const approvedDeposits = depositsData.filter((deposit: any) => deposit.status === 'approved');
      const total = approvedDeposits.reduce((sum: number, deposit: any) => sum + parseFloat(deposit.amount), 0);
      setTotalBalance(total);
      
      // Get pending deposits
      const pending = depositsData.filter((deposit: any) => deposit.status === 'pending');
      setPendingDeposits(pending);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setDepositLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchUserDeposits();
    }
  }, [user]);

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <VerifiedUser />;
      case 'pending':
        return <Pending />;
      case 'rejected':
        return <ErrorIcon />;
      default:
        return <Person />;
    }
  };

  if (loading && !user) {
    return <LoadingSpinner />;
  }

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {t('profile.title')}
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                {t('profile.personalInfo')}
              </Typography>
              <Button
                variant={editMode ? 'outlined' : 'contained'}
                startIcon={<Edit />}
                onClick={() => {
                  if (editMode) {
                    setProfileData({
                      firstName: user?.firstName || '',
                      lastName: user?.lastName || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                    });
                  }
                  setEditMode(!editMode);
                }}
              >
                {editMode ? t('common.cancel') : t('common.edit')}
              </Button>
            </Box>

            <Box component="form" onSubmit={handleProfileSubmit}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('auth.firstName')}
                    name="firstName"
                    value={profileData.firstName}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    error={!!errors.firstName}
                    helperText={errors.firstName}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t('auth.lastName')}
                    name="lastName"
                    value={profileData.lastName}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    error={!!errors.lastName}
                    helperText={errors.lastName}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={t('auth.email')}
                    name="email"
                    value={profileData.email}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    error={!!errors.email}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={t('auth.phone')}
                    name="phone"
                    value={profileData.phone}
                    onChange={handleProfileChange}
                    disabled={!editMode}
                    error={!!errors.phone}
                    helperText={errors.phone}
                  />
                </Grid>
              </Grid>

              {editMode && (
                <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading}
                  >
                    {loading ? <CircularProgress size={24} /> : t('profile.updateProfile')}
                  </Button>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Profile Summary */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{ width: 80, height: 80, mx: 'auto', mb: 2, bgcolor: 'primary.main' }}
              >
                <Person sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6">
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {user?.email}
              </Typography>
            </CardContent>
          </Card>

          {/* KYC Status */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('profile.kycStatus')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  icon={getKycStatusIcon(user?.kyc?.status || 'pending')}
                  label={t(`profile.kyc${user?.kyc?.status?.charAt(0).toUpperCase()}${user?.kyc?.status?.slice(1)}` || t('profile.kycPending'))}
                  color={getKycStatusColor(user?.kyc?.status || 'pending') as any}
                />
              </Box>
              {(!user?.kyc || user?.kyc?.status === 'rejected') && (
                <Button
                  variant="outlined"
                  startIcon={<CloudUpload />}
                  sx={{ mt: 2 }}
                  fullWidth
                  onClick={() => setKycDialog(true)}
                >
                  {t('profile.uploadDocuments')}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Balance & Deposits */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('profile.balanceDeposits')}
              </Typography>
              
              {/* Total Balance */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <AccountBalance color="primary" />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {t('profile.totalBalance')}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    {depositLoading ? (
                      <CircularProgress size={16} />
                    ) : (
                      `₺${totalBalance.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`
                    )}
                  </Typography>
                </Box>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Pending Deposits */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <HourglassEmpty color="warning" />
                <Typography variant="body2" color="text.secondary">
                  {t('profile.pendingDeposits')} ({pendingDeposits.length})
                </Typography>
              </Box>
              
              {depositLoading ? (
                <CircularProgress size={20} />
              ) : pendingDeposits.length > 0 ? (
                <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                  {pendingDeposits.map((deposit: any) => (
                    <Box key={deposit.id} sx={{ 
                      p: 1, 
                      border: '1px solid', 
                      borderColor: 'divider', 
                      borderRadius: 1, 
                      mb: 1,
                      fontSize: '0.875rem'
                    }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2">
                          ₺{parseFloat(deposit.amount).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </Typography>
                        <Chip 
                          label={t('common.pending')} 
                          size="small" 
                          color="warning" 
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(deposit.createdAt).toLocaleDateString('tr-TR')}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                  {t('profile.noPendingDeposits')}
                </Typography>
              )}
            </CardContent>
          </Card>

          {/* Language Settings */}
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('profile.language')}
              </Typography>
              <FormControl fullWidth>
                <InputLabel>{t('profile.selectLanguage')}</InputLabel>
                <Select
                  value={selectedLanguage}
                  label={t('profile.selectLanguage')}
                  onChange={handleLanguageChange}
                >
                  <MenuItem value="tr">🇹🇷 Türkçe</MenuItem>
                  <MenuItem value="en">🇺🇸 English</MenuItem>
                  <MenuItem value="de">🇩🇪 Deutsch</MenuItem>
                  <MenuItem value="fr">🇫🇷 Français</MenuItem>
                  <MenuItem value="es">🇪🇸 Español</MenuItem>
                </Select>
              </FormControl>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                {t('settings.security')}
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Security />}
                onClick={() => setPasswordDialog(true)}
                fullWidth
              >
                {t('profile.changePassword')}
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Change Password Dialog */}
      <Dialog
        open={passwordDialog}
        onClose={() => setPasswordDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {t('profile.changePassword')}
        </DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handlePasswordSubmit} sx={{ pt: 1 }}>
            <TextField
              fullWidth
              label={t('profile.currentPassword')}
              name="currentPassword"
              type="password"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              error={!!errors.currentPassword}
              helperText={errors.currentPassword}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('profile.newPassword')}
              name="newPassword"
              type="password"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              error={!!errors.newPassword}
              helperText={errors.newPassword}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label={t('profile.confirmNewPassword')}
              name="confirmNewPassword"
              type="password"
              value={passwordData.confirmNewPassword}
              onChange={handlePasswordChange}
              error={!!errors.confirmNewPassword}
              helperText={errors.confirmNewPassword}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handlePasswordSubmit}
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : t('common.save')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* KYC Dialog */}
      <Dialog open={kycDialog} onClose={() => setKycDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" gap={1}>
            <VerifiedUser color="primary" />
            {t('profile.kycDocumentUpload')}
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t('profile.identityNumber')}
                  value={kycData.identityNumber}
                  onChange={(e) => setKycData(prev => ({ ...prev, identityNumber: e.target.value }))}
                  error={!!errors.identityNumber}
                  helperText={errors.identityNumber}
                  inputProps={{ maxLength: 11 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t('profile.dateOfBirth')}
                  type="date"
                  value={kycData.dateOfBirth}
                  onChange={(e) => setKycData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  error={!!errors.dateOfBirth}
                  helperText={errors.dateOfBirth}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  label={t('profile.address')}
                  multiline
                  rows={3}
                  value={kycData.address}
                  onChange={(e) => setKycData(prev => ({ ...prev, address: e.target.value }))}
                  error={!!errors.address}
                  helperText={errors.address}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <FormControl fullWidth>
                  <InputLabel>{t('profile.documentType')}</InputLabel>
                  <Select
                    value={kycData.documentType}
                    onChange={(e) => setKycData(prev => ({ ...prev, documentType: e.target.value }))}
                    label={t('profile.documentType')}
                  >
                    <MenuItem value="identity_card">{t('profile.identityCard')}</MenuItem>
                    <MenuItem value="passport">{t('profile.passport')}</MenuItem>
                    <MenuItem value="driving_license">{t('profile.drivingLicense')}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label={t('profile.documentNumber')}
                  value={kycData.documentNumber}
                  onChange={(e) => setKycData(prev => ({ ...prev, documentNumber: e.target.value }))}
                  error={!!errors.documentNumber}
                  helperText={errors.documentNumber}
                />
              </Grid>
              
              {/* File Upload Sections */}
              <Grid size={12}>
                <Typography variant="h6" gutterBottom>
                  {t('profile.documentPhotos')}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t('profile.acceptedFormats')}
                </Typography>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Input
                    id="document-front-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0] || null;
                      handleFileChange('documentFront', file);
                    }}
                    sx={{ display: 'none' }}
                  />
                  <label htmlFor="document-front-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      {t('profile.documentFront')}
                    </Button>
                  </label>
                  {kycData.documentFront && (
                    <Typography variant="body2" color="success.main">
                      ✓ {kycData.documentFront.name}
                    </Typography>
                  )}
                  {errors.documentFront && (
                    <Typography variant="body2" color="error">
                      {errors.documentFront}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box>
                  <Input
                    id="document-back-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0] || null;
                      handleFileChange('documentBack', file);
                    }}
                    sx={{ display: 'none' }}
                  />
                  <label htmlFor="document-back-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      {t('profile.documentBack')}
                    </Button>
                  </label>
                  {kycData.documentBack && (
                    <Typography variant="body2" color="success.main">
                      ✓ {kycData.documentBack.name}
                    </Typography>
                  )}
                  {errors.documentBack && (
                    <Typography variant="body2" color="error">
                      {errors.documentBack}
                    </Typography>
                  )}
                </Box>
              </Grid>
              
              <Grid size={12}>
                <Box>
                  <Input
                    id="selfie-upload"
                    type="file"
                    accept=".jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = (e.target as HTMLInputElement).files?.[0] || null;
                      handleFileChange('selfie', file);
                    }}
                    sx={{ display: 'none' }}
                  />
                  <label htmlFor="selfie-upload">
                    <Button
                      variant="outlined"
                      component="span"
                      startIcon={<PhotoCamera />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      {t('profile.selfiePhoto')}
                    </Button>
                  </label>
                  {kycData.selfie && (
                    <Typography variant="body2" color="success.main">
                      ✓ {kycData.selfie.name}
                    </Typography>
                  )}
                  {errors.selfie && (
                    <Typography variant="body2" color="error">
                      {errors.selfie}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
            
            {errors.submit && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {errors.submit}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKycDialog(false)} disabled={kycSubmitting}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleKycSubmit}
            variant="contained"
            disabled={kycSubmitting}
            startIcon={kycSubmitting ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {kycSubmitting ? t('profile.uploading') : t('profile.uploadDocuments')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile;