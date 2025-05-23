import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Grid,
  Link,
  InputAdornment,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserPaymentSettings } from '../../services/user.service';
import { AccountBalance, CreditCard, Payment, Info, ContentCopy, Check } from '@mui/icons-material';

const PaymentSettings = () => {
  const { currentUser, userData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedField, setCopiedField] = useState('');
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [formData, setFormData] = useState({
    paymentMethod: 'mercadopago',
    mercadopagoEmail: '',
    bankName: '',
    accountType: 'checking',
    accountNumber: '',
    cbu: '',
    alias: '',
    cuit: '',
  });

  useEffect(() => {
    if (userData?.paymentSettings) {
      setFormData(prev => ({
        ...prev,
        ...userData.paymentSettings,
      }));
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const validateForm = () => {
    // Clear previous errors
    setError('');

    // Common validations
    if (formData.paymentMethod === 'mercadopago') {
      if (!formData.mercadopagoEmail) {
        setError('Por favor, ingresa tu correo de MercadoPago');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.mercadopagoEmail)) {
        setError('Por favor, ingresa un correo electrónico válido');
        return false;
      }
    }

    if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.bankName) {
        setError('Por favor, ingresa el nombre del banco');
        return false;
      }
      if (!formData.accountNumber) {
        setError('Por favor, ingresa el número de cuenta');
        return false;
      }
      if (!formData.cbu || formData.cbu.length !== 22) {
        setError('El CBU debe tener 22 dígitos');
        return false;
      }
      if (!/^\d+$/.test(formData.cbu)) {
        setError('El CBU solo puede contener números');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      setError('Debes iniciar sesión para actualizar la configuración de pagos');
      return;
    }

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      setSuccess('');

      const settingsToUpdate = {
        paymentMethod: formData.paymentMethod,
        updatedAt: new Date().toISOString(),
      };

      // Only include relevant fields based on payment method
      if (formData.paymentMethod === 'mercadopago') {
        settingsToUpdate.mercadopagoEmail = formData.mercadopagoEmail.trim();
      } else {
        settingsToUpdate.bankName = formData.bankName.trim();
        settingsToUpdate.accountType = formData.accountType;
        settingsToUpdate.accountNumber = formData.accountNumber.trim();
        settingsToUpdate.cbu = formData.cbu.trim();
        if (formData.alias) settingsToUpdate.alias = formData.alias.trim();
        if (formData.cuit) settingsToUpdate.cuit = formData.cuit.trim();
      }

      await updateUserPaymentSettings(currentUser.uid, {
        paymentSettings: settingsToUpdate,
      });

      setSuccess('Configuración de pagos actualizada correctamente');
      
      // Auto-hide success message after 5 seconds
      setTimeout(() => setSuccess(''), 5000);
      
    } catch (err) {
      console.error('Error al actualizar la configuración de pagos:', err);
      setError(err.message || 'Error al actualizar la configuración. Por favor, inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(''), 2000);
  };

  const renderCopyButton = (text, field) => (
    <Tooltip title={copiedField === field ? '¡Copiado!' : 'Copiar'}>
      <IconButton
        onClick={() => copyToClipboard(text, field)}
        size="small"
        sx={{ ml: 1 }}
      >
        {copiedField === field ? <Check fontSize="small" /> : <ContentCopy fontSize="small" />}
      </IconButton>
    </Tooltip>
  );

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: { xs: 2, md: 3 } }}>
      <Typography variant="h5" component="h1" gutterBottom>
        Configuración de Pagos
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        Configura cómo deseas recibir los pagos por tus alquileres. Esta información es necesaria para poder realizar las transferencias.
      </Typography>
      
      <Paper elevation={2} sx={{ p: { xs: 2, md: 4 }, borderRadius: 2, mb: 4 }}>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel id="payment-method-label">Método de Pago Preferido</InputLabel>
            <Select
              labelId="payment-method-label"
              id="paymentMethod"
              name="paymentMethod"
              value={formData.paymentMethod}
              label="Método de Pago Preferido"
              onChange={handleChange}
              disabled={loading}
              startAdornment={
                <InputAdornment position="start">
                  <Payment color="action" />
                </InputAdornment>
              }
            >
              <MenuItem value="mercadopago">
                <Box display="flex" alignItems="center">
                  <img 
                    src="/images/mercadopago-logo.png" 
                    alt="MercadoPago" 
                    style={{ height: 20, marginRight: 8 }} 
                  />
                  MercadoPago
                </Box>
              </MenuItem>
              <MenuItem value="bank_transfer">
                <Box display="flex" alignItems="center">
                  <AccountBalance sx={{ mr: 1, color: 'text.secondary' }} />
                  Transferencia Bancaria
                </Box>
              </MenuItem>
            </Select>
            <FormHelperText>
              Selecciona cómo prefieres recibir los pagos por tus alquileres
            </FormHelperText>
          </FormControl>

          <Divider sx={{ my: 4 }} />

          {formData.paymentMethod === 'mercadopago' ? (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <CreditCard sx={{ mr: 1, color: 'primary.main' }} />
                Configuración de MercadoPago
              </Typography>
              
              <TextField
                fullWidth
                margin="normal"
                label="Correo de MercadoPago"
                name="mercadopagoEmail"
                type="email"
                value={formData.mercadopagoEmail}
                onChange={handleChange}
                disabled={loading}
                placeholder="tucorreo@ejemplo.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Payment color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Alert 
                severity="info" 
                icon={<Info fontSize="small" />}
                sx={{ mt: 2, mb: 3, '& a': { color: 'info.dark', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } }}
              >
                <Box>
                  <Box mb={1}>
                    Asegúrate de que el correo sea el correcto, ya que ahí recibirás los pagos.
                  </Box>
                  <Box>
                    ¿No tienes una cuenta?{' '}
                    <Link 
                      href="https://www.mercadopago.com.ar" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      underline="hover"
                    >
                      Crear cuenta en MercadoPago
                    </Link>
                  </Box>
                </Box>
              </Alert>

              <Box sx={{ 
                backgroundColor: 'grey.50', 
                p: 2, 
                borderRadius: 1,
                borderLeft: `4px solid ${theme.palette.primary.main}`
              }}>
                <Typography variant="body2" color="text.secondary">
                  Los pagos se acreditarán en tu cuenta de MercadoPago en un plazo de 24-48 horas hábiles.
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle1" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                Datos Bancarios
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Nombre del Banco"
                    name="bankName"
                    value={formData.bankName}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ej: Banco Nación"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth margin="normal">
                    <InputLabel id="account-type-label">Tipo de Cuenta</InputLabel>
                    <Select
                      labelId="account-type-label"
                      id="accountType"
                      name="accountType"
                      value={formData.accountType}
                      label="Tipo de Cuenta"
                      onChange={handleChange}
                      disabled={loading}
                    >
                      <MenuItem value="checking">Cuenta Corriente</MenuItem>
                      <MenuItem value="savings">Caja de Ahorro</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <TextField
                fullWidth
                margin="normal"
                label="Número de Cuenta"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
                disabled={loading}
                placeholder="Número sin guiones ni espacios"
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="CBU"
                name="cbu"
                value={formData.cbu}
                onChange={handleChange}
                disabled={loading}
                placeholder="22 dígitos sin espacios"
                inputProps={{ maxLength: 22 }}
                helperText="El CBU es el número de 22 dígitos que identifica tu cuenta bancaria"
                InputProps={{
                  endAdornment: formData.cbu && (
                    <InputAdornment position="end">
                      {renderCopyButton(formData.cbu, 'cbu')}
                    </InputAdornment>
                  ),
                }}
              />
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="Alias CBU (opcional)"
                    name="alias"
                    value={formData.alias || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Ej: MI.ALIAS"
                    helperText="Si tenés alias configurado en tu banco"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    margin="normal"
                    label="CUIT/CUIL (opcional)"
                    name="cuit"
                    value={formData.cuit || ''}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder="Sin guiones"
                    helperText="Formato: 20123456789"
                  />
                </Grid>
              </Grid>
              
              <Alert 
                severity="info" 
                icon={<Info fontSize="small" />}
                sx={{ mt: 2, mb: 3 }}
              >
                <Box>
                  <Box mb={1}>
                    Los pagos se acreditarán en tu cuenta bancaria en un plazo de 24-48 horas hábiles.
                  </Box>
                  <Box>
                    Asegúrate de que los datos sean correctos para evitar demoras en los pagos.
                  </Box>
                </Box>
              </Alert>
            </Box>
          )}
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'flex-end',
            mt: 4,
            pt: 2,
            borderTop: `1px solid ${theme.palette.divider}`
          }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
              sx={{ minWidth: 180 }}
            >
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </Box>
        </form>
      </Paper>
      
      <Paper elevation={2} sx={{ p: 3, borderRadius: 2, backgroundColor: 'grey.50' }}>
        <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
          <Info color="primary" sx={{ mr: 1 }} />
          Información Importante
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Los pagos se procesan los días hábiles de lunes a viernes.
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          • Las transferencias bancarias pueden demorar hasta 48 horas hábiles en acreditarse.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          • Para cualquier consulta sobre pagos, por favor contacta a nuestro soporte.
        </Typography>
      </Paper>
    </Box>
  );
};

export default PaymentSettings;