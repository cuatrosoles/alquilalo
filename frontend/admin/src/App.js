import React from "react";
import "./styles/global.css";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  console.log("Admin App SIN ROUTER iniciando...");

  return (
    <AuthProvider>
      <div
        style={{
          padding: "40px",
          fontFamily: "Arial, sans-serif",
          minHeight: "100vh",
          backgroundColor: "#f8f9fa",
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
          <p>Versión SIN React Router</p>
        </header>

        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
          }}
        >
          <h2>✅ FUNCIONANDO</h2>
          <p>Si ves esto sin errores, el problema está en React Router</p>
          <div
            style={{
              backgroundColor: "#e8f5e8",
              border: "1px solid #28a745",
              padding: "15px",
              borderRadius: "4px",
              marginTop: "20px",
            }}
          >
            <strong>Estado:</strong> Admin funcionando sin React Router
          </div>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
