import { useState, useEffect } from "react";
import { checkAdmin } from "../utils/checkAdmin";
import { auth } from "../config/firebase";

// Hook para usar en componentes
export const useAdminCheck = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const check = async () => {
      const user = auth.currentUser;
      if (user) {
        const adminStatus = await checkAdmin();
        setIsAdmin(adminStatus);
      }
      setLoading(false);
    };

    check();
  }, []);

  return { isAdmin, loading };
};
