import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";
import Items from "./Items";
import FormItem from "../components/FormItem";

// Componente simple de Login para admin
const AdminLogin = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
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
        <h1>🔐 Panel de Administración</h1>
        <p>Acceso restringido solo para administradores</p>
        <p>Debes iniciar sesión como administrador para acceder.</p>
        <button
          onClick={() =>
            (window.location.href = "https://alquilalo-user.vercel.app/login")
          }
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
            marginTop: "20px",
          }}
        >
          Ir a Login Principal
        </button>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Ruta de login */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Ruta raíz - redirigir a /items */}
      <Route path="/" element={<Navigate to="/items" replace />} />

      {/* Rutas protegidas */}
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

      {/* Catch all - redirigir a items */}
      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  );
};

export default AppRoutes;
