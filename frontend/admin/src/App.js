import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

// Intentar importar AuthContext
let authContextStatus = "No inicializado";
let authContextError = null;
let AuthProvider = null;

try {
  const authImport = require("./contexts/AuthContext");
  AuthProvider = authImport.AuthProvider;
  authContextStatus = "✅ AuthContext importado correctamente";
  console.log("AuthContext importado correctamente");
} catch (error) {
  authContextStatus = "❌ Error al importar AuthContext";
  authContextError = error.message;
  console.error("Error AuthContext:", error);
}

// Componente que muestra el estado (SIN USAR HOOKS)
const AuthStatus = () => (
  <div
    style={{
      padding: "15px",
      backgroundColor: authContextError ? "#ffe6e6" : "#e6f3ff",
      border: `1px solid ${authContextError ? "#ff0000" : "#0066cc"}`,
      borderRadius: "4px",
      marginTop: "10px",
    }}
  >
    <strong>Estado AuthContext:</strong> {authContextStatus}
    {authContextError && (
      <div style={{ marginTop: "10px", color: "#cc0000" }}>
        <strong>Error:</strong> {authContextError}
      </div>
    )}
    <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
      AuthProvider disponible: {AuthProvider ? "Sí" : "No"}
    </div>
  </div>
);

// Componentes simples
const Dashboard = () => (
  <div style={{ padding: "20px" }}>
    <h2>📊 Dashboard</h2>
    <AuthStatus />
  </div>
);

const Items = () => (
  <div style={{ padding: "20px" }}>
    <h2>📦 Gestión de Items</h2>
    <p>Lista de items funcionando</p>
  </div>
);

const Users = () => (
  <div style={{ padding: "20px" }}>
    <h2>👥 Gestión de Usuarios</h2>
    <p>Lista de usuarios funcionando</p>
  </div>
);

// Componente de rutas
const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/dashboard" element={<Dashboard />} />
    <Route path="/items" element={<Items />} />
    <Route path="/users" element={<Users />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function App() {
  console.log("Admin App con AuthContext iniciando...");

  const content = (
    <Router>
      <div
        style={{
          padding: "20px",
          fontFamily: "Arial, sans-serif",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
        }}
      >
        <header
          style={{
            backgroundColor: "#007bff",
            color: "white",
            padding: "20px",
            borderRadius: "8px",
            marginBottom: "20px",
          }}
        >
          <h1>🛠️ Panel de Administración - Alquilalo</h1>
          <p>Versión con AuthContext (sin hooks condicionales)</p>
        </header>

        <nav
          style={{
            backgroundColor: "white",
            padding: "15px",
            borderRadius: "8px",
            marginBottom: "20px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <Link
            to="/dashboard"
            style={{
              marginRight: "20px",
              textDecoration: "none",
              color: "#007bff",
            }}
          >
            Dashboard
          </Link>
          <Link
            to="/items"
            style={{
              marginRight: "20px",
              textDecoration: "none",
              color: "#007bff",
            }}
          >
            Items
          </Link>
          <Link
            to="/users"
            style={{ textDecoration: "none", color: "#007bff" }}
          >
            Usuarios
          </Link>
        </nav>

        <main
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minHeight: "400px",
          }}
        >
          <AppRoutes />
        </main>
      </div>
    </Router>
  );

  // Si AuthProvider está disponible, usarlo; si no, mostrar contenido directamente
  if (AuthProvider) {
    return <AuthProvider>{content}</AuthProvider>;
  } else {
    return content;
  }
}

export default App;
