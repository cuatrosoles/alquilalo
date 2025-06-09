import React from "react";

function App() {
  console.log("Admin App iniciando...");

  return (
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
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "30px",
        }}
      >
        <h1>🛠️ Panel de Administración - Alquilalo</h1>
        <p>Versión simplificada funcionando</p>
      </header>

      <main>
        <div
          style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "8px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            marginBottom: "20px",
          }}
        >
          <h2>📊 Dashboard</h2>
          <ul style={{ listStyle: "none", padding: 0 }}>
            <li style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              ✅ Sistema funcionando correctamente
            </li>
            <li style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              ⏳ Gestión de Items (próximamente)
            </li>
            <li style={{ padding: "10px", borderBottom: "1px solid #eee" }}>
              ⏳ Gestión de Usuarios (próximamente)
            </li>
            <li style={{ padding: "10px" }}>⏳ Reportes (próximamente)</li>
          </ul>
        </div>

        <div
          style={{
            backgroundColor: "#e8f5e8",
            border: "1px solid #28a745",
            padding: "15px",
            borderRadius: "4px",
          }}
        >
          <strong>✅ Estado:</strong> Admin panel funcional sin dependencias
          complejas
        </div>
      </main>
    </div>
  );
}

export default App;
