import React from "react";
import AppRoutes from "./pages";
import "./styles/global.css";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider basename="/frontend/admin">
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
