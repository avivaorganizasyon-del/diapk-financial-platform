import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Switch,
  Button,
  Divider,
  Alert,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  Palette,
  Language,
  Notifications,
  Security,
  Delete,
  Download,
  Warning,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import type { RootState } from '../../store';
import { toggleTheme, setLanguage } from '../../store/slices/uiSlice';
import { deleteAccount } from '../../store/slices/authSlice';

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  
  const { theme, language } = useSelector((state: RootState) => state.ui);
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    marketing: false,
  });
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [success, setSuccess] = useState('');

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  };

  const handleLanguageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newLanguage = event.target.value as 'tr' | 'en' | 'de' | 'fr' | 'es';
    dispatch(setLanguage(newLanguage));
    i18n.changeLanguage(newLanguage);
  };

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleExportData = () => {
    // Simulate data export
    const userData = {
      profile: {
        firstName: user?.firstName,
        lastName: user?.lastName,
        email: user?.email,
        phone: user?.phone,
      },
      settings: {
        theme,
        language,
        notifications,
      },
      exportDate: new Date().toISOString(),
    };
    
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `diapk-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    setSuccess(t('settings.dataExported'));
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleDeleteAccount = async () => {
    try {
      await dispatch(deleteAccount() as any).unwrap();
      setDeleteDialog(false);
    } catch (error) {
      // Error handled by slice
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" component="h1" gutterBottom>
        {t('settings.title')}
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Appearance Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Palette sx={{ mr: 1 }} />
              <Typography variant="h6">
                {t('settings.appearance')}
              </Typography>
            </Box>
            
            <FormControl component="fieldset" sx={{ mb: 3 }}>
              <FormLabel component="legend">{t('settings.theme')}</FormLabel>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <Typography variant="body2" sx={{ mr: 2 }}>
                  {t('settings.lightMode')}
                </Typography>
                <Switch
                  checked={theme === 'dark'}
                  onChange={handleThemeChange}
                  color="primary"
                />
                <Typography variant="body2" sx={{ ml: 2 }}>
                  {t('settings.darkMode')}
                </Typography>
              </Box>
            </FormControl>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Language sx={{ mr: 1 }} />
              <Typography variant="h6">
                {t('settings.language')}
              </Typography>
            </Box>
            
            <FormControl component="fieldset">
              <RadioGroup
                value={language}
                onChange={handleLanguageChange}
              >
                <FormControlLabel
                  value="tr"
                  control={<Radio />}
                  label="🇹🇷 Türkçe"
                />
                <FormControlLabel
                  value="en"
                  control={<Radio />}
                  label="🇺🇸 English"
                />
                <FormControlLabel
                  value="de"
                  control={<Radio />}
                  label="🇩🇪 Deutsch"
                />
                <FormControlLabel
                  value="fr"
                  control={<Radio />}
                  label="🇫🇷 Français"
                />
                <FormControlLabel
                  value="es"
                  control={<Radio />}
                  label="🇪🇸 Español"
                />
              </RadioGroup>
            </FormControl>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Notifications sx={{ mr: 1 }} />
              <Typography variant="h6">
                {t('settings.notifications')}
              </Typography>
            </Box>
            
            <List>
              <ListItem>
                <ListItemText
                  primary={t('settings.emailNotifications')}
                  secondary={t('settings.emailNotificationsDesc')}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary={t('settings.pushNotifications')}
                  secondary={t('settings.pushNotificationsDesc')}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary={t('settings.smsNotifications')}
                  secondary={t('settings.smsNotificationsDesc')}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
              
              <ListItem>
                <ListItemText
                  primary={t('settings.marketingEmails')}
                  secondary={t('settings.marketingEmailsDesc')}
                />
                <ListItemSecondaryAction>
                  <Switch
                    checked={notifications.marketing}
                    onChange={() => handleNotificationChange('marketing')}
                  />
                </ListItemSecondaryAction>
              </ListItem>
            </List>
          </Paper>
        </Grid>

        {/* Privacy & Security */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Security sx={{ mr: 1 }} />
              <Typography variant="h6">
                {t('settings.privacySecurity')}
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {t('settings.dataExport')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {t('settings.dataExportDesc')}
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={handleExportData}
                      fullWidth
                    >
                      {t('settings.exportData')}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
              
              {user?.role === 'admin' && (
                <Grid item xs={12} sm={6}>
                  <Card variant="outlined" sx={{ borderColor: 'error.main' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom color="error">
                        {t('settings.dangerZone')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {t('settings.deleteAccountDesc')}
                      </Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => setDeleteDialog(true)}
                        fullWidth
                      >
                        {t('settings.deleteAccount')}
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Delete Account Confirmation Dialog */}
      <Dialog
        open={deleteDialog}
        onClose={() => setDeleteDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center' }}>
          <Warning sx={{ mr: 1, color: 'error.main' }} />
          {t('settings.confirmDeleteAccount')}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {t('settings.deleteAccountWarning')}
          </DialogContentText>
          <Alert severity="error" sx={{ mt: 2 }}>
            {t('settings.deleteAccountFinal')}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>
            {t('common.cancel')}
          </Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
          >
            {t('settings.deleteAccount')}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Settings;