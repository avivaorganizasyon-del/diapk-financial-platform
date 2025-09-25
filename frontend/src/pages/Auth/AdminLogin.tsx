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
  Lock,
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
  Email,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import { login } from '../../store/slices/authSlice';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const { loading, error } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!formData.email) {
      newErrors.email = 'Email adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir email adresi giriniz';
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
        email: formData.email,
        password: formData.password,
      };
      
      const result = await dispatch(login(loginData) as any).unwrap();
      
      // Only allow admin users
      if (result && result.user && result.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        setErrors({ general: 'Bu sayfa sadece admin kullanıcıları içindir.' });
      }
    } catch (error) {
      console.error('Admin login error:', error);
      setErrors({ general: 'Giriş başarısız. Email ve şifrenizi kontrol ediniz.' });
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
      background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 50%, #ff5722 100%)',
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
            background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
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
                <AdminPanelSettings sx={{ fontSize: '2.5rem' }} />
              </Avatar>
              <Typography component="h1" variant="h3" sx={{ 
                fontWeight: 700,
                mb: 1,
                fontSize: { xs: '2rem', md: '2.5rem' }
              }}>
                Admin Paneli
              </Typography>
              <Typography variant="h6" sx={{ 
                opacity: 0.9,
                fontWeight: 400
              }}>
                Yönetici Girişi
              </Typography>
            </Box>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            
            {(error || errors.general) && (
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
                {errors.general || (typeof error === 'string' ? error : error?.message || 'Bir hata oluştu')}
              </Alert>
            )}
            
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Adresi"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email sx={{ color: 'error.main' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(211, 47, 47, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(211, 47, 47, 0.06)',
                    }
                  }
                }}
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
                      <Lock sx={{ color: 'error.main' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: 'error.main' }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 3,
                    backgroundColor: 'rgba(211, 47, 47, 0.02)',
                    '&:hover': {
                      backgroundColor: 'rgba(211, 47, 47, 0.04)',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'rgba(211, 47, 47, 0.06)',
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
                    sx={{
                      color: 'error.main',
                      '&.Mui-checked': {
                        color: 'error.main',
                      },
                    }}
                  />
                }
                label={t('auth.rememberMe')}
                sx={{ mt: 2, mb: 2 }}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  mb: 2,
                  py: 1.5,
                  borderRadius: 3,
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  background: 'linear-gradient(135deg, #d32f2f 0%, #f44336 100%)',
                  boxShadow: '0 8px 25px rgba(211, 47, 47, 0.3)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #c62828 0%, #e53935 100%)',
                    boxShadow: '0 12px 35px rgba(211, 47, 47, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  '&:disabled': {
                    background: 'rgba(211, 47, 47, 0.3)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? (
                  <CircularProgress size={24} sx={{ color: 'white' }} />
                ) : (
                  'Admin Girişi'
                )}
              </Button>
              
              <Box sx={{ textAlign: 'center', mt: 3 }}>
                <Link
                  component="button"
                  type="button"
                  onClick={() => navigate('/login')}
                  sx={{
                    color: 'error.main',
                    textDecoration: 'none',
                    fontWeight: 500,
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Kullanıcı girişine dön
                </Link>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default AdminLogin;