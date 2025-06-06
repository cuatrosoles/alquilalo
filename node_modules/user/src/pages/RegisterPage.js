// frontend/user/src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Mapa from '../components/Mapa';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [position, setPosition] = useState([-34.6037, -58.3816]); // Default: Buenos Aires
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  // Obtener ubicación automáticamente al cargar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setPosition([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          // Si el usuario no permite, dejar vacío para edición manual
        }
      );
    }
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (!position[0] || !position[1]) {
      setError('Debes seleccionar tu ubicación en el mapa');
      return;
    }

    try {
      await register({ name, email, password, lat: position[0], lng: position[1] });
      navigate('/');
    } catch (error) {
      setError(error.message || 'Error al registrar usuario');
    }
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex flex-col">
      <Header />
      <div className="flex-grow flex items-left justify-left sm:px-18 py-12 lg:px-24 py-16 gap-8 bg-no-repeat bg-center bg-cover" style={{backgroundImage: 'url(/images/register-background.png)'}}>
        <div className="max-w-2xl w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Crear una cuenta
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              ¿Ya tienes una cuenta?{' '}
              <Link to="/login" className="font-medium text-[#009688] hover:text-[#00796B]">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Nombre completo
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-[10px] focus:outline-none focus:ring-[#009688] focus:border-[#009688] focus:z-10 sm:text-sm"
                  placeholder="Tu nombre"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-[10px] focus:outline-none focus:ring-[#009688] focus:border-[#009688] focus:z-10 sm:text-sm"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-[10px] focus:outline-none focus:ring-[#009688] focus:border-[#009688] focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirmar contraseña
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  className="appearance-none relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-[10px] focus:outline-none focus:ring-[#009688] focus:border-[#009688] focus:z-10 sm:text-sm"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tu ubicación</label>
              <div className="mb-2 text-xs text-gray-500">Puedes mover el marcador en el mapa para ajustar tu ubicación.</div>
              <Mapa
                lat={position[0]}
                lng={position[1]}
                setLatLng={setPosition}
                editable={true}
              />
              {(!position[0] || !position[1]) && (
                <div className="text-xs text-red-500 mt-1">Selecciona tu ubicación en el mapa</div>
              )}
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-[10px] text-white bg-[#009688] hover:bg-[#00796B] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#009688]"
              >
                Registrarse
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default RegisterPage;