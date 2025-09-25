import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector, useDispatch } from 'react-redux';
import { store } from './store';
import type { RootState } from './store';
import { fetchBalance } from './store/slices/balanceSlice';

// Components
import Layout from './components/Layout/Layout';
import Login from './pages/Auth/Login';
import AdminLogin from './pages/Auth/AdminLogin';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/Users';
import AdminKYC from './pages/Admin/KYC';
import AdminIPOs from './pages/Admin/IPOs';
import AdminStocks from './pages/Admin/Stocks';
import AdminDeposits from './pages/Admin/Deposits';
import AdminReports from './pages/Admin/Reports';
import AdminAnnouncements from './pages/Admin/Announcements';
import AdminSupport from './pages/Admin/Support';
import AdminPaymentMethods from './pages/Admin/PaymentMethods';
import Deposit from './pages/Deposit/Deposit';
import Support from './pages/Support/Support';
import AdminInviteCodes from './pages/Admin/InviteCodes';
import Stocks from './pages/Stocks/Stocks';
import IPOs from './pages/IPOs/IPOs';
import Portfolio from './pages/Portfolio/Portfolio';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';
import NotificationSnackbar from './components/UI/NotificationSnackbar';

function AppContent() {
  const dispatch = useDispatch();
  const { isDarkMode } = useSelector((state: RootState) => state.ui);
  const { isAuthenticated, loading, user } = useSelector((state: RootState) => state.auth);

  // Load balance when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(fetchBalance() as any);
    }
  }, [dispatch, isAuthenticated, user]);

  const theme = createTheme({
    palette: {
      mode: isDarkMode ? 'dark' : 'light',
      primary: {
        main: '#1a237e', // Koyu lacivert
        light: '#534bae',
        dark: '#000051',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#424242', // Antrasit
        light: '#6d6d6d',
        dark: '#1b1b1b',
        contrastText: '#ffffff',
      },
      background: {
        default: isDarkMode ? '#121212' : '#f5f5f5',
        paper: isDarkMode ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDarkMode ? '#ffffff' : '#1a237e',
        secondary: isDarkMode ? '#b0b0b0' : '#424242',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 700,
        fontSize: '2.5rem',
        color: isDarkMode ? '#ffffff' : '#1a237e',
      },
      h2: {
        fontWeight: 600,
        fontSize: '2rem',
        color: isDarkMode ? '#ffffff' : '#1a237e',
      },
      h3: {
        fontWeight: 600,
        fontSize: '1.5rem',
        color: isDarkMode ? '#ffffff' : '#1a237e',
      },
      h4: {
        fontWeight: 500,
        fontSize: '1.25rem',
        color: isDarkMode ? '#ffffff' : '#1a237e',
      },
      h5: {
        fontWeight: 500,
        fontSize: '1.125rem',
        color: isDarkMode ? '#ffffff' : '#1a237e',
      },
      h6: {
        fontWeight: 500,
        fontSize: '1rem',
        color: isDarkMode ? '#ffffff' : '#1a237e',
      },
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: isDarkMode 
              ? '0 8px 32px rgba(0, 0, 0, 0.3)'
              : '0 8px 32px rgba(26, 35, 126, 0.1)',
            border: isDarkMode 
              ? '1px solid rgba(255, 255, 255, 0.1)'
              : '1px solid rgba(26, 35, 126, 0.08)',
            background: isDarkMode 
              ? 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            textTransform: 'none',
            fontWeight: 600,
            padding: '12px 24px',
          },
          contained: {
            background: 'linear-gradient(135deg, #1a237e 0%, #3949ab 100%)',
            boxShadow: '0 4px 16px rgba(26, 35, 126, 0.3)',
            '&:hover': {
              background: 'linear-gradient(135deg, #000051 0%, #1a237e 100%)',
              boxShadow: '0 6px 20px rgba(26, 35, 126, 0.4)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            background: isDarkMode 
              ? 'linear-gradient(145deg, #1e1e1e 0%, #2a2a2a 100%)'
              : 'linear-gradient(145deg, #ffffff 0%, #f8f9ff 100%)',
          },
        },
      },
    },
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login /> : <Navigate to={user?.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} />} 
          />
          <Route 
            path="/admin-login" 
            element={!isAuthenticated ? <AdminLogin /> : <Navigate to={user?.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register /> : <Navigate to="/user/dashboard" />} 
          />
          
          {/* User Protected Routes */}
          <Route path="/user" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/user/dashboard" />} />
            <Route path="dashboard" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Dashboard />} />
            <Route path="stocks" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Stocks />} />
            <Route path="deposit" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Deposit />} />
            <Route path="support" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Support />} />
            <Route path="ipos" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <IPOs />} />
            <Route path="portfolio" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Portfolio />} />
            <Route path="profile" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Profile />} />
            <Route path="settings" element={user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : <Settings />} />
          </Route>
          
          {/* Admin Protected Routes */}
          <Route path="/admin" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/admin/dashboard" />} />
            <Route path="dashboard" element={user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/user/dashboard" />} />
            <Route path="users" element={user?.role === 'admin' ? <AdminUsers /> : <Navigate to="/user/dashboard" />} />
            <Route path="kyc" element={user?.role === 'admin' ? <AdminKYC /> : <Navigate to="/user/dashboard" />} />
            <Route path="ipos" element={user?.role === 'admin' ? <AdminIPOs /> : <Navigate to="/user/dashboard" />} />
            <Route path="stocks" element={user?.role === 'admin' ? <AdminStocks /> : <Navigate to="/user/dashboard" />} />
            <Route path="deposits" element={user?.role === 'admin' ? <AdminDeposits /> : <Navigate to="/user/dashboard" />} />
            <Route path="invite-codes" element={user?.role === 'admin' ? <AdminInviteCodes /> : <Navigate to="/user/dashboard" />} />
            <Route path="reports" element={user?.role === 'admin' ? <AdminReports /> : <Navigate to="/user/dashboard" />} />
            <Route path="announcements" element={user?.role === 'admin' ? <AdminAnnouncements /> : <Navigate to="/user/dashboard" />} />
            <Route path="support" element={user?.role === 'admin' ? <AdminSupport /> : <Navigate to="/user/dashboard" />} />
            <Route path="payment-methods" element={user?.role === 'admin' ? <AdminPaymentMethods /> : <Navigate to="/user/dashboard" />} />
            <Route path="profile" element={user?.role === 'admin' ? <Profile /> : <Navigate to="/user/dashboard" />} />
            <Route path="settings" element={user?.role === 'admin' ? <Settings /> : <Navigate to="/user/dashboard" />} />
          </Route>
          
          {/* Legacy Routes - Redirect to new structure */}
          <Route path="/dashboard" element={<Navigate to={user?.role === 'admin' ? "/admin/dashboard" : "/user/dashboard"} />} />
          
          {/* Root Route */}
          <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'admin' ? "/admin/dashboard" : "/user/dashboard") : "/login"} />} />
          
          {/* Fallback */}
          <Route path="*" element={<Navigate to={isAuthenticated ? (user?.role === 'admin' ? "/admin/dashboard" : "/user/dashboard") : "/login"} />} />
        </Routes>
      </Router>
      <NotificationSnackbar />
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
