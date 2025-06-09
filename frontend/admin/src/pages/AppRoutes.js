import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Componente de login simple
const AdminLogin = () => (
  <div
    style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "#f8f9fa",
    }}
  >
    <div
      style={{
        backgroundColor: "white",
        padding: "40px",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        textAlign: "center",
        maxWidth: "400px",
      }}
    >
      <h1>🔐 Panel de Administración</h1>
      <h2>Alquilalo</h2>
      <p style={{ color: "#666", marginBottom: "20px" }}>
        Acceso restringido para administradores
      </p>
      <p style={{ fontSize: "14px", color: "#999" }}>
        Inicia sesión como administrador para continuar
      </p>
      <button
        onClick={() =>
          (window.location.href = "https://alquilalo-user.vercel.app/login")
        }
        style={{
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          padding: "12px 24px",
          borderRadius: "4px",
          cursor: "pointer",
          marginTop: "20px",
          fontSize: "16px",
        }}
      >
        Ir a Login Principal
      </button>
    </div>
  </div>
);

// Dashboard simple para usuarios autenticados
const AdminDashboard = () => (
  <div
    style={{
      padding: "40px",
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#f8f9fa",
      minHeight: "100vh",
    }}
  >
    <header
      style={{
        backgroundColor: "#007bff",
        color: "white",
        padding: "30px",
        borderRadius: "8px",
        marginBottom: "30px",
      }}
    >
      <h1>🛠️ Panel de Administración - Alquilalo</h1>
      <p>Bienvenido al sistema de administración</p>
    </header>

    <div
      style={{
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "8px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <h2>📊 Dashboard</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            padding: "20px",
            backgroundColor: "#e3f2fd",
            borderRadius: "4px",
          }}
        >
          <h3>📦 Items</h3>
          <p>Gestionar productos</p>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#f3e5f5",
            borderRadius: "4px",
          }}
        >
          <h3>👥 Usuarios</h3>
          <p>Gestionar usuarios</p>
        </div>
        <div
          style={{
            padding: "20px",
            backgroundColor: "#e8f5e8",
            borderRadius: "4px",
          }}
        >
          <h3>📊 Reportes</h3>
          <p>Ver estadísticas</p>
        </div>
      </div>
    </div>
  </div>
);

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          fontSize: "18px",
          backgroundColor: "#f8f9fa",
        }}
      >
        🔄 Verificando autenticación...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/*"
        element={currentUser ? <AdminDashboard /> : <AdminLogin />}
      />
    </Routes>
  );
};

export default AppRoutes;
