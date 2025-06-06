// src/components/Payment/PaymentButton.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import PaymentService from '../../services/payment.service';
import { Button, CircularProgress, Snackbar, Alert } from '@mui/material';

const PaymentButton = ({ rentalId, amount, onPaymentSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handlePayment = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const paymentData = {
        rentalId,
        amount,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        userName: currentUser.displayName || 'Usuario',
        // ownerId se debería obtener del contexto del alquiler
      };

      const response = await PaymentService.createPaymentIntent(paymentData);
      
      // Redirigir a la página de pago de MercadoPago
      window.location.href = response.paymentUrl;
      
    } catch (err) {
      console.error('Error al procesar el pago:', err);
      setError(err.message || 'Error al procesar el pago');
      setOpenSnackbar(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };

  return (
    <>
      <Button
        variant="contained"
        color="primary"
        onClick={handlePayment}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
      >
        {loading ? 'Procesando...' : 'Pagar con MercadoPago'}
      </Button>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};

export default PaymentButton;