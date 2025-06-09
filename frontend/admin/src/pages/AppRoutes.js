import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "../components/PrivateRoute";

// Importar componentes de forma segura
let Items = null;
let FormItem = null;

try {
  Items = require("./Items").default;
} catch (error) {
  console.error("Error al importar Items:", error);
  Items = () => (
    <div style={{ padding: "20px" }}>
      <h2>📦 Items</h2>
      <p>Error al cargar Items</p>
    </div>
  );
}

try {
  FormItem = require("../components/FormItem").default;
} catch (error) {
  console.error("Error al importar FormItem:", error);
  FormItem = () => (
    <div style={{ padding: "20px" }}>
      <h2>📝 Formulario</h2>
      <p>Error al cargar FormItem</p>
    </div>
  );
}

// Componente de login simple
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
      <p>Inicia sesión como administrador para continuar</p>
    </div>
  </div>
);

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
