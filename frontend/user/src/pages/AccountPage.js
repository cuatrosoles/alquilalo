import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../config/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";

function AccountPage() {
  const navigate = useNavigate();
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

        const user = auth.currentUser;
        if (!user) {
          navigate("/login");
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
          where("renterId", "==", user.uid),
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
  }, [navigate, updateBalance]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
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
        </div>
      </main>
    </div>
  );
}

export default AccountPage;
