import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";

function AccountPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rentals, setRentals] = useState({
    asOwner: [],
    asRenter: [],
  });
  const [activeTab, setActiveTab] = useState("overview");
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0,
    total: 0,
  });

  // Verificar autenticación
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const updateBalance = useCallback((ownerRentals, renterRentals) => {
    let available = 0;
    let pending = 0;

    // Calcular ganancias como propietario
    ownerRentals.forEach((rental) => {
      if (rental.status === "completed") {
        available += rental.totalAmount - rental.totalAmount * 0.1; // 10% fee
      } else if (rental.status === "pending") {
        pending += rental.totalAmount - rental.totalAmount * 0.1;
      }
    });

    // Calcular gastos como inquilino
    renterRentals.forEach((rental) => {
      if (rental.status === "completed") {
        available -= rental.totalAmount;
      } else if (rental.status === "pending") {
        pending -= rental.totalAmount;
      }
    });

    setBalance({
      available,
      pending,
      total: available + pending,
    });
  }, []);

  useEffect(() => {
    let ownerUnsubscribe;
    let renterUnsubscribe;

    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!user) {
          setLoading(false);
          return;
        }

        // Configurar listeners para alquileres como propietario
        const ownerRentalsQuery = query(
          collection(db, "rentals"),
          where("ownerId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        ownerUnsubscribe = onSnapshot(
          ownerRentalsQuery,
          (snapshot) => {
            const ownerRentals = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setRentals((prev) => {
              updateBalance(ownerRentals, prev.asRenter);
              return { ...prev, asOwner: ownerRentals };
            });
          },
          (error) => {
            console.error("Error en listener de propietario:", error);
            setError("Error al cargar los alquileres como propietario");
          }
        );

        // Configurar listeners para alquileres como inquilino
        const renterRentalsQuery = query(
          collection(db, "rentals"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc")
        );

        renterUnsubscribe = onSnapshot(
          renterRentalsQuery,
          (snapshot) => {
            const renterRentals = snapshot.docs.map((doc) => ({
              id: doc.id,
              ...doc.data(),
            }));
            setRentals((prev) => {
              updateBalance(prev.asOwner, renterRentals);
              return { ...prev, asRenter: renterRentals };
            });
          },
          (error) => {
            console.error("Error en listener de inquilino:", error);
            setError("Error al cargar los alquileres como inquilino");
          }
        );
      } catch (error) {
        console.error("Error al inicializar:", error);
        setError("Error al cargar los datos. Por favor, intenta de nuevo.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();

    // Limpiar listeners al desmontar
    return () => {
      if (ownerUnsubscribe) ownerUnsubscribe();
      if (renterUnsubscribe) renterUnsubscribe();
    };
  }, [user, updateBalance]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    let date;
    try {
      // Si es un timestamp de Firestore
      if (timestamp.toDate) {
        date = timestamp.toDate();
      }
      // Si es un timestamp de JavaScript
      else if (timestamp instanceof Date) {
        date = timestamp;
      }
      // Si es un número (timestamp en milisegundos)
      else if (typeof timestamp === "number") {
        date = new Date(timestamp);
      }
      // Si es un string de fecha
      else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else {
        console.warn("Formato de fecha no reconocido:", timestamp);
        return "Fecha no disponible";
      }

      return new Intl.DateTimeFormat("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }).format(date);
    } catch (error) {
      console.error("Error al formatear fecha:", error);
      return "Fecha no disponible";
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "active":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const TestimonialForm = () => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!user) {
        toast.error("Debes iniciar sesión para dejar un testimonio");
        navigate("/login");
        return;
      }

      if (!comment.trim()) {
        toast.error("Por favor, escribe un comentario");
        return;
      }

      setSubmitting(true);
      try {
        const testimonialData = {
          userId: user.uid,
          userName: user.displayName || "Usuario",
          userPhoto: user.photoURL || "https://via.placeholder.com/60",
          rating,
          comment: comment.trim(),
          createdAt: serverTimestamp(),
          status: "active", // Agregamos un estado para moderación
        };

        // Verificar que todos los campos requeridos estén presentes
        if (!testimonialData.userId || !testimonialData.comment) {
          throw new Error("Faltan campos requeridos");
        }

        await addDoc(collection(db, "testimonials"), testimonialData);

        toast.success("¡Gracias por compartir tu experiencia!");
        setComment("");
        setRating(5);
      } catch (error) {
        console.error("Error al enviar testimonio:", error);
        if (error.code === "permission-denied") {
          toast.error(
            "No tienes permisos para enviar testimonios. Por favor, contacta al soporte."
          );
        } else {
          toast.error(
            "Error al enviar tu testimonio. Por favor, intenta de nuevo."
          );
        }
      } finally {
        setSubmitting(false);
      }
    };

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Comparte tu experiencia
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Calificación
            </label>
            <div className="flex items-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="focus:outline-none"
                >
                  <svg
                    className={`w-8 h-8 ${
                      star <= rating ? "text-[#FFC107]" : "text-gray-300"
                    }`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="comment"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tu comentario
            </label>
            <textarea
              id="comment"
              rows="4"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:border-[#009688]"
              placeholder="Cuéntanos tu experiencia con Alquilalo..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              maxLength={500}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={`w-full bg-[#009688] text-white font-bold py-2 px-4 rounded-lg hover:bg-[#00796B] transition-colors ${
              submitting ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {submitting ? "Enviando..." : "Enviar testimonio"}
          </button>
        </form>
      </div>
    );
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
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-[#009688] mb-8">Mi Cuenta</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
              <span>{error}</span>
              <button
                onClick={() => window.location.reload()}
                className="text-red-700 hover:text-red-900 font-medium"
              >
                Reintentar
              </button>
            </div>
          )}

          {/* Balance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Balance Disponible
              </h3>
              <p className="text-3xl font-bold text-[#009688]">
                {formatCurrency(balance.available)}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Pendiente
              </h3>
              <p className="text-3xl font-bold text-[#FFC107]">
                {formatCurrency(balance.pending)}
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Balance Total
              </h3>
              <p className="text-3xl font-bold text-gray-800">
                {formatCurrency(balance.total)}
              </p>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg mb-8">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "overview"
                      ? "border-[#009688] text-[#009688]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Resumen
                </button>
                <button
                  onClick={() => setActiveTab("asOwner")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "asOwner"
                      ? "border-[#009688] text-[#009688]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Mis Alquileres (Como Propietario)
                </button>
                <button
                  onClick={() => setActiveTab("asRenter")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "asRenter"
                      ? "border-[#009688] text-[#009688]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Mis Alquileres (Como Inquilino)
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Próximos Alquileres
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...rentals.asOwner, ...rentals.asRenter]
                        .filter(
                          (rental) =>
                            rental.status === "pending" ||
                            rental.status === "active"
                        )
                        .slice(0, 4)
                        .map((rental) => (
                          <div
                            key={rental.id}
                            className="bg-gray-50 rounded-lg p-4"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {rental.itemTitle}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {rental.ownerId === auth.currentUser.uid
                                    ? "Como Propietario"
                                    : "Como Inquilino"}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                                  rental.status
                                )}`}
                              >
                                {rental.status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                              {formatDate(rental.startDate)} -{" "}
                              {formatDate(rental.endDate)}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "asOwner" && (
                <div className="space-y-4">
                  {rentals.asOwner.map((rental) => (
                    <div key={rental.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{rental.itemTitle}</p>
                          <p className="text-sm text-gray-500">
                            Alquilado por: {rental.renterName}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            rental.status
                          )}`}
                        >
                          {rental.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Fecha: {formatDate(rental.startDate)} -{" "}
                            {formatDate(rental.endDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duración: {rental.duration} días
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Total: {formatCurrency(rental.totalAmount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Fee: {formatCurrency(rental.totalAmount * 0.1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "asRenter" && (
                <div className="space-y-4">
                  {rentals.asRenter.map((rental) => (
                    <div key={rental.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{rental.itemTitle}</p>
                          <p className="text-sm text-gray-500">
                            Propietario: {rental.ownerName}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            rental.status
                          )}`}
                        >
                          {rental.status}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Fecha: {formatDate(rental.startDate)} -{" "}
                            {formatDate(rental.endDate)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Duración: {rental.duration} días
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Total: {formatCurrency(rental.totalAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <TestimonialForm />
        </div>
      </main>
    </div>
  );
}

export default AccountPage;
