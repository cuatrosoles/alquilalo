/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
} from "firebase/firestore";
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-hot-toast";
import Calendario from "../components/Calendario";
import RentalStats from "../components/RentalStats";
import {
  format,
  parseISO,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import { es } from "date-fns/locale";

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
  const [selectedRental, setSelectedRental] = useState(null);
  const [showRentalDetails, setShowRentalDetails] = useState(false);
  const [calendarView, setCalendarView] = useState({
    mode: "month", // 'month' o 'week'
    selectedDate: new Date(),
  });
  const [stats, setStats] = useState({
    totalRentals: 0,
    activeRentals: 0,
    completedRentals: 0,
    totalEarnings: 0,
    totalSpent: 0,
    averageRating: 0,
  });

  // Verificar autenticación
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
  }, [user, navigate]);

  const calculateStats = useCallback((ownerRentals, renterRentals) => {
    const allRentals = [...ownerRentals, ...renterRentals];
    const stats = {
      totalRentals: allRentals.length,
      activeRentals: allRentals.filter((r) => r.status === "in_progress")
        .length,
      completedRentals: allRentals.filter((r) => r.status === "completed")
        .length,
      totalEarnings: ownerRentals.reduce(
        (sum, r) =>
          r.status === "completed"
            ? sum + (r.reservationAmount - r.reservationFee)
            : sum,
        0
      ),
      totalSpent: renterRentals.reduce(
        (sum, r) =>
          r.status === "completed" ? sum + r.reservationAmount : sum,
        0
      ),
      averageRating: 0,
    };

    // Calcular rating promedio
    const ratedRentals = allRentals.filter((r) => r.rating);
    if (ratedRentals.length > 0) {
      stats.averageRating =
        ratedRentals.reduce((sum, r) => sum + r.rating, 0) /
        ratedRentals.length;
    }

    setStats(stats);
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
              calculateStats(ownerRentals, prev.asRenter);
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
              calculateStats(prev.asOwner, renterRentals);
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

    return () => {
      if (ownerUnsubscribe) ownerUnsubscribe();
      if (renterUnsubscribe) renterUnsubscribe();
    };
  }, [user, calculateStats]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";

    let date;
    try {
      if (timestamp.toDate) {
        date = timestamp.toDate();
      } else if (timestamp instanceof Date) {
        date = timestamp;
      } else if (typeof timestamp === "number") {
        date = new Date(timestamp);
      } else if (typeof timestamp === "string") {
        date = new Date(timestamp);
      } else {
        console.warn("Formato de fecha no reconocido:", timestamp);
        return "Fecha no disponible";
      }

      return format(date, "PPP", { locale: es });
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
      case "pending_reservation":
        return "bg-yellow-100 text-yellow-800";
      case "reserved":
        return "bg-blue-100 text-blue-800";
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending_reservation":
        return "Pendiente de Reserva";
      case "reserved":
        return "Reservado";
      case "in_progress":
        return "En Progreso";
      case "completed":
        return "Completado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const handleRentalClick = (rental) => {
    setSelectedRental(rental);
    setShowRentalDetails(true);
  };

  const handleEditRental = (rental) => {
    // Implementar navegación a la página de edición
    navigate(`/editar-alquiler/${rental.id}`);
  };

  const handleCalendarDateClick = (date) => {
    setCalendarView((prev) => ({
      ...prev,
      selectedDate: date,
    }));
  };

  const getRentalsForDate = (date) => {
    return [...rentals.asOwner, ...rentals.asRenter].filter((rental) => {
      let startDate, endDate;

      try {
        // Intentar convertir las fechas a objetos Date
        if (rental.startDate?.toDate) {
          startDate = rental.startDate.toDate();
        } else if (rental.startDate instanceof Date) {
          startDate = rental.startDate;
        } else if (typeof rental.startDate === "string") {
          startDate = new Date(rental.startDate);
        } else if (typeof rental.startDate === "number") {
          startDate = new Date(rental.startDate);
        }

        if (rental.endDate?.toDate) {
          endDate = rental.endDate.toDate();
        } else if (rental.endDate instanceof Date) {
          endDate = rental.endDate;
        } else if (typeof rental.endDate === "string") {
          endDate = new Date(rental.endDate);
        } else if (typeof rental.endDate === "number") {
          endDate = new Date(rental.endDate);
        }

        // Verificar que las fechas sean válidas
        if (
          !startDate ||
          !endDate ||
          isNaN(startDate.getTime()) ||
          isNaN(endDate.getTime())
        ) {
          console.warn("Fechas inválidas para el alquiler:", rental.id);
          return false;
        }

        return isWithinInterval(date, { start: startDate, end: endDate });
      } catch (error) {
        console.error(
          "Error al procesar fechas del alquiler:",
          rental.id,
          error
        );
        return false;
      }
    });
  };

  const RentalDetailsModal = ({ rental, onClose }) => {
    if (!rental) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold text-gray-900">
              Detalles del Alquiler
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            {/* Información del artículo */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Artículo</h4>
              <div className="flex items-start gap-4">
                {rental.itemInfo?.images?.[0] && (
                  <img
                    src={rental.itemInfo.images[0]}
                    alt={rental.itemInfo.title}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div>
                  <p className="font-medium">{rental.itemInfo?.title}</p>
                  <p className="text-sm text-gray-600">
                    {rental.itemInfo?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Información del alquiler */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">Detalles del Alquiler</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p
                    className={`font-medium ${getStatusBadgeClass(
                      rental.status
                    )} px-2 py-1 rounded-full inline-block`}
                  >
                    {getStatusText(rental.status)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Reserva</p>
                  <p className="font-medium">
                    {formatCurrency(rental.reservationAmount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    Comisión: {formatCurrency(rental.reservationFee)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de inicio</p>
                  <p className="font-medium">{formatDate(rental.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de fin</p>
                  <p className="font-medium">{formatDate(rental.endDate)}</p>
                </div>
                {rental.startTime && rental.endTime && (
                  <>
                    <div>
                      <p className="text-sm text-gray-600">Hora de inicio</p>
                      <p className="font-medium">{rental.startTime}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Hora de fin</p>
                      <p className="font-medium">{rental.endTime}</p>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Información del usuario */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold mb-2">
                {rental.ownerId === user.uid
                  ? "Información del Inquilino"
                  : "Información del Propietario"}
              </h4>
              <div className="flex items-center gap-4">
                <img
                  src={
                    rental.ownerId === user.uid
                      ? rental.renterInfo?.photoURL
                      : rental.ownerInfo?.photoURL
                  }
                  alt="Usuario"
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <p className="font-medium">
                    {rental.ownerId === user.uid
                      ? rental.renterInfo?.name
                      : rental.ownerInfo?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {rental.ownerId === user.uid
                      ? rental.renterInfo?.email
                      : rental.ownerInfo?.email}
                  </p>
                  <p className="text-sm text-gray-600">
                    {rental.ownerId === user.uid
                      ? rental.renterInfo?.phone
                      : rental.ownerInfo?.phone}
                  </p>
                </div>
              </div>
            </div>

            {/* Mensajes */}
            {rental.messages && rental.messages.length > 0 && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Mensajes</h4>
                <div className="space-y-2">
                  {rental.messages.map((message, index) => (
                    <div
                      key={index}
                      className={`p-2 rounded-lg ${
                        message.senderId === user.uid
                          ? "bg-blue-100 ml-4"
                          : "bg-gray-100 mr-4"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(message.timestamp)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Botones de acción */}
            <div className="flex justify-end gap-4 mt-4">
              <button
                onClick={() => handleEditRental(rental)}
                className="bg-[#009688] text-white px-4 py-2 rounded-lg hover:bg-[#00796B] transition-colors"
              >
                Editar Alquiler
              </button>
              {rental.status === "pending_reservation" && (
                <button
                  onClick={() => navigate(`/pagar-reserva/${rental.id}`)}
                  className="bg-[#FFC107] text-white px-4 py-2 rounded-lg hover:bg-[#FFA000] transition-colors"
                >
                  Pagar Reserva
                </button>
              )}
            </div>
          </div>
        </div>
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
                  onClick={() => setActiveTab("calendar")}
                  className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                    activeTab === "calendar"
                      ? "border-[#009688] text-[#009688]"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  Calendario
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
                  <RentalStats
                    rentals={[...rentals.asOwner, ...rentals.asRenter]}
                    stats={stats}
                  />
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Próximos Alquileres
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...rentals.asOwner, ...rentals.asRenter]
                        .filter(
                          (rental) =>
                            rental.status === "reserved" ||
                            rental.status === "in_progress"
                        )
                        .slice(0, 4)
                        .map((rental) => (
                          <div
                            key={rental.id}
                            className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleRentalClick(rental)}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {rental.itemInfo?.title}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {rental.ownerId === user.uid
                                    ? "Como Propietario"
                                    : "Como Inquilino"}
                                </p>
                              </div>
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                                  rental.status
                                )}`}
                              >
                                {getStatusText(rental.status)}
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

              {activeTab === "calendar" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      Calendario de Alquileres
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          setCalendarView((prev) => ({
                            ...prev,
                            mode: "month",
                          }))
                        }
                        className={`px-4 py-2 rounded-lg ${
                          calendarView.mode === "month"
                            ? "bg-[#009688] text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Mes
                      </button>
                      <button
                        onClick={() =>
                          setCalendarView((prev) => ({
                            ...prev,
                            mode: "week",
                          }))
                        }
                        className={`px-4 py-2 rounded-lg ${
                          calendarView.mode === "week"
                            ? "bg-[#009688] text-white"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        Semana
                      </button>
                    </div>
                  </div>
                  <Calendario
                    mode="single"
                    selected={calendarView.selectedDate}
                    onChange={handleCalendarDateClick}
                    filterDate={(date) => {
                      const rentals = getRentalsForDate(date);
                      return {
                        available: rentals.length > 0,
                        rentals: rentals,
                      };
                    }}
                    className="w-full"
                  />
                  {calendarView.selectedDate && (
                    <div className="mt-4">
                      <h4 className="font-semibold mb-2">
                        Alquileres para {formatDate(calendarView.selectedDate)}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {getRentalsForDate(calendarView.selectedDate).map(
                          (rental) => (
                            <div
                              key={rental.id}
                              className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                              onClick={() => handleRentalClick(rental)}
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="font-medium">
                                    {rental.itemInfo?.title}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {rental.ownerId === user.uid
                                      ? "Como Propietario"
                                      : "Como Inquilino"}
                                  </p>
                                </div>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                                    rental.status
                                  )}`}
                                >
                                  {getStatusText(rental.status)}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-2">
                                {rental.startTime} - {rental.endTime}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "asOwner" && (
                <div className="space-y-4">
                  {rentals.asOwner.map((rental) => (
                    <div
                      key={rental.id}
                      className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleRentalClick(rental)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {rental.itemInfo?.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Alquilado por: {rental.renterInfo?.name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            rental.status
                          )}`}
                        >
                          {getStatusText(rental.status)}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Fecha: {formatDate(rental.startDate)} -{" "}
                            {formatDate(rental.endDate)}
                          </p>
                          {rental.startTime && rental.endTime && (
                            <p className="text-sm text-gray-600">
                              Horario: {rental.startTime} - {rental.endTime}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Reserva: {formatCurrency(rental.reservationAmount)}
                          </p>
                          <p className="text-xs text-gray-500">
                            Comisión: {formatCurrency(rental.reservationFee)}
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
                    <div
                      key={rental.id}
                      className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => handleRentalClick(rental)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">
                            {rental.itemInfo?.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            Propietario: {rental.ownerInfo?.name}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                            rental.status
                          )}`}
                        >
                          {getStatusText(rental.status)}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            Fecha: {formatDate(rental.startDate)} -{" "}
                            {formatDate(rental.endDate)}
                          </p>
                          {rental.startTime && rental.endTime && (
                            <p className="text-sm text-gray-600">
                              Horario: {rental.startTime} - {rental.endTime}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            Reserva: {formatCurrency(rental.reservationAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modal de detalles del alquiler */}
      {showRentalDetails && selectedRental && (
        <RentalDetailsModal
          rental={selectedRental}
          onClose={() => setShowRentalDetails(false)}
        />
      )}
    </div>
  );
}

export default AccountPage;
