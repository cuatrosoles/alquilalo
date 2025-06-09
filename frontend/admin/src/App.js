import React from "react";
import { HashRouter as Router } from "react-router-dom";
import "./styles/global.css";
import { AuthProvider } from "./contexts/AuthContext";

// Importar AppRoutes de forma segura
let AppRoutes = null;
try {
  AppRoutes = require("./pages").default;
} catch (error) {
  console.error("Error al importar AppRoutes:", error);
  AppRoutes = () => (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <h1>🔧 Panel de Administración</h1>
      <p>Error al cargar las rutas: {error.message}</p>
    </div>
  );
}

function App() {
  console.log("Admin App con HASH ROUTER iniciando...");

  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
