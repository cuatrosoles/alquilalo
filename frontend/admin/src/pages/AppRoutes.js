import React from "react";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

// Componente de login
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
      <p style={{ fontSize: "12px", color: "#999", marginTop: "20px" }}>
        Usando HashRouter para evitar conflictos
      </p>
    </div>
  </div>
);

// Dashboard principal
const AdminDashboard = () => {
  const { currentUser } = useAuth();

  return (
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
        <p>Funcionando con HashRouter</p>
        {currentUser && (
          <p style={{ fontSize: "14px", opacity: 0.9 }}>
            Usuario: {currentUser.email}
          </p>
        )}
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
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              padding: "25px",
              backgroundColor: "#e3f2fd",
              borderRadius: "8px",
              border: "1px solid #bbdefb",
            }}
          >
            <h3>📦 Gestión de Items</h3>
            <p>Administrar productos del catálogo</p>
            <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
              • Crear nuevos items
              <br />
              • Editar existentes
              <br />• Gestionar inventario
            </div>
          </div>

          <div
            style={{
              padding: "25px",
              backgroundColor: "#f3e5f5",
              borderRadius: "8px",
              border: "1px solid #e1bee7",
            }}
          >
            <h3>👥 Gestión de Usuarios</h3>
            <p>Administrar usuarios registrados</p>
            <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
              • Ver usuarios activos
              <br />
              • Gestionar permisos
              <br />• Moderar actividad
            </div>
          </div>

          <div
            style={{
              padding: "25px",
              backgroundColor: "#e8f5e8",
              borderRadius: "8px",
              border: "1px solid #c8e6c9",
            }}
          >
            <h3>📊 Reportes</h3>
            <p>Estadísticas y análisis</p>
            <div style={{ marginTop: "15px", fontSize: "12px", color: "#666" }}>
              • Métricas de uso
              <br />
              • Ingresos y rentas
              <br />• Análisis de tendencias
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { currentUser, loading } = useAuth();

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
        🔄 Cargando...
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={currentUser ? <AdminDashboard /> : <AdminLogin />}
      />
      <Route path="/login" element={<AdminLogin />} />
      <Route
        path="/dashboard"
        element={currentUser ? <AdminDashboard /> : <AdminLogin />}
      />
      <Route
        path="*"
        element={currentUser ? <AdminDashboard /> : <AdminLogin />}
      />
    </Routes>
  );
};

export default AppRoutes;
