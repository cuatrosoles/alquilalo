import React from "react";
import { HashRouter as Router } from "react-router-dom";
import "./styles/global.css";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./pages/AppRoutes";

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
