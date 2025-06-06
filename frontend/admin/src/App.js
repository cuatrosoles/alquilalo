import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./pages";
import "./styles/global.css";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  return (
    <AuthProvider>
      <Router basename="/admin">
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
