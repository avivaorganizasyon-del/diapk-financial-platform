import React, { useState } from 'react';
import {
  Container,
  Paper,
  Box,
  TextField,
  Button,
  Typography,
  Link,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Avatar,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Phone,
  Lock,
  Visibility,
  VisibilityOff,
  BusinessCenter,
  Email,
} from '@mui/icons-material';
import PhoneInput from '../../components/PhoneInput';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import { login } from '../../store/slices/authSlice';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    phone: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.phone) {
      newErrors.phone = 'Telefon numarası gereklidir';
    } else if (!/^[+]?[0-9]{7,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Geçerli bir telefon numarası giriniz';
    }
    
    if (!formData.password) {
      newErrors.password = t('auth.passwordRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const loginData = {
        phone: formData.phone,
        password: formData.password,
      };
      
      const result = await dispatch(login(loginData) as any).unwrap();
      
      // Only allow regular users, redirect admins to admin login
      if (result && result.user && result.user.role === 'admin') {
        navigate('/admin-login');
      } else {
        navigate('/user/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      // Error is handled by the slice
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rememberMe' ? checked : value,
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 50%, #5c6bc0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      py: { xs: 2, md: 4 },
    }}>
      <Container component="main" maxWidth="sm">
        <Card sx={{
          borderRadius: 4,
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
          overflow: 'hidden',
          background: 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
        }}>
          {/* Header Section */}
          <Box sx={{
            background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
            color: 'white',
            py: 4,
            px: 3,
            textAlign: 'center',
            position: 'relative',
            overflow: 'hidden'
          }}>
            <Box sx={{
              position: 'absolute',
              top: -50,
              right: -50,
              width: 150,
              height: 150,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.1)',
            }} />
            <Box sx={{
              position: 'absolute',
              bottom: -30,
              left: -30,
              width: 100,
              height: 100,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.05)',
            }} />
            <Box sx={{ position: 'relative', zIndex: 1 }}>
              <Avatar sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 80,
                height: 80,
                mx: 'auto',
                mb: 2,
                fontSize: '2rem'
              }}>
                <BusinessCenter sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              <Typography component="h1" variant="h3" sx={{ 
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}>
                {t('common.appName')}
              </Typography>
              <Typography variant="h6" sx={{ 
                opacity: 0.9,
                fontWeight: 400
              }}>
                {t('auth.login')}
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  width: '100%', 
                  mb: 3,
                  borderRadius: 2,
                  '& .MuiAlert-message': {
                    fontWeight: 500
                  }
                }}
              >
                {typeof error === 'string' ? error : error?.message || 'Bir hata oluştu'}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <PhoneInput
                value={formData.phone}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, phone: value }));
                  if (errors.phone) {
                    setErrors(prev => ({ ...prev, phone: '' }));
                  }
                }}
                error={!!errors.phone}
                helperText={errors.phone}
                label="Telefon Numarası"
                required
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label={t('auth.password')}
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'primary.main' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(26, 35, 126, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(26, 35, 126, 0.04)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(26, 35, 126, 0.06)',
                    }
                  }
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    color="primary"
                    sx={{
                      '&.Mui-checked': {
                        color: 'primary.main',
                      }
                    }}
                  />
                }
                label={t('auth.rememberMe')}
                sx={{ 
                  mt: 2,
                  '& .MuiFormControlLabel-label': {
                    fontWeight: 500,
                    color: 'text.primary'
                  }
                }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{ 
                  mt: 4, 
                  mb: 3,
                  py: 1.5,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 8px 25px rgba(26, 35, 126, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0d47a1 0%, #1976d2 100%)',
                    boxShadow: '0 12px 35px rgba(26, 35, 126, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(0, 0, 0, 0.12)',
                  },
                  transition: 'all 0.3s ease'
                }}
                disabled={loading}
              >
                {loading ? (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={20} sx={{ color: 'white' }} />
                    <span>{t('auth.loggingIn')}</span>
                  </Box>
                ) : (
                  t('auth.login')
                )}
              </Button>
              <Box sx={{ 
                textAlign: 'center',
                p: 2,
                borderRadius: 2,
                bgcolor: 'rgba(26, 35, 126, 0.02)'
              }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  {t('auth.noAccount')}
                </Typography>
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => navigate('/register')}
                  sx={{ 
                    textDecoration: 'none',
                    fontWeight: 600,
                    color: 'primary.main',
                    '&:hover': {
                      color: 'primary.dark',
                    }
                  }}
                >
                  {t('auth.register')}
                </Link>
              </Box>
              
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate('/admin-login')}
                  sx={{
                    color: 'error.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    fontSize: '0.9rem',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Admin Girişi
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Login;