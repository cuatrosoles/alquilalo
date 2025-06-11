// frontend/user/src/App.js

import React from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";

// --- 1. IMPORTACIONES AÑADIDAS Y MODIFICADAS ---
// Providers de Contexto
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { TourProvider } from "./contexts/TourContext"; // <-- AÑADIDO

// Componentes de Layout Global
import Header from "./components/Header"; // <-- AÑADIDO
import Footer from "./components/Footer"; // <-- AÑADIDO (Asegúrate de tener este componente)
import FloatingTourButton from "./components/FloatingTourButton"; // <-- AÑADIDO

// Tus Páginas
import HomePage from "./pages/HomePage";
import ItemsPage from "./pages/ItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import SearchResultsPage from "./pages/SearchResultsPage";
import ProfilePage from "./pages/ProfilePage";
import AccountPage from "./pages/AccountPage";
import UserBookings from "./pages/UserBookings";
import BookingDetails from "./components/BookingDetails";
import CreateBooking from "./components/CreateBooking";
import CreateItemPage from "./pages/CreateItemPage";
import RentalConfirmationPage from "./pages/RentalConfirmationPage";
import PaymentStatusPage from "./pages/PaymentStatusPage";
import PaymentHistoryPage from "./pages/PaymentHistoryPage";
import ContactPage from "./pages/ContactPage";

// Componentes Auxiliares
import PrivateRoute from "./components/PrivateRoute";
import { Toaster } from "react-hot-toast";
import "./App.css";

// --- 2. AppContent MODIFICADO PARA INCLUIR EL LAYOUT ---
// Ahora AppContent se encarga de renderizar la estructura principal de la página.
function AppContent() {
  const { currentUser } = useAuth(); // Este hook sigue funcionando igual

  return (
    // El div principal se asegura que el footer quede abajo.
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toaster position="top-right" />
      <Header /> {/* El Header se renderiza una sola vez, aquí. */}
      <main className="flex-grow">
        {" "}
        {/* El contenido principal de cada página irá aquí. */}
        <Routes>
          {/* Todas tus rutas permanecen igual */}
          <Route path="/" element={<HomePage />} />
          <Route path="/item/:id" element={<ItemDetailPage />} />
          <Route
            path="/register"
            element={!currentUser ? <RegisterPage /> : <Navigate to="/" />}
          />
          <Route
            path="/login"
            element={!currentUser ? <LoginPage /> : <Navigate to="/" />}
          />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/items" element={<ItemsPage />} />
          <Route
            path="/rentals/:rentalId"
            element={<RentalConfirmationPage />}
          />
          <Route path="/pago/estado" element={<PaymentStatusPage />} />

          {/* Rutas protegidas */}
          <Route
            path="/perfil"
            element={
              <PrivateRoute>
                <ProfilePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/cuenta"
            element={
              <PrivateRoute>
                <AccountPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <PrivateRoute>
                <UserBookings />
              </PrivateRoute>
            }
          />
          <Route
            path="/bookings/:id"
            element={
              <PrivateRoute>
                <BookingDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/items/:itemId/book"
            element={
              <PrivateRoute>
                <CreateBooking />
              </PrivateRoute>
            }
          />
          <Route
            path="/publicar"
            element={
              <PrivateRoute>
                <CreateItemPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/mis-pagos"
            element={
              <PrivateRoute>
                <PaymentHistoryPage />
              </PrivateRoute>
            }
          />
          <Route path="/contacto" element={<ContactPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer /> {/* El Footer también se renderiza una sola vez, aquí. */}
      <FloatingTourButton /> {/* El botón flotante es global. */}
    </div>
  );
}

// --- 3. App MODIFICADO PARA ENVOLVER CON TourProvider ---
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* TourProvider debe estar DENTRO de Router para funcionar */}
        <TourProvider>
          <AppContent />
        </TourProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
