// frontend/user/src/components/Header.js

import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useTour } from "../contexts/TourContext"; // Importamos el hook del tour

function Header() {
  const { user, logout } = useAuth();
  const { startTour } = useTour(); // Obtenemos la función para iniciar el tour desde el contexto
  const handleHowItWorksClick = (e) => {
    e.preventDefault(); // Prevenimos el comportamiento por defecto del enlace
    startTour(); // Llamamos a la función global para iniciar el tour
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between py-0 px-8">
        <div className="flex items-center gap-2">
          <Link to="/">
            <img
              src="/images/LogoAlquilaloV1-Rosa-480x135.png"
              alt="Alquilalo"
              className="h-15 w-auto"
            />
          </Link>
        </div>
        <nav className="flex gap-8 text-gray-700 font-medium text-lg">
          <Link to="/items" className="hover:text-[#009688]">
            En Alquiler
          </Link>

          <button
            onClick={handleHowItWorksClick}
            className="hover:text-[#009688] text-gray-700 font-medium text-lg"
          >
            Cómo Funciona
          </button>
          <Link to="/contacto" className="hover:text-[#009688]">
            Contacto
          </Link>
          {/* {user && (
            <>
              <Link to="/mis-alquileres" className="hover:text-[#009688]">Mis Alquileres</Link>
              <Link to="/mensajes" className="hover:text-[#009688]">Mensajes</Link>
            </>
          )} */}
        </nav>
        <div className="flex items-center gap-8">
          {user ? (
            <>
              <Link
                to="/publicar"
                className="bg-[#FFC107] text-white font-semibold px-6 py-2 rounded-full text-lg shadow hover:bg-[#ffb300] transition"
              >
                Publicar
              </Link>
              <div className="relative group">
                <img
                  src={user.avatar || "./images/user_icon.png"}
                  alt="Usuario"
                  className="h-10 w-10 rounded-full border-2 border-[#FFC107] cursor-pointer"
                />
                <span className="text-gray-700">{user.displayName}</span>
                <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg py-2 hidden group-hover:block z-10">
                  <Link
                    to="/perfil"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Mi Perfil
                  </Link>
                  <Link
                    to="/cuenta"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Mi Cuenta
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-700 hover:text-[#009688] font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                id="login-button"
                to="/register"
                className="bg-[#FFC107] text-white font-semibold px-6 py-2 rounded-full text-lg shadow hover:bg-[#ffb300] transition"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
