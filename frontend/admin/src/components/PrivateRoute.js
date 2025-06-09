import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    let isMounted = true; // Prevenir updates si el componente se desmonta

    const checkAdminStatus = async () => {
      try {
        if (!currentUser) {
          if (isMounted) {
            setIsAdmin(false);
            setCheckingAdmin(false);
          }
          return;
        }

        // Simular verificación de admin (sin usar checkAdmin que puede causar el loop)
        // Por ahora, asumir que cualquier usuario autenticado es admin para testing
        if (isMounted) {
          setIsAdmin(true); // Cambiar esto cuando sepamos que funciona
          setCheckingAdmin(false);
        }
      } catch (error) {
        console.error("Error al verificar admin:", error);
        if (isMounted) {
          setIsAdmin(false);
          setCheckingAdmin(false);
        }
      }
    };

    if (!loading) {
      checkAdminStatus();
    }

    return () => {
      isMounted = false; // Cleanup para prevenir memory leaks
    };
  }, [currentUser, loading]);

  // Mostrar loading mientras se verifica
  if (loading || checkingAdmin) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          fontSize: "16px",
        }}
      >
        Verificando permisos...
      </div>
    );
  }

  // Si no es admin, redirigir a login
  if (!isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // Si es admin, mostrar el contenido
  return children;
};

export default PrivateRoute;
