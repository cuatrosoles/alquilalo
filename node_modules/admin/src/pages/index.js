import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import PrivateRoute from '../components/PrivateRoute';
import Rentals from './Rentals';

// Pages
import Dashboard from './Dashboard';
import Users from './Users';
import Items from './Items';
import Categories from './Categories';
import Fees from './Fees';
import Payments from './Payments';
import Settings from './Settings';
import Login from './auth/Login'; 
import FormItem from '../components/FormItem';
import FormRental from '../components/FormRental';

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/users"
            element={
              <PrivateRoute>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/items"
            element={
              <PrivateRoute>
                <Items />
              </PrivateRoute>
            }
          />
          <Route
            path="/items/new"
            element={
              <PrivateRoute>
                <FormItem isEditing={false} />
              </PrivateRoute>
            }
          />
          <Route
            path="/items/:id/edit"
            element={
              <PrivateRoute>
                <FormItem isEditing={true} />
              </PrivateRoute>
            }
          />
          <Route
            path="/rentals"
            element={
              <PrivateRoute>
                <Rentals />
              </PrivateRoute>
            }
          />
          <Route
            path="/rentals/new"
            element={
              <PrivateRoute>
                <FormRental isEditing={false} />
              </PrivateRoute>
            }
          />
          <Route
            path="/rentals/:id/edit"
            element={
              <PrivateRoute>
                <FormRental isEditing={true} />
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Categories />
              </PrivateRoute>
            }
          />
          <Route
            path="/fees"
            element={
              <PrivateRoute>
                <Fees />
              </PrivateRoute>
            }
          />
          <Route
            path="/payments"
            element={
              <PrivateRoute>
                <Payments />
              </PrivateRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <PrivateRoute>
                <Settings />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
