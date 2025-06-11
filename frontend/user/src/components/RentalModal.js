import React, { useState } from "react";
import { auth } from "../config/firebase";
import axiosInstance from "../services/api";
import PaymentService from "../services/payment.service";
import { ArrowPathIcon, XCircleIcon } from "@heroicons/react/24/outline";

const DEPOSIT_PERCENTAGE = 30; // Porcentaje del depósito en garantía
const PLATFORM_FEE_PERCENTAGE = 12; // Porcentaje de fee de la plataforma

// Función para validar contenido de contacto
const validateContactInfo = (text) => {
  const contactPatterns = [
    /\b\d{10,}\b/, // Números de teléfono
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Emails
    /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|facebook\.com|twitter\.com|linkedin\.com|whatsapp\.com)\/[^\s]+/i, // Redes sociales
    /\b(?:@|#)[^\s]+\b/, // Menciones y hashtags
    /\b(?:whatsapp|wsp|telegram|ig|fb|insta|tweet|linkedin)\b/i, // Palabras clave de redes
    /\b(?:contacto|contactar|llamar|mensaje|mensajear|escribir|escribime)\b/i, // Palabras clave de contacto
  ];

  return contactPatterns.some((pattern) => pattern.test(text));
};

const RentalModal = ({
  isOpen,
  onClose,
  item,
  selectedDate,
  selectedTimeSlot,
  totalPrice,
  onTotalPriceChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [notes, setNotes] = useState("");
  const [showDepositInfo, setShowDepositInfo] = useState(true);
  const [contactWarning, setContactWarning] = useState(false);

  // Calcular el depósito en garantía y el fee de la plataforma
  const depositAmount = (totalPrice * DEPOSIT_PERCENTAGE) / 100;
  const platformFee = (depositAmount * PLATFORM_FEE_PERCENTAGE) / 100;

  const handleNotesChange = (e) => {
    const newNotes = e.target.value;
    setNotes(newNotes);
    setContactWarning(validateContactInfo(newNotes));
  };

  const handlePayment = async (rentalData) => {
    try {
      setPaymentProcessing(true);
      setError(null);

      // Create payment preference
      const paymentData = await PaymentService.createPaymentPreference(
        {
          ...rentalData,
          notes,
          depositAmount,
          platformFee,
        },
        depositAmount,
        `Reserva de ${item.title}`
      );

      // Redirect to MercadoPago checkout
      window.location.href =
        paymentData.init_point || paymentData.sandbox_init_point;
    } catch (error) {
      console.error("Error processing payment:", error);
      setError(
        error.response?.data?.message ||
          "Error al procesar el pago. Intente nuevamente."
      );
      setPaymentProcessing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!auth.currentUser) {
        throw new Error("Debes iniciar sesión para realizar una reserva");
      }

      const token = await auth.currentUser.getIdToken(true);

      // Preparar los datos del alquiler
      const rentalData = {
        itemId: item.id,
        userId: auth.currentUser.uid,
        ownerId: item.userId,
        startDate:
          item.priceType === "daily"
            ? selectedDate.start.toISOString().split("T")[0]
            : selectedDate.toISOString().split("T")[0],
        endDate:
          item.priceType === "daily"
            ? selectedDate.end.toISOString().split("T")[0]
            : selectedDate.toISOString().split("T")[0],
        startTime: selectedTimeSlot?.start || null,
        endTime: selectedTimeSlot?.end || null,
        totalPrice: Number(totalPrice),
        depositAmount,
        platformFee,
        status: "pending_payment",
        paymentMethod: "mercadopago",
        notes,
      };

      // First create the rental with pending_payment status
      const response = await axiosInstance.post("/rentals", rentalData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Then initiate payment
      await handlePayment({
        ...rentalData,
        rentalId: response.data.id,
      });
    } catch (error) {
      console.error("Error creating rental:", error);
      setError(
        error.response?.data?.message ||
          "Error al crear la reserva. Por favor, intente nuevamente."
      );
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              Confirmar Reserva
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              disabled={loading || paymentProcessing}
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md flex items-center">
              <XCircleIcon className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">
                Detalles del Artículo
              </h3>
              <p className="text-gray-600">{item.title}</p>
              <p className="text-gray-600">
                {item.priceType === "hourly"
                  ? "Alquiler por hora"
                  : "Alquiler por día"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">
                Detalles del Alquiler
              </h3>
              <p className="text-gray-600">
                Fecha:{" "}
                {selectedDate.start
                  ? `${selectedDate.start.toLocaleDateString()} - ${selectedDate.end.toLocaleDateString()}`
                  : selectedDate.toLocaleDateString()}
              </p>
              {selectedTimeSlot && (
                <p className="text-gray-600">
                  Horario: {selectedTimeSlot.start} - {selectedTimeSlot.end}
                </p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Resumen de Pagos</h3>
              <div className="mt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total del alquiler:</span>
                  <span className="font-medium">
                    ${totalPrice.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <div className="flex items-center">
                    <span className="text-gray-600">
                      Depósito de garantía ({DEPOSIT_PERCENTAGE}%):
                    </span>
                    <button
                      onClick={() => setShowDepositInfo(!showDepositInfo)}
                      className="ml-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {showDepositInfo ? "Menos info" : "Más info"}
                    </button>
                  </div>
                  <span className="font-medium">
                    ${depositAmount.toLocaleString()}
                  </span>
                </div>

                {showDepositInfo && (
                  <div className="bg-blue-50 p-3 rounded-md text-sm text-blue-700 mt-2">
                    <p className="mb-1">
                      El depósito de garantía se devuelve al finalizar el
                      alquiler si el artículo se devuelve en buenas condiciones.
                    </p>
                    <p>
                      La plataforma retiene una comisión del{" "}
                      {PLATFORM_FEE_PERCENTAGE}% ($
                      {platformFee.toLocaleString()}) por el servicio.
                    </p>
                  </div>
                )}

                <div className="border-t border-gray-200 my-2"></div>
                <div className="flex justify-between font-semibold">
                  <span>Total a pagar ahora:</span>
                  <span>${depositAmount.toLocaleString()}</span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  El resto se pagará directamente al propietario al momento de
                  la entrega.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="block text-sm font-medium text-gray-700"
              >
                Notas adicionales (opcional)
              </label>
              <textarea
                id="notes"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Necesito que el artículo esté disponible a las 9 AM puntual."
                value={notes}
                onChange={handleNotesChange}
                disabled={loading || paymentProcessing}
              />
              {contactWarning && (
                <p className="text-sm text-yellow-600">
                  Por favor, no incluya información de contacto en las notas.
                  Puede comunicarse con el propietario a través del chat una vez
                  confirmada la reserva.
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading || paymentProcessing}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || paymentProcessing || contactWarning}
                className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  loading || paymentProcessing || contactWarning
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }`}
              >
                {paymentProcessing ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                    Procesando pago...
                  </span>
                ) : loading ? (
                  <span className="flex items-center">
                    <ArrowPathIcon className="animate-spin h-4 w-4 mr-2" />
                    Creando reserva...
                  </span>
                ) : (
                  "Pagar Depósito y Reservar"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RentalModal;
