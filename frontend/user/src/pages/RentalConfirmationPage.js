import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const RentalConfirmationPage = () => {
  const { rentalId } = useParams();
  const navigate = useNavigate();
  const [rental, setRental] = useState(null);
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRentalData = async () => {
      try {
        const rentalDoc = await getDoc(doc(db, "rentals", rentalId));
        if (!rentalDoc.exists()) {
          throw new Error("Reserva no encontrada");
        }

        const rentalData = rentalDoc.data();
        setRental({
          id: rentalDoc.id,
          ...rentalData,
          startDate: rentalData.startDate,
          endDate: rentalData.endDate,
          createdAt: rentalData.createdAt,
          updatedAt: rentalData.updatedAt,
        });

        // Obtener datos del artículo
        const itemDoc = await getDoc(doc(db, "items", rentalData.itemId));
        if (itemDoc.exists()) {
          setItem({
            id: itemDoc.id,
            ...itemDoc.data(),
          });
        }
      } catch (err) {
        console.error("Error al cargar la reserva:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalData();
  }, [rentalId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFC107] mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Cargando detalles de la reserva...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-red-500 text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
              <p className="text-gray-600 mb-6">{error}</p>
              <button
                onClick={() => navigate("/")}
                className="px-4 py-2 bg-[#FFC107] text-white rounded-md hover:bg-[#ffb300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC107]"
              >
                Volver al inicio
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="text-green-500 text-5xl mb-4">✓</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Reserva confirmada!
            </h1>
            <p className="text-gray-600">
              Tu reserva ha sido procesada correctamente. Te hemos enviado un
              correo electrónico con los detalles.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Detalles de la reserva
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Número de reserva</p>
                  <p className="font-medium">{rental.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Estado</p>
                  <p className="font-medium capitalize">{rental.status}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Artículo</p>
                <p className="font-medium">{item?.title}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Fecha</p>
                  <p className="font-medium">{rental.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Horario</p>
                  <p className="font-medium">
                    {rental.startTime} - {rental.endTime}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-xl font-bold text-[#FFC107]">
                  ${rental.totalPrice.toFixed(2)}
                </p>
              </div>

              {rental.notes && (
                <div>
                  <p className="text-sm text-gray-500">Notas</p>
                  <p className="font-medium">{rental.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 flex justify-center space-x-4">
            <button
              onClick={() => navigate("/my-rentals")}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC107]"
            >
              Ver mis reservas
            </button>
            <button
              onClick={() => navigate("/")}
              className="px-4 py-2 bg-[#FFC107] text-white rounded-md hover:bg-[#ffb300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC107]"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalConfirmationPage;
