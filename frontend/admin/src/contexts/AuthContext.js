import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "../config/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  function signup(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    return signOut(auth);
  }

  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    let isMounted = true;

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        if (isMounted) {
          console.log("Auth state changed:", user ? user.email : "No user");
          setCurrentUser(user);
          setLoading(false);
        }
      },
      (error) => {
        console.error("Auth error:", error);
        if (isMounted) {
          setCurrentUser(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    resetPassword,
    loading,
  };

  // CRÍTICO: Siempre renderizar children, pero mostrar loading si es necesario
  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "100vh",
            fontSize: "18px",
            backgroundColor: "#f8f9fa",
          }}
        >
          🔄 Cargando autenticación...
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
