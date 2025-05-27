// frontend/user/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ItemDetailPage from './pages/ItemDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import AccountPage from './pages/AccountPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import UserBookings from './pages/UserBookings';
import BookingDetails from './components/BookingDetails';
import CreateBooking from './components/CreateBooking';
import CreateItemPage from './pages/CreateItemPage';
import RentalConfirmationPage from './pages/RentalConfirmationPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';
import { Toaster } from 'react-hot-toast';
import './App.css'; // Asegúrate de que este archivo exista y esté configurado correctamente

function AppContent() {
  const { currentUser } = useAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route path="/register" element={!currentUser ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/login" element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/search" element={<SearchResultsPage />} />
        <Route path="/rentals/:rentalId" element={<RentalConfirmationPage />} />
        <Route path="/pago/estado" element={<PaymentStatusPage />} />
        
        {/* Rutas protegidas */}
        <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="/cuenta" element={<PrivateRoute><AccountPage /></PrivateRoute>} />
        <Route path="/bookings" element={<PrivateRoute><UserBookings /></PrivateRoute>} />
        <Route path="/bookings/:id" element={<PrivateRoute><BookingDetails /></PrivateRoute>} />
        <Route path="/items/:itemId/book" element={<PrivateRoute><CreateBooking /></PrivateRoute>} />
        <Route path="/publicar" element={<PrivateRoute><CreateItemPage /></PrivateRoute>} />
        <Route path="/mis-pagos" element={<PrivateRoute><PaymentHistoryPage /></PrivateRoute>} />
        
        {/* Ruta comodín para manejar rutas no encontradas */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;