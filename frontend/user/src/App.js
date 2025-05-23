// frontend/user/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ItemDetailPage from './pages/ItemDetailPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import SearchResultsPage from './pages/SearchResultsPage';
import ProfilePage from './pages/ProfilePage';
import AccountPage from './pages/AccountPage';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import UserBookings from './pages/UserBookings';
import BookingDetails from './components/BookingDetails';
import CreateBooking from './components/CreateBooking';
import CreateItemPage from './pages/CreateItemPage';
import RentalConfirmationPage from './pages/RentalConfirmationPage';
import PaymentStatusPage from './pages/PaymentStatusPage';
import PaymentHistoryPage from './pages/PaymentHistoryPage';


function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/perfil" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
          <Route path="/cuenta" element={<PrivateRoute><AccountPage /></PrivateRoute>} />

          <Route path="/bookings" element={<PrivateRoute><UserBookings /></PrivateRoute>} />
          <Route path="/bookings/:id" element={<PrivateRoute><BookingDetails /></PrivateRoute>} />
          <Route path="/items/:itemId/book" element={<PrivateRoute><CreateBooking /></PrivateRoute>} />
          <Route path="/publicar" element={<PrivateRoute><CreateItemPage /></PrivateRoute>} />
          <Route path="/rentals/:rentalId" element={<RentalConfirmationPage />} />

          <Route path="/pago/estado" element={<PaymentStatusPage />} />
          <Route path="/mis-pagos" element={<PrivateRoute><PaymentHistoryPage /></PrivateRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;