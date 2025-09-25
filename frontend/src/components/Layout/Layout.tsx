import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  useMediaQuery,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  TrendingUp as StocksIcon,
  BusinessCenter as IPOIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Brightness4,
  Brightness7,
  Language as LanguageIcon,
  People as PeopleIcon,
  VerifiedUser as VerifiedUserIcon,
  MonetizationOn as MonetizationOnIcon,
  Assessment as AssessmentIcon,
  AdminPanelSettings as AdminIcon,
  AccountBalance,
  Support as SupportIcon,
  Payment as PaymentIcon,
  Home as HomeIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import { toggleTheme, setLanguage } from '../../store/slices/uiSlice';

const drawerWidth = 240;
const mobileDrawerWidth = 280;

const Layout: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { t, i18n } = useTranslation();
  
  const { user } = useSelector((state: RootState) => state.auth);
  const { isDarkMode, language } = useSelector((state: RootState) => state.ui);
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const [bottomNavValue, setBottomNavValue] = useState(location.pathname);

  const userMenuItems = [
    { text: t('navigation.dashboard'), icon: <DashboardIcon />, path: '/user/dashboard' },
    { text: t('navigation.portfolio'), icon: <AccountBalance />, path: '/user/portfolio' },
    { text: t('navigation.stocks'), icon: <StocksIcon />, path: '/user/stocks' },
    { text: t('navigation.ipos'), icon: <IPOIcon />, path: '/user/ipos' },
    { text: t('navigation.deposit'), icon: <PaymentIcon />, path: '/user/deposit' },
    { text: t('navigation.support'), icon: <SupportIcon />, path: '/user/support' },
    { text: t('navigation.profile'), icon: <ProfileIcon />, path: '/user/profile' },
    { text: t('navigation.settings'), icon: <SettingsIcon />, path: '/user/settings' },
  ];

  // Mobile bottom navigation items (main 4 items)
  const mobileBottomNavItems = [
    { text: t('navigation.dashboard'), icon: <HomeIcon />, path: user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard' },
    { text: t('navigation.stocks'), icon: <StocksIcon />, path: user?.role === 'admin' ? '/admin/stocks' : '/user/stocks' },
    { text: t('navigation.portfolio'), icon: <AccountBalance />, path: user?.role === 'admin' ? '/admin/dashboard' : '/user/portfolio' },
    { text: t('navigation.ipos'), icon: <IPOIcon />, path: user?.role === 'admin' ? '/admin/ipos' : '/user/ipos' },
  ];

  const adminMenuItems = [
    { text: t('navigation.adminPanel'), icon: <AdminIcon />, path: '/admin/dashboard' },
    { text: t('navigation.userManagement'), icon: <PeopleIcon />, path: '/admin/users' },
    { text: t('navigation.kycReviews'), icon: <VerifiedUserIcon />, path: '/admin/kyc' },
    { text: t('navigation.ipoManagement'), icon: <IPOIcon />, path: '/admin/ipos' },
    { text: t('navigation.stockManagement'), icon: <StocksIcon />, path: '/admin/stocks' },
    { text: t('navigation.depositManagement'), icon: <MonetizationOnIcon />, path: '/admin/deposits' },
    { text: t('navigation.paymentMethods'), icon: <PaymentIcon />, path: '/admin/payment-methods' },
    { text: t('navigation.supportManagement'), icon: <SupportIcon />, path: '/admin/support' },
    { text: t('navigation.reports'), icon: <AssessmentIcon />, path: '/admin/reports' },
    { text: t('navigation.settings'), icon: <SettingsIcon />, path: '/admin/settings' },
  ];

  const menuItems = user?.role === 'admin' ? adminMenuItems : userMenuItems;

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLangMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleMenuClose();
    navigate('/login');
  };

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLanguageChange = (lang: 'tr' | 'en' | 'de' | 'fr' | 'es') => {
    dispatch(setLanguage(lang));
    i18n.changeLanguage(lang);
    handleLangMenuClose();
  };

  const handleBottomNavChange = (_event: React.SyntheticEvent, newValue: string) => {
    setBottomNavValue(newValue);
    navigate(newValue);
  };

  // Update bottom nav value when location changes
  React.useEffect(() => {
    setBottomNavValue(location.pathname);
  }, [location.pathname]);

  const drawer = (
    <div>
      <Toolbar sx={{ 
        background: isMobile ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
        color: isMobile ? 'white' : 'inherit',
        minHeight: isMobile ? 72 : 64,
        borderRadius: isMobile ? '0 0 16px 16px' : 0,
        mb: isMobile ? 1 : 0,
      }}>
        <Typography 
          variant={isMobile ? 'h5' : 'h6'} 
          noWrap 
          component="div"
          sx={{
            fontWeight: isMobile ? 700 : 500,
            letterSpacing: isMobile ? '0.5px' : 'normal',
          }}
        >
          {t('common.appName')}
        </Typography>
      </Toolbar>
      {!isMobile && <Divider />}
      <List sx={{ px: isMobile ? 1 : 0 }}>
        {menuItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                if (isMobile) setMobileOpen(false);
              }}
              sx={{
                minHeight: isMobile ? 64 : 48,
                borderRadius: isMobile ? 3 : 1,
                mx: isMobile ? 0.5 : 0.5,
                mb: isMobile ? 1 : 0.25,
                px: isMobile ? 2 : 1,
                '&:hover': {
                  backgroundColor: isMobile ? 'rgba(102, 126, 234, 0.12)' : 'rgba(102, 126, 234, 0.08)',
                  transform: isMobile ? 'translateX(6px) scale(1.02)' : 'none',
                  boxShadow: isMobile ? '0 4px 12px rgba(102, 126, 234, 0.2)' : 'none',
                },
                '&:active': {
                  transform: isMobile ? 'scale(0.96)' : 'none',
                },
                '&.Mui-selected': {
                  backgroundColor: isMobile ? 'rgba(102, 126, 234, 0.2)' : 'rgba(102, 126, 234, 0.12)',
                  boxShadow: isMobile ? '0 2px 8px rgba(102, 126, 234, 0.3)' : 'none',
                  '&:hover': {
                    backgroundColor: isMobile ? 'rgba(102, 126, 234, 0.25)' : 'rgba(102, 126, 234, 0.16)',
                  },
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ 
                minWidth: isMobile ? 56 : 40,
                color: location.pathname === item.path ? '#667eea' : 'inherit',
                '& .MuiSvgIcon-root': {
                  fontSize: isMobile ? '1.5rem' : '1.25rem',
                }
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: isMobile ? '1.1rem' : '0.875rem',
                  fontWeight: location.pathname === item.path ? 600 : 500,
                  letterSpacing: isMobile ? '0.25px' : 'normal',
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Mobile-first AppBar */}
      <AppBar
        position="fixed"
        sx={{
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: `${drawerWidth}px` },
          zIndex: theme.zIndex.drawer + 1,
          background: isMobile 
            ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            : undefined,
          boxShadow: isMobile 
            ? '0 4px 20px rgba(0,0,0,0.1)'
            : undefined,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { md: 'none' },
              minWidth: isMobile ? 48 : 40,
              minHeight: isMobile ? 48 : 40,
              borderRadius: isMobile ? 2 : 1,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                transform: isMobile ? 'scale(1.05)' : 'none',
              },
              '&:active': {
                transform: isMobile ? 'scale(0.95)' : 'none',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <MenuIcon sx={{ fontSize: isMobile ? '1.5rem' : '1.25rem' }} />
          </IconButton>
          
          <Typography 
            variant={isMobile ? 'h6' : 'h6'} 
            noWrap 
            component="div" 
            sx={{ 
              flexGrow: 1,
              fontWeight: isMobile ? 600 : 500,
              fontSize: isMobile ? '1.1rem' : '1.25rem'
            }}
          >
            {isMobile 
              ? (mobileBottomNavItems.find(item => item.path === location.pathname)?.text || t('common.appName'))
              : (menuItems.find(item => item.path === location.pathname)?.text || (user?.role === 'admin' ? t('navigation.adminPanel') : t('common.appName')))
            }
          </Typography>

          {/* Desktop controls */}
          {!isMobile && (
            <>
              <IconButton 
                color="inherit" 
                onClick={handleThemeToggle}
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                {isDarkMode ? <Brightness7 /> : <Brightness4 />}
              </IconButton>

              <IconButton 
                color="inherit" 
                onClick={handleLangMenuClick}
                sx={{
                  minWidth: 44,
                  minHeight: 44,
                  borderRadius: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    transform: 'scale(1.05)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <LanguageIcon />
              </IconButton>
            </>
          )}

          <IconButton 
            onClick={handleMenuClick}
            sx={{
              minWidth: isMobile ? 48 : 40,
              minHeight: isMobile ? 48 : 40,
              borderRadius: isMobile ? 2 : 1,
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)',
                transform: isMobile ? 'scale(1.05)' : 'none',
              },
              '&:active': {
                transform: isMobile ? 'scale(0.95)' : 'none',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Avatar sx={{ 
              width: isMobile ? 40 : 32, 
              height: isMobile ? 40 : 32,
              fontSize: isMobile ? '1.1rem' : '0.875rem',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
              boxShadow: isMobile ? '0 2px 8px rgba(0,0,0,0.15)' : 'none',
            }}>
              {user?.firstName?.charAt(0) || 'U'}
            </Avatar>
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ 
          width: { md: drawerWidth }, 
          flexShrink: { md: 0 }
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: { xs: mobileDrawerWidth, sm: drawerWidth },
              maxWidth: '85vw',
              background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
              borderRadius: '0 20px 20px 0',
              boxShadow: '4px 0 20px rgba(0,0,0,0.1)',
            },
            '& .MuiBackdrop-root': {
              backgroundColor: 'rgba(0,0,0,0.3)',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              background: 'linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          ml: { xs: 0, md: 0 },
          p: isMobile ? 1 : 3,
          pb: isMobile ? 10 : 3, // Extra padding for bottom nav
          background: isMobile 
            ? 'linear-gradient(180deg, #f8f9ff 0%, #ffffff 100%)'
            : undefined,
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} />
        <Box sx={{ flexGrow: 1 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Mobile Bottom Navigation */}
      {isMobile && user?.role !== 'admin' && (
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: theme.zIndex.appBar,
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '20px 20px 0 0',
            boxShadow: '0 -4px 20px rgba(0,0,0,0.1)',
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={handleBottomNavChange}
            sx={{
              background: 'transparent',
              height: 72,
              '& .MuiBottomNavigationAction-root': {
                color: 'rgba(255,255,255,0.7)',
                minWidth: 64,
                maxWidth: 'none',
                padding: '8px 12px',
                borderRadius: 2,
                margin: '4px 2px',
                transition: 'all 0.2s ease',
                '&.Mui-selected': {
                  color: '#ffffff',
                  backgroundColor: 'rgba(255,255,255,0.15)',
                  transform: 'scale(1.05)',
                },
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  transform: 'translateY(-2px)',
                },
                '&:active': {
                  transform: 'scale(0.95)',
                },
                '& .MuiBottomNavigationAction-label': {
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  marginTop: '4px',
                },
                '& .MuiSvgIcon-root': {
                  fontSize: '1.5rem',
                },
              },
            }}
          >
            {mobileBottomNavItems.map((item) => (
              <BottomNavigationAction
                key={item.path}
                label={item.text}
                value={item.path}
                icon={item.icon}
              />
            ))}
          </BottomNavigation>
        </Paper>
      )}

      {/* User Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: isMobile ? 200 : 180,
            background: isMobile 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : undefined,
            color: isMobile ? 'white' : undefined,
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              margin: '4px 8px',
              '&:hover': {
                backgroundColor: isMobile 
                  ? 'rgba(255,255,255,0.1)'
                  : undefined,
              },
            },
          },
        }}
      >
        <MenuItem 
          onClick={() => { navigate(user?.role === 'admin' ? '/admin/profile' : '/user/profile'); handleMenuClose(); }}
          sx={{
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '1rem' : '0.875rem',
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ 
            color: isMobile ? 'white' : undefined,
            minWidth: isMobile ? 44 : 36,
          }}>
            <ProfileIcon sx={{ fontSize: isMobile ? '1.25rem' : '1rem' }} />
          </ListItemIcon>
          {t('navigation.profile')}
        </MenuItem>
        
        <MenuItem 
          onClick={() => { navigate(user?.role === 'admin' ? '/admin/settings' : '/user/settings'); handleMenuClose(); }}
          sx={{
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '1rem' : '0.875rem',
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ 
            color: isMobile ? 'white' : undefined,
            minWidth: isMobile ? 44 : 36,
          }}>
            <SettingsIcon sx={{ fontSize: isMobile ? '1.25rem' : '1rem' }} />
          </ListItemIcon>
          {t('navigation.settings')}
        </MenuItem>
        
        {/* Mobile-only menu items */}
        {isMobile && (
          <>
            <MenuItem 
              onClick={() => { navigate(user?.role === 'admin' ? '/admin/deposits' : '/user/deposit'); handleMenuClose(); }}
              sx={{
                minHeight: 48,
                fontSize: '1rem',
                '&:active': {
                  transform: 'scale(0.98)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 44 }}>
                <PaymentIcon sx={{ fontSize: '1.25rem' }} />
              </ListItemIcon>
              {t('navigation.deposit')}
            </MenuItem>
            
            <MenuItem 
              onClick={() => { navigate('/support'); handleMenuClose(); }}
              sx={{
                minHeight: 48,
                fontSize: '1rem',
                '&:active': {
                  transform: 'scale(0.98)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 44 }}>
                <SupportIcon sx={{ fontSize: '1.25rem' }} />
              </ListItemIcon>
              {t('navigation.support')}
            </MenuItem>
            
            <Divider sx={{ backgroundColor: 'rgba(255,255,255,0.2)', margin: '8px' }} />
            
            <MenuItem 
              onClick={handleThemeToggle}
              sx={{
                minHeight: 48,
                fontSize: '1rem',
                '&:active': {
                  transform: 'scale(0.98)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 44 }}>
                {isDarkMode ? <Brightness7 sx={{ fontSize: '1.25rem' }} /> : <Brightness4 sx={{ fontSize: '1.25rem' }} />}
              </ListItemIcon>
              {isDarkMode ? t('common.lightMode') : t('common.darkMode')}
            </MenuItem>
            
            <MenuItem 
              onClick={handleLangMenuClick}
              sx={{
                minHeight: 48,
                fontSize: '1rem',
                '&:active': {
                  transform: 'scale(0.98)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon sx={{ color: 'white', minWidth: 44 }}>
                <LanguageIcon sx={{ fontSize: '1.25rem' }} />
              </ListItemIcon>
              {t('navigation.language')}
            </MenuItem>
          </>
        )}
        
        <Divider sx={{ 
          backgroundColor: isMobile ? 'rgba(255,255,255,0.2)' : undefined,
          margin: '8px'
        }} />
        
        <MenuItem 
          onClick={handleLogout}
          sx={{
            color: isMobile ? '#ffcccb' : '#f44336',
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '1rem' : '0.875rem',
            '&:hover': {
              backgroundColor: isMobile 
                ? 'rgba(255,204,203,0.1)'
                : 'rgba(244,67,54,0.1)',
            },
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ 
            color: isMobile ? '#ffcccb' : '#f44336',
            minWidth: isMobile ? 44 : 36,
          }}>
            <LogoutIcon sx={{ fontSize: isMobile ? '1.25rem' : '1rem' }} />
          </ListItemIcon>
          {t('navigation.logout')}
        </MenuItem>
      </Menu>

      {/* Language Menu */}
      <Menu
        anchorEl={langAnchorEl}
        open={Boolean(langAnchorEl)}
        onClose={handleLangMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            minWidth: isMobile ? 200 : 180,
            background: isMobile 
              ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
              : undefined,
            color: isMobile ? 'white' : undefined,
            '& .MuiMenuItem-root': {
              borderRadius: 1,
              margin: '4px 8px',
              '&:hover': {
                backgroundColor: isMobile 
                  ? 'rgba(255,255,255,0.1)'
                  : undefined,
              },
            },
          },
        }}
      >
        <MenuItem 
          onClick={() => handleLanguageChange('tr')}
          selected={language === 'tr'}
          sx={{
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '1rem' : '0.875rem',
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ 
            fontSize: isMobile ? '1.5rem' : '1.2rem', 
            color: isMobile ? 'white' : undefined,
            minWidth: isMobile ? 44 : 36,
          }}>🇹🇷</ListItemIcon>
          {t('common.turkish')}
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('en')}
          selected={language === 'en'}
          sx={{
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '1rem' : '0.875rem',
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ 
            fontSize: isMobile ? '1.5rem' : '1.2rem', 
            color: isMobile ? 'white' : undefined,
            minWidth: isMobile ? 44 : 36,
          }}>🇺🇸</ListItemIcon>
          {t('common.english')}
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('de')}
          selected={language === 'de'}
          sx={{
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '1rem' : '0.875rem',
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ 
            fontSize: isMobile ? '1.5rem' : '1.2rem', 
            color: isMobile ? 'white' : undefined,
            minWidth: isMobile ? 44 : 36,
          }}>🇩🇪</ListItemIcon>
          {t('common.german')}
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('fr')}
          selected={language === 'fr'}
          sx={{
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '1rem' : '0.875rem',
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ 
            fontSize: isMobile ? '1.5rem' : '1.2rem', 
            color: isMobile ? 'white' : undefined,
            minWidth: isMobile ? 44 : 36,
          }}>🇫🇷</ListItemIcon>
          {t('common.french')}
        </MenuItem>
        <MenuItem 
          onClick={() => handleLanguageChange('es')}
          selected={language === 'es'}
          sx={{
            minHeight: isMobile ? 48 : 40,
            fontSize: isMobile ? '1rem' : '0.875rem',
            '&:active': {
              transform: 'scale(0.98)',
            },
            transition: 'all 0.2s ease',
          }}
        >
          <ListItemIcon sx={{ 
            fontSize: isMobile ? '1.5rem' : '1.2rem', 
            color: isMobile ? 'white' : undefined,
            minWidth: isMobile ? 44 : 36,
          }}>🇪🇸</ListItemIcon>
          {t('common.spanish')}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Layout;