import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import Items from "./Items";
import FormItem from "../components/FormItem";

// Componente de login para admin
const AdminLogin = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
      }}
    >
      <h1>🔐 Admin - Alquilalo</h1>
      <p>Acceso solo para administradores</p>
    </div>
  </div>
);

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<Navigate to="/items" replace />} />
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
      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
};

export default AppRoutes;
