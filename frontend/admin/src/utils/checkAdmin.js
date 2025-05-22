import { auth, db } from '../config/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

export const checkAdmin = async () => {
  try {
    const user = auth.currentUser;
    if (!user) return false;

    // Verificar si el usuario tiene el rol de admin
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return false;

    const userData = userDoc.data();
    return userData.role === 'admin';
  } catch (error) {
    console.error('Error al verificar admin:', error);
    return false;
  }
};

// Hook para usar en componentes
export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const user = auth.currentUser;
      if (user) {
        const isAdmin = await checkAdmin();
        setIsAdmin(isAdmin);
      }
      setLoading(false);
    };

    check();
  }, []);

  return { isAdmin, loading };
};
