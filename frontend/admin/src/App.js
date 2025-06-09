import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";

// Componentes simples para testing
const Dashboard = () => (
  <div style={{ padding: "20px" }}>
    <h2>📊 Dashboard</h2>
    <p>Dashboard funcionando con React Router</p>
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

function App() {
  console.log("Admin App con Router iniciando...");

  return (
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
          <p>Versión con React Router</p>
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
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/items" element={<Items />} />
            <Route path="/users" element={<Users />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>

        <footer
          style={{ marginTop: "20px", textAlign: "center", color: "#666" }}
        >
          ✅ React Router funcionando correctamente
        </footer>
      </div>
    </Router>
  );
}

export default App;
