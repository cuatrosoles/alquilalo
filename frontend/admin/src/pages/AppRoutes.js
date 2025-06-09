import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import Items from "./Items";
import FormItem from "../components/FormItem";

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta raíz - redirigir a /items */}
      <Route path="/" element={<Navigate to="/items" replace />} />

      {/* Rutas existentes */}
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

      {/* Catch all - para rutas no encontradas */}
      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
};

export default AppRoutes;
