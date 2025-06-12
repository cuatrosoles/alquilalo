/* eslint-disable no-unused-vars */
// frontend/user/src/pages/ItemDetailPage.js
import React, { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api";
import Calendario from "../components/Calendario";
import Mapa from "../components/Mapa";
import RentalModal from "../components/RentalModal";
import RelatedItems from "../components/RelatedItems";

function ItemDetailPage() {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showMagnifier, setShowMagnifier] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [dateRange, setDateRange] = useState({ start: null, end: null });
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [showRentalModal, setShowRentalModal] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showResetButton, setShowResetButton] = useState(false);

  // Función para obtener las franjas horarias disponibles para una fecha
  const getAvailableTimeSlots = useCallback(
    (date) => {
      if (!item || !item.availability) return [];
      const dayOfWeek = getDayOfWeek(date);
      if (!item.availability.days[dayOfWeek]?.enabled) {
        return [];
      }

      // Obtener todas las franjas horarias del día
      const allSlots = item.availability.days[dayOfWeek].slots;

      // Asegurarnos de que blockedDates esté inicializado
      const blockedDates = item.availability.blockedDates || [];

      // Filtrar las franjas horarias que están bloqueadas
      const availableSlots = allSlots.filter((slot) => {
        const isBlocked = blockedDates.some((blocked) => {
          const blockedDate = new Date(blocked.startDate);
          blockedDate.setHours(0, 0, 0, 0);
          const checkDate = new Date(date);
          checkDate.setHours(0, 0, 0, 0);

          // Verificar si es el mismo día y si las franjas horarias se superponen
          return (
            blockedDate.getTime() === checkDate.getTime() &&
            blocked.startTime <= slot.end &&
            blocked.endTime >= slot.start
          );
        });

        return !isBlocked;
      });

      return availableSlots;
    },
    [item]
  );

  const handleMouseMove = (e) => {
    const { left, top, width, height } =
      e.currentTarget.getBoundingClientRect();
    const x = Math.min(Math.max(((e.pageX - left) / width) * 100, 0), 100);
    const y = Math.min(Math.max(((e.pageY - top) / height) * 100, 0), 100);
    setMousePosition({ x, y });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemResponse, reviewsResponse] = await Promise.all([
          api.get(`/items/${id}`),
          api.get(`/reviews/item/${id}`),
        ]);

        // Asegurarnos de que availability.blockedDates esté inicializado
        const itemData = {
          ...itemResponse.data,
          availability: {
            ...itemResponse.data.availability,
            blockedDates: itemResponse.data.availability?.blockedDates || [],
          },
        };

        //console.log(
        //  "Datos de availability recibidos:",
        //  itemData.availability.blockedDates
        //);
        setItem(itemData);
        setReviews(reviewsResponse.data);

        const today = new Date();
        setAvailableTimeSlots(getAvailableTimeSlots(today));
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [id, getAvailableTimeSlots]);

  // Nuevo getDayOfWeek robusto
  const getDayOfWeek = (date) => {
    const days = [
      "sunday",
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
    ];
    return days[date.getDay()];
  };

  // Función para verificar si una fecha está disponible
  const isDateAvailable = (date) => {
    if (!item || !item.availability) {
      return false;
    }

    // Verificar el día de la semana
    const dayOfWeek = getDayOfWeek(date);
    const isEnabled = item.availability.days[dayOfWeek]?.enabled || false;

    // Verificar si la fecha es futura
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    const isFuture = checkDate >= today;

    // Verificar si la fecha está bloqueada comparando solo las fechas sin considerar la hora
    const isBlocked =
      item.availability.blockedDates?.some((blocked) => {
        // Convertir las fechas a strings YYYY-MM-DD para comparar solo las fechas
        const blockedStart = new Date(blocked.startDate);
        const blockedEnd = new Date(blocked.endDate);
        const checkDateStr = checkDate.toISOString().split("T")[0];
        const blockedStartStr = blockedStart.toISOString().split("T")[0];
        const blockedEndStr = blockedEnd.toISOString().split("T")[0];

        return checkDateStr >= blockedStartStr && checkDateStr <= blockedEndStr;
      }) || false;

    return {
      available: isEnabled && isFuture && !isBlocked,
      isBlocked: isBlocked,
    };
  };

  // Función para manejar la selección de fecha
  const handleDateSelect = (date) => {
    if (!date) return;

    if (item.priceType === "daily") {
      // Para alquiler por días, actualizamos el rango de fechas
      if (date.startDate && date.endDate) {
        setDateRange({
          start: date.startDate,
          end: date.endDate,
        });
        setShowResetButton(true);
      }
    } else {
      // Para alquiler por horas, mantenemos la selección de fecha única
      setSelectedDate(date);
      setSelectedTimeSlot(null);
      setAvailableTimeSlots(getAvailableTimeSlots(date));
      setShowResetButton(true);
    }
  };

  // Función para reiniciar la selección de fechas
  const handleResetSelection = () => {
    if (item.priceType === "daily") {
      setDateRange({ start: null, end: null });
    } else {
      setSelectedDate(new Date());
      setSelectedTimeSlot(null);
      setAvailableTimeSlots([]);
    }
    setShowResetButton(false);
  };

  // Función para manejar la selección de franja horaria
  const handleTimeSlotSelect = (slot) => {
    setSelectedTimeSlot(slot);
  };

  // Función para calcular el número de días entre dos fechas
  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  // Función para calcular el precio total
  const calculateTotalPrice = () => {
    if (item.priceType === "daily") {
      if (!dateRange.start || !dateRange.end) return 0;

      const days = calculateDays(dateRange.start, dateRange.end);
      return days * item.pricePerDay;
    } else {
      if (!selectedTimeSlot) return 0;

      const [startHour, startMinute] = selectedTimeSlot.start
        .split(":")
        .map(Number);
      const [endHour, endMinute] = selectedTimeSlot.end.split(":").map(Number);

      const startTime = startHour + startMinute / 60;
      const endTime = endHour + endMinute / 60;
      const hours = endTime - startTime;

      return hours * item.pricePerHour;
    }
  };

  // Componente para mostrar las franjas horarias disponibles
  const renderTimeSlots = () => {
    if (availableTimeSlots.length === 0) {
      return (
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            No hay franjas horarias disponibles para esta fecha
          </p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-2">
        {availableTimeSlots.map((slot, index) => (
          <button
            key={index}
            onClick={() => handleTimeSlotSelect(slot)}
            className={`p-2 text-sm rounded-md border ${
              selectedTimeSlot === slot
                ? "bg-[#FFC107] text-white border-[#FFC107]"
                : "bg-white text-gray-700 border-gray-300 hover:border-[#FFC107]"
            }`}
          >
            {slot.start} - {slot.end}
          </button>
        ))}
      </div>
    );
  };

  // Componente para mostrar la disponibilidad semanal
  const renderWeeklyAvailability = () => {
    const days = {
      monday: "Lunes",
      tuesday: "Martes",
      wednesday: "Miércoles",
      thursday: "Jueves",
      friday: "Viernes",
      saturday: "Sábado",
      sunday: "Domingo",
    };

    return (
      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Disponibilidad semanal</h4>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(days).map(([key, label]) => (
            <div key={key} className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  item.availability.days[key].enabled
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />
              <span className="text-sm text-gray-700">{label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Función para verificar si se puede realizar el alquiler
  const canRent = () => {
    if (item.priceType === "daily") {
      return dateRange.start && dateRange.end;
    } else {
      return selectedDate && selectedTimeSlot;
    }
  };

  const handleReserve = async () => {
    try {
      setIsLoading(true);
      setError("");

      if (item.priceType === "daily") {
        if (!dateRange.start || !dateRange.end) {
          setError("Por favor selecciona un rango de fechas");
          return;
        }
      } else {
        if (!selectedDate || !selectedTimeSlot) {
          setError("Por favor selecciona una fecha y horario");
          return;
        }
      }

      setShowRentalModal(true);
    } catch (error) {
      console.error("Error al preparar la reserva:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  if (!item) {
    return <div>Cargando...</div>;
  }

  // Convertir la ubicación del item a formato de posición para el mapa
  const mapPosition =
    item.location && item.location.latitude && item.location.longitude
      ? [item.location.latitude, item.location.longitude]
      : [-34.6037, -58.3816]; // Default: Buenos Aires

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Columna izquierda - Imágenes y detalles */}
            <div className="space-y-6">
              {/* Galería de imágenes */}
              <div className="bg-white rounded-lg shadow p-4">
                {/* Imagen principal */}
                <div
                  className="relative mb-4 overflow-hidden rounded-lg"
                  onMouseEnter={() => setShowMagnifier(true)}
                  onMouseLeave={() => setShowMagnifier(false)}
                  onMouseMove={handleMouseMove}
                >
                  <img
                    src={item.images[selectedImage]}
                    alt={item.title}
                    className="w-full h-auto max-h-[500px] object-contain transition-transform duration-300"
                  />
                  {showMagnifier && (
                    <div
                      className="absolute pointer-events-none w-64 h-64 border-4 border-white rounded-full overflow-hidden shadow-2xl"
                      style={{
                        left: `${mousePosition.x}%`,
                        top: `${mousePosition.y}%`,
                        transform: "translate(-50%, -50%)",
                        backgroundImage: `url(${item.images[selectedImage]})`,
                        backgroundPosition: `${mousePosition.x}% ${mousePosition.y}%`,
                        backgroundSize: "300%",
                        backgroundRepeat: "no-repeat",
                        zIndex: 50,
                      }}
                    />
                  )}
                </div>
                {/* Grid de miniaturas */}
                <div className="grid grid-cols-6 gap-2">
                  {item.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`relative aspect-square cursor-pointer group overflow-hidden rounded-lg border-2 ${
                        selectedImage === index
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${item.title} - Imagen ${index + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reseñas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-xl font-bold mb-4">Reseñas</h3>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="border-b pb-4 mb-4">
                      <p className="font-bold">Puntuación: {review.rating}</p>
                      <p>{review.comment}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p>Aún no hay reseñas para este artículo.</p>
                )}
              </div>

              {/* Otros ítems del mismo usuario/categoría */}
              <div className="bg-white rounded-lg shadow p-6">
                <RelatedItems
                  currentItemId={id}
                  category={item.category}
                  ownerId={item.userId}
                  limit={4}
                />
              </div>
            </div>

            {/* Columna derecha - Información y reserva */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold mb-4">{item.title}</h2>
                <p className="text-gray-700 mb-4">{item.description}</p>

                <div className="mb-4">
                  <span className="text-2xl font-bold text-[#FFC107]">
                    $
                    {item.priceType === "hourly"
                      ? item.pricePerHour
                      : item.pricePerDay}
                  </span>
                  <span className="text-gray-500">
                    /{item.priceType === "hourly" ? "hora" : "día"}
                  </span>
                </div>

                {renderWeeklyAvailability()}

                <div className="mt-6 space-y-4">
                  <h4 className="font-semibold text-gray-900">
                    {item.priceType === "daily"
                      ? "Selecciona el rango de fechas"
                      : "Selecciona fecha y horario"}
                  </h4>

                  <div className="bg-white p-6 rounded-lg border border-gray-200 text-center">
                    {item.priceType === "daily" ? (
                      <div className="space-y-4">
                        <Calendario
                          mode="range"
                          rangeStart={dateRange.start}
                          rangeEnd={dateRange.end}
                          onChange={handleDateSelect}
                          filterDate={isDateAvailable}
                          minDate={new Date()}
                        />
                        {dateRange.start && dateRange.end && (
                          <div className="text-center text-sm text-gray-600">
                            <p>
                              Días seleccionados:{" "}
                              {calculateDays(dateRange.start, dateRange.end)}
                            </p>
                            <p>Precio total: ${calculateTotalPrice()}</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Calendario
                          mode="single"
                          selected={selectedDate}
                          onChange={handleDateSelect}
                          filterDate={isDateAvailable}
                          minDate={new Date()}
                        />
                        {selectedDate && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">
                              Franjas horarias disponibles:
                            </h5>
                            {renderTimeSlots()}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={handleReserve}
                      disabled={!canRent()}
                      className={`flex-1 py-3 px-4 rounded-lg font-medium ${
                        canRent()
                          ? "bg-[#FFC107] text-white hover:bg-[#FFB300]"
                          : "bg-gray-300 text-gray-500 cursor-not-allowed"
                      }`}
                    >
                      {isLoading ? "Procesando..." : "Alquilar ahora"}
                    </button>
                    {showResetButton && (
                      <button
                        onClick={handleResetSelection}
                        className="px-4 py-3 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                        title="Reiniciar selección"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Información del propietario */}
              <div className="bg-white rounded-lg shadow p-6 flex items-center gap-4">
                <img
                  src={item.ownerAvatar || "/images/user_icon.png"}
                  alt="Propietario"
                  className="h-12 w-12 rounded-full border-2 border-[#FFC107]"
                />
                <div>
                  <div className="font-semibold text-gray-800">
                    {item.ownerName || "Usuario"}
                  </div>
                  <div className="text-xs text-gray-500">
                    Reputación:{" "}
                    {item.ownerRating ? item.ownerRating.toFixed(1) : "N/A"} / 5
                  </div>
                  <div className="text-xs text-gray-500">Responde rápido</div>
                </div>
              </div>

              {/* Mapa de zona de entrega */}
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="font-semibold mb-2">Zona de entrega</h4>
                <Mapa position={mapPosition} editable={false} />
                <div className="text-xs text-gray-500 mt-2">
                  La ubicación mostrada es aproximada.
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de reserva */}
      <RentalModal
        isOpen={showRentalModal}
        onClose={() => setShowRentalModal(false)}
        item={item}
        selectedDate={item.priceType === "daily" ? dateRange : selectedDate}
        selectedTimeSlot={selectedTimeSlot}
        totalPrice={calculateTotalPrice()}
      />
    </div>
  );
}

export default ItemDetailPage;
