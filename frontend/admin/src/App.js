import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";

// Intentar importar PrivateRoute
let privateRouteStatus = "No inicializado";
let privateRouteError = null;
let PrivateRoute = null;

try {
  const privateRouteImport = require("./components/PrivateRoute");
  PrivateRoute = privateRouteImport.default;
  privateRouteStatus = "✅ PrivateRoute importado correctamente";
  console.log("PrivateRoute importado correctamente");
} catch (error) {
  privateRouteStatus = "❌ Error al importar PrivateRoute";
  privateRouteError = error.message;
  console.error("Error PrivateRoute:", error);
}

// Componente protegido simple para testing
const ProtectedComponent = () => (
  <div style={{ padding: "20px" }}>
    <h2>🔒 Componente Protegido</h2>
    <p>Si ves esto, PrivateRoute está funcionando</p>
  </div>
);

// Componente que muestra el estado
const StatusInfo = () => (
  <div style={{ padding: "20px" }}>
    <h2>📊 Dashboard</h2>

    <div
      style={{
        padding: "15px",
        backgroundColor: "#e6f3ff",
        border: "1px solid #0066cc",
        borderRadius: "4px",
        marginTop: "10px",
      }}
    >
      <strong>Estado AuthContext:</strong> ✅ Funcionando
    </div>

    <div
      style={{
        padding: "15px",
        backgroundColor: privateRouteError ? "#ffe6e6" : "#e6f3ff",
        border: `1px solid ${privateRouteError ? "#ff0000" : "#0066cc"}`,
        borderRadius: "4px",
        marginTop: "10px",
      }}
    >
      <strong>Estado PrivateRoute:</strong> {privateRouteStatus}
      {privateRouteError && (
        <div style={{ marginTop: "10px", color: "#cc0000" }}>
          <strong>Error:</strong> {privateRouteError}
        </div>
      )}
      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        PrivateRoute disponible: {PrivateRoute ? "Sí" : "No"}
      </div>
    </div>
  </div>
);

// Componentes simples
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
    <Route path="/dashboard" element={<StatusInfo />} />

    {/* Ruta con PrivateRoute si está disponible */}
    <Route
      path="/protected"
      element={
        PrivateRoute ? (
          <PrivateRoute>
            <ProtectedComponent />
          </PrivateRoute>
        ) : (
          <div style={{ padding: "20px" }}>
            <p>PrivateRoute no disponible</p>
          </div>
        )
      }
    />

    <Route path="/items" element={<Items />} />
    <Route path="/users" element={<Users />} />
    <Route path="*" element={<Navigate to="/dashboard" replace />} />
  </Routes>
);

function App() {
  console.log("Admin App con PrivateRoute iniciando...");

  return (
    <AuthProvider>
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
            <p>Versión con PrivateRoute (testing)</p>
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
              to="/protected"
              style={{
                marginRight: "20px",
                textDecoration: "none",
                color: "#007bff",
              }}
            >
              Protegido
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
    </AuthProvider>
  );
}

export default App;
