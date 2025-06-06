import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkAdmin } from '../utils/checkAdmin';

export const PrivateRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      if (currentUser) {
        const isAdmin = await checkAdmin();
        setIsAdmin(isAdmin);
      }
      setLoading(false);
    };

    check();
  }, [currentUser]);

  if (loading) return <div>Cargando...</div>;

  return isAdmin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
