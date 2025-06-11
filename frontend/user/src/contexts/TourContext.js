import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useCallback,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";

const TourContext = createContext();

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }) => {
  const [isTourActive, setIsTourActive] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.startTour) {
      if (location.pathname === "/") {
        setIsTourActive(true);
        navigate(location.pathname, { replace: true, state: {} });
      }
    }
  }, [location, navigate]);

  // CORRECCIÓN: La función startTour ahora es más inteligente.
  const startTour = useCallback(() => {
    // Si ya estamos en la HomePage, activamos el tour directamente.
    // Esto evita una navegación innecesaria y previene el error de temporización.
    if (location.pathname === "/") {
      setIsTourActive(true);
    } else {
      // Si estamos en cualquier otra página, navegamos a la HomePage
      // con la bandera para que el tour se inicie al llegar.
      navigate("/", { state: { startTour: true } });
    }
  }, [navigate, location.pathname]);

  const hideTour = useCallback(() => {
    setIsTourActive(false);
  }, []);

  const value = {
    isTourActive,
    startTour,
    hideTour,
  };

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
};
