import React from 'react';
import { Routes, Route } from 'react-router-dom';
import PrivateRoute from '../components/PrivateRoute';
import Items from './Items';
import FormItem from '../components/FormItem';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/items" element={
        <PrivateRoute>
          <Items />
        </PrivateRoute>
      } />
      <Route path="/items/new" element={
        <PrivateRoute>
          <FormItem isEditing={false} />
        </PrivateRoute>
      } />
      <Route path="/items/:id/edit" element={
        <PrivateRoute>
          <FormItem isEditing={true} />
        </PrivateRoute>
      } />
    </Routes>
  );
};

export default AppRoutes;
