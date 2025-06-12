import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../config/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [userData, setUserData] = useState({
    displayName: "",
    phone: "",
    address: "",
    city: "",
    country: "",
    photoURL: "",
    emailPreferences: {
      rentalUpdates: true,
      marketingEmails: false,
      securityAlerts: true,
    },
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userDocData = userDoc.data();
          setUserData((prev) => ({
            ...prev,
            ...userDocData,
            displayName: user.displayName || prev.displayName,
            photoURL: user.photoURL || prev.photoURL,
            emailPreferences: {
              ...prev.emailPreferences,
              ...(userDocData.emailPreferences || {}),
            },
          }));
        }
      } catch (error) {
        setError("Error al cargar los datos del usuario");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecciona una imagen válida");
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("La imagen no debe superar los 5MB");
      return;
    }

    setUploadingImage(true);
    setError(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      // Crear referencia única para la imagen
      const imageRef = ref(
        storage,
        `user_photos/${user.uid}/${Date.now()}_${file.name}`
      );

      // Subir imagen
      await uploadBytes(imageRef, file);

      // Obtener URL de la imagen
      const photoURL = await getDownloadURL(imageRef);

      // Actualizar perfil en Firebase Auth
      await updateProfile(user, {
        photoURL: photoURL,
      });

      // Actualizar en Firestore
      await updateDoc(doc(db, "users", user.uid), {
        photoURL: photoURL,
      });

      // Actualizar estado local
      setUserData((prev) => ({
        ...prev,
        photoURL: photoURL,
      }));

      setSuccess("Imagen de perfil actualizada correctamente");
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      setError("Error al subir la imagen. Por favor, intenta de nuevo.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, checked } = e.target;
    if (name.startsWith("emailPreferences.")) {
      const preference = name.split(".")[1];
      setUserData((prev) => ({
        ...prev,
        emailPreferences: {
          ...prev.emailPreferences,
          [preference]: checked,
        },
      }));
    } else {
      setUserData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const user = auth.currentUser;
      if (!user) {
        navigate("/login");
        return;
      }

      // Actualizar perfil en Firebase Auth
      await updateProfile(user, {
        displayName: userData.displayName,
        photoURL: userData.photoURL,
      });

      // Actualizar datos en Firestore
      await updateDoc(doc(db, "users", user.uid), {
        displayName: userData.displayName,
        phone: userData.phone,
        address: userData.address,
        city: userData.city,
        country: userData.country,
        photoURL: userData.photoURL,
        emailPreferences: userData.emailPreferences,
      });

      setSuccess("Perfil actualizado correctamente");
    } catch (error) {
      setError("Error al actualizar el perfil");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#009688]"></div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-[#009688] mb-8">Mi Perfil</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {success}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="space-y-6">
              {/* Foto de Perfil */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative">
                  {userData.photoURL ? (
                    <img
                      src={userData.photoURL}
                      alt="Foto de perfil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-[#009688]"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full border-4 border-[#009688] bg-gray-100 flex items-center justify-center">
                      <svg
                        className="w-20 h-20 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-[#009688] text-white p-2 rounded-full cursor-pointer hover:bg-[#00796B] transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                </div>
                {uploadingImage && (
                  <div className="mt-2 text-sm text-gray-500">
                    Subiendo imagen...
                  </div>
                )}
              </div>

              {/* Información Personal */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Información Personal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre Completo
                    </label>
                    <input
                      type="text"
                      name="displayName"
                      value={userData.displayName}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009688] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={userData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009688] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={userData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009688] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ciudad
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={userData.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009688] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      País
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={userData.country}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#009688] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Preferencias de Correo */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">
                  Preferencias de Correo
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailPreferences.rentalUpdates"
                      checked={userData.emailPreferences.rentalUpdates}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#009688] focus:ring-[#009688] border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Actualizaciones de alquileres
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailPreferences.marketingEmails"
                      checked={userData.emailPreferences.marketingEmails}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#009688] focus:ring-[#009688] border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Correos de marketing
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="emailPreferences.securityAlerts"
                      checked={userData.emailPreferences.securityAlerts}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-[#009688] focus:ring-[#009688] border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-700">
                      Alertas de seguridad
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-[#009688] text-white px-6 py-2 rounded-lg hover:bg-[#00796B] transition-colors"
                  disabled={loading}
                >
                  {loading ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default ProfilePage;
