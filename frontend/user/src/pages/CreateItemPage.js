import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../config/firebase";
import { Autocomplete } from "@react-google-maps/api";
import GoogleMapsWrapper from "../components/GoogleMapsWrapper";

const CreateItemPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [autocomplete, setAutocomplete] = useState(null);
  const [mapsAvailable, setMapsAvailable] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    priceType: "hourly",
    pricePerDay: "",
    pricePerHour: "",
    location: {
      address: {
        street: "",
        zip: "",
        city: "",
        province: "",
        country: "Argentina",
      },
      latitude: "",
      longitude: "",
    },
    availability: {
      days: {
        monday: { enabled: false, slots: [] },
        tuesday: { enabled: false, slots: [] },
        wednesday: { enabled: false, slots: [] },
        thursday: { enabled: false, slots: [] },
        friday: { enabled: false, slots: [] },
        saturday: { enabled: false, slots: [] },
        sunday: { enabled: false, slots: [] },
      },
    },
    itemCondition: "excelent",
    itemDelivery: "envioPorCorreo",
  });

  const [selectedImages, setSelectedImages] = useState([]);
  const [mainImageIndex, setMainImageIndex] = useState(0);
  const [imagePreviewUrls, setImagePreviewUrls] = useState([]);
  const [selectedDay, setSelectedDay] = useState("monday");
  const [newSlot, setNewSlot] = useState({ start: "", end: "" });
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesRef = collection(db, "categories");
        const snapshot = await getDocs(categoriesRef);
        const categoriesList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategories(categoriesList);
      } catch (err) {
        setError("Error al cargar las categorías: " + err.message);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    return () => {
      setAutocomplete(null);
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "address") {
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          address: {
            ...prev.location.address,
            street: value,
          },
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handlePlaceSelect = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry) {
        const addressComponents = place.address_components;
        const streetNumber =
          addressComponents.find((component) =>
            component.types.includes("street_number")
          )?.long_name || "";
        const route =
          addressComponents.find((component) =>
            component.types.includes("route")
          )?.long_name || "";
        const city =
          addressComponents.find((component) =>
            component.types.includes("locality")
          )?.long_name || "";
        const province =
          addressComponents.find((component) =>
            component.types.includes("administrative_area_level_1")
          )?.long_name || "";
        const zip =
          addressComponents.find((component) =>
            component.types.includes("postal_code")
          )?.long_name || "";

        setFormData((prev) => ({
          ...prev,
          location: {
            address: {
              street: `${route} ${streetNumber}`.trim(),
              zip,
              city,
              province,
              country: "Argentina",
            },
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          },
        }));
      }
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));

    setSelectedImages((prev) => [...prev, ...files]);
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);
  };

  const removeImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => {
      const newUrls = prev.filter((_, i) => i !== index);
      if (mainImageIndex >= newUrls.length) {
        setMainImageIndex(Math.max(0, newUrls.length - 1));
      }
      return newUrls;
    });
  };

  const setMainImage = (index) => {
    setMainImageIndex(index);
  };

  const renderImagePreview = () => {
    if (imagePreviewUrls.length === 0) {
      return (
        <div className="text-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">No hay imágenes seleccionadas</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {imagePreviewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square relative overflow-hidden rounded-lg border-2 border-gray-200">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      title="Eliminar imagen"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMainImage(index)}
                      className={`p-2 rounded-full transition-colors ${
                        mainImageIndex === index
                          ? "bg-green-500 text-white"
                          : "bg-white text-gray-700 hover:bg-gray-100"
                      }`}
                      title={
                        mainImageIndex === index
                          ? "Imagen principal"
                          : "Establecer como imagen principal"
                      }
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                {mainImageIndex === index && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                    Principal
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center">
          <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC107]">
            Agregar más imágenes
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
      </div>
    );
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: {
          ...prev.availability.days,
          [day]: {
            ...prev.availability.days[day],
            enabled: !prev.availability.days[day].enabled,
          },
        },
      },
    }));
  };

  const handleAddSlot = (day) => {
    if (!newSlot.start || !newSlot.end) return;

    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: {
          ...prev.availability.days,
          [day]: {
            ...prev.availability.days[day],
            slots: [...prev.availability.days[day].slots, { ...newSlot }],
          },
        },
      },
    }));

    setNewSlot({ start: "", end: "" });
  };

  const handleRemoveSlot = (day, index) => {
    setFormData((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: {
          ...prev.availability.days,
          [day]: {
            ...prev.availability.days[day],
            slots: prev.availability.days[day].slots.filter(
              (_, i) => i !== index
            ),
          },
        },
      },
    }));
  };

  const renderAvailabilitySection = () => {
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
      <div className="space-y-6">
        <h3 className="text-lg font-medium text-gray-900">Disponibilidad</h3>
        <div
          className="grid grid-cols-1 md:grid-cols-2"
          style={{ fontSize: "0.6rem" }}
        >
          {/* Selector de días */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">
              Días disponibles
            </h4>
            <div className="space-y-2">
              {Object.entries(days).map(([key, label]) => (
                <div key={key} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`day-${key}`}
                    checked={formData.availability.days[key].enabled}
                    onChange={() => handleDayToggle(key)}
                    className="h-4 w-4 text-[#FFC107] focus:ring-[#FFC107] border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`day-${key}`}
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Gestión de franjas horarias - Solo visible para alquiler por horas */}
          {formData.priceType === "hourly" && (
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-gray-700">
                Franjas horarias
              </h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <select
                    value={selectedDay}
                    onChange={(e) => setSelectedDay(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
                  >
                    {Object.entries(days).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.availability.days[selectedDay].enabled && (
                  <>
                    <div className="flex items-center space-x-2">
                      <input
                        type="time"
                        value={newSlot.start}
                        onChange={(e) =>
                          setNewSlot((prev) => ({
                            ...prev,
                            start: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
                      />
                      <span className="text-gray-500">a</span>
                      <input
                        type="time"
                        value={newSlot.end}
                        onChange={(e) =>
                          setNewSlot((prev) => ({
                            ...prev,
                            end: e.target.value,
                          }))
                        }
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddSlot(selectedDay)}
                        className="px-4 py-2 bg-[#FFC107] text-white rounded-md hover:bg-[#ffb300] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC107]"
                      >
                        +
                      </button>
                    </div>

                    <div className="space-y-2">
                      {formData.availability.days[selectedDay].slots.map(
                        (slot, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 p-2 rounded-md"
                          >
                            <span className="text-sm text-gray-700">
                              {slot.start} - {slot.end}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                handleRemoveSlot(selectedDay, index)
                              }
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validaciones básicas
    if (!auth.currentUser) {
      setError("Debes iniciar sesión para publicar un artículo");
      setLoading(false);
      return;
    }

    console.log(formData);

    if (
      !formData.title ||
      !formData.description ||
      !formData.categoryId ||
      !formData.priceType ||
      (formData.priceType === "daily" && !formData.pricePerDay) ||
      (formData.priceType === "hourly" && !formData.pricePerHour) ||
      !formData.location.address.street ||
      !formData.itemDelivery
    ) {
      setError("Por favor, completa todos los campos requeridos");
      setLoading(false);
      return;
    }

    // Validar que al menos un día esté habilitado
    const hasEnabledDays = Object.values(formData.availability.days).some(
      (day) => day.enabled
    );
    if (!hasEnabledDays) {
      setError("Debes habilitar al menos un día de disponibilidad");
      setLoading(false);
      return;
    }

    // Validar franjas horarias solo si el tipo de precio es por horas
    if (formData.priceType === "hourly") {
      const hasValidSlots = Object.entries(formData.availability.days).every(
        ([day, data]) => {
          if (!data.enabled) return true;
          return data.slots.length > 0;
        }
      );

      if (!hasValidSlots) {
        setError("Cada día habilitado debe tener al menos una franja horaria");
        setLoading(false);
        return;
      }
    }

    if (selectedImages.length === 0) {
      setError("Debes seleccionar al menos una imagen");
      setLoading(false);
      return;
    }

    if (!acceptedTerms) {
      setError("Debes aceptar los Términos y Condiciones de Uso");
      setLoading(false);
      return;
    }

    try {
      // Si no hay coordenadas y no está disponible Google Maps, intentar geocodificación
      if (
        !mapsAvailable &&
        (!formData.location.latitude || !formData.location.longitude)
      ) {
        const location = await geocodeAddress(formData.location.address.street);
        if (location) {
          setFormData((prev) => ({
            ...prev,
            location: {
              address: location.address,
              latitude: location.latitude.toString(),
              longitude: location.longitude.toString(),
            },
          }));
        }
      }

      // Primero subir las imágenes a Firebase Storage
      const imageUrls = [];
      for (const image of selectedImages) {
        const timestamp = Date.now();
        const uniqueName = `${timestamp}_${image.name.replace(
          /[^a-zA-Z0-9.]/g,
          "_"
        )}`;
        const storageRef = ref(storage, `items/${uniqueName}`);

        const metadata = {
          contentType: image.type,
          customMetadata: {
            uploadedBy: auth.currentUser.uid,
            uploadedAt: timestamp.toString(),
          },
        };

        const uploadResult = await uploadBytes(storageRef, image, metadata);
        const url = await getDownloadURL(uploadResult.ref);
        imageUrls.push(url);
      }

      // Crear el objeto de datos para Firestore
      const itemData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        categoryId: formData.categoryId,
        featured: "no",
        priceType: formData.priceType,
        pricePerDay: parseFloat(formData.pricePerDay),
        pricePerHour:
          formData.priceType === "hourly"
            ? parseFloat(formData.pricePerHour)
            : null,
        images: imageUrls,
        mainImageIndex: mainImageIndex,
        createdAt: new Date(),
        userId: auth.currentUser.uid,
        status: "active",
        itemCondition: formData.itemCondition,
        itemDelivery: formData.itemDelivery,
        availability: formData.availability,
        location: {
          address: {
            street: formData.location.address.street.trim(),
            zip: formData.location.address.zip.trim(),
            city: formData.location.address.city.trim(),
            province: formData.location.address.province.trim(),
            country: formData.location.address.country.trim(),
          },
          latitude: formData.location.latitude
            ? parseFloat(formData.location.latitude)
            : null,
          longitude: formData.location.longitude
            ? parseFloat(formData.location.longitude)
            : null,
        },
      };

      // Guardar en Firestore
      const itemsRef = collection(db, "items");
      const docRef = await addDoc(itemsRef, itemData);
      navigate(`/item/${docRef.id}`);
    } catch (err) {
      console.error("Error completo:", err);
      setError(
        err.message ||
          "Error al crear el artículo. Por favor, intenta de nuevo."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderLocationInput = () => {
    if (!mapsAvailable) {
      return (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ubicación
          </label>
          <input
            type="text"
            name="address"
            value={formData.location.address.street || ""}
            onChange={handleInputChange}
            required
            placeholder="Ingresa la dirección completa (calle, número, ciudad)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
          />
          <p className="mt-1 text-sm text-gray-500">
            Ingresa la dirección completa para que el sistema pueda encontrar
            las coordenadas automáticamente
          </p>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ubicación
        </label>
        {window.google && window.google.maps && window.google.maps.places ? (
          <Autocomplete
            onLoad={(autocomplete) => {
              try {
                setAutocomplete(autocomplete);
              } catch (error) {
                console.error("Error al cargar el Autocomplete:", error);
                setMapsAvailable(false);
              }
            }}
            onPlaceChanged={handlePlaceSelect}
            restrictions={{ country: "ar" }}
          >
            <input
              type="text"
              name="address"
              defaultValue={formData.location.address.street || ""}
              onChange={handleInputChange}
              required
              placeholder="Ingresa la dirección"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
            />
          </Autocomplete>
        ) : (
          <input
            type="text"
            name="address"
            value={formData.location.address.street || ""}
            onChange={handleInputChange}
            required
            placeholder="Ingresa la dirección completa (calle, número, ciudad)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
          />
        )}
        <p className="mt-1 text-sm text-gray-500">
          Ingresa la dirección completa (calle, número, ciudad)
        </p>
      </div>
    );
  };

  const handleMapsAvailable = (available) => {
    setMapsAvailable(available);
  };

  const geocodeAddress = async (address) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&countrycodes=ar&limit=1`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // Extraer componentes de la dirección de Nominatim
        const addressParts = data[0].display_name.split(", ");
        const street = addressParts[0];
        const city = addressParts[1] || "";
        const province = addressParts[2] || "";
        const zip = addressParts[3] || "";

        return {
          address: {
            street,
            zip,
            city,
            province,
            country: "Argentina",
          },
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
        };
      }
      return null;
    } catch (error) {
      console.error("Error en geocodificación:", error);
      return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="w-full px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sección del formulario (75% del ancho) */}
          <div className="lg:w-3/4">
            <div className="p-8 bg-[#dddddd] rounded-xl">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Publicar un artículo
              </h1>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                  {/* Columna izquierda - Formulario */}
                  <div className="p-8 md:w-1/2">
                    <form
                      id="item-form"
                      onSubmit={handleSubmit}
                      className="space-y-6"
                    >
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Título
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
                          placeholder="Ingresa el título del artículo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Descripción
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          required
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
                          placeholder="Describe tu artículo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Categoría
                        </label>
                        <select
                          name="categoryId"
                          value={formData.categoryId}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
                        >
                          <option value="">Selecciona una categoría</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tipo de Precio
                        </label>
                        <select
                          name="priceType"
                          value={formData.priceType}
                          onChange={handleInputChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
                        >
                          <option value="">Selecciona el tipo de precio</option>
                          <option value="hourly">Por hora</option>
                          <option value="daily">Por día</option>
                        </select>
                      </div>

                      {formData.priceType === "hourly" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio (acorde a Tipo de Precio) por Hora/Día
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">
                              $
                            </span>
                            <input
                              type="number"
                              name="pricePerHour"
                              value={formData.pricePerHour}
                              onChange={handleInputChange}
                              required
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )}

                      {formData.priceType === "daily" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Precio por día
                          </label>
                          <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">
                              $
                            </span>
                            <input
                              type="number"
                              name="pricePerDay"
                              value={formData.pricePerDay}
                              onChange={handleInputChange}
                              required
                              min="0"
                              step="0.01"
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FFC107] focus:border-[#FFC107]"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      )}

                      <GoogleMapsWrapper onMapsAvailable={handleMapsAvailable}>
                        {renderLocationInput()}
                      </GoogleMapsWrapper>
                    </form>
                  </div>

                  {/* Columna derecha - Imágenes */}
                  <div className="p-8 md:w-1/2 bg-gray-50">
                    <div className="sticky top-8 pt-4 pb-4 bottom-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Imágenes del artículo
                      </h3>
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          {imagePreviewUrls.length === 0 ? (
                            <div className="space-y-3">
                              <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                              >
                                <path
                                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                  strokeWidth={2}
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                              <div className="flex flex-col items-center text-sm text-gray-600">
                                <label
                                  htmlFor="file-upload"
                                  className="relative cursor-pointer bg-white rounded-md font-medium text-[#FFC107] hover:text-[#ffb300] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#FFC107]"
                                >
                                  <span>Subir imágenes</span>
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                  />
                                </label>
                                <p className="mt-1">o arrastrar y soltar</p>
                              </div>
                              <p className="text-xs text-gray-500">
                                PNG, JPG, GIF hasta 10MB
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {renderImagePreview()}
                              <div className="mt-4 text-center">
                                <label
                                  htmlFor="file-upload"
                                  className="text-sm font-medium text-[#FFC107] hover:text-[#ffb300] cursor-pointer"
                                >
                                  Agregar más imágenes
                                  <input
                                    id="file-upload"
                                    name="file-upload"
                                    type="file"
                                    className="sr-only"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageChange}
                                  />
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          La primera imagen será la imagen principal del
                          artículo.
                        </p>
                      </div>
                    </div>
                    {renderAvailabilitySection()}

                    <div className="space-y-6" style={{ marginTop: "2rem" }}>
                      <label
                        htmlFor="condition"
                        className="block text-sm font-bold text-gray-700"
                      >
                        Condición del artículo
                      </label>
                      <select
                        id="condition"
                        name="itemCondition"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.itemCondition}
                        onChange={handleInputChange}
                      >
                        <option value="excelent">Excelente</option>
                        <option value="good">Bueno</option>
                        <option value="fair">Regular</option>
                      </select>
                    </div>

                    <div className="space-y-6" style={{ marginTop: "2rem" }}>
                      <label
                        htmlFor="delivery"
                        className="block text-sm font-bold text-gray-700"
                      >
                        Entrega/Envío del artículo
                      </label>
                      <select
                        id="delivery"
                        name="itemDelivery"
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.itemDelivery}
                        onChange={handleInputChange}
                      >
                        <option value="envioPorCorreo">Envío por correo</option>
                        <option value="entregaEnPersona">
                          Entrega en persona
                        </option>
                        <option value="retiraEnComercio">
                          Retira en comercio/casa
                        </option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Botón de envío en la parte inferior */}
                <div
                  className="px-8 py-6 bg-gray-50 border-t border-gray-100"
                  style={{ textAlign: "right" }}
                >
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="terms"
                          name="terms"
                          type="checkbox"
                          checked={acceptedTerms}
                          onChange={(e) => setAcceptedTerms(e.target.checked)}
                          className="h-4 w-4 text-[#FFC107] focus:ring-[#FFC107] border-gray-300 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label
                          htmlFor="terms"
                          className="font-medium text-gray-700"
                        >
                          Estoy de acuerdo con los{" "}
                          <a
                            href="/terminos-y-condiciones"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#FFC107] hover:text-[#ffb300] underline"
                          >
                            Términos y Condiciones de Uso
                          </a>
                        </label>
                      </div>
                    </div>
                    <button
                      type="submit"
                      form="item-form"
                      disabled={loading || !acceptedTerms}
                      className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                        acceptedTerms
                          ? "bg-[#FFC107] hover:bg-[#ffb300]"
                          : "bg-gray-400 cursor-not-allowed"
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC107] disabled:opacity-50`}
                    >
                      {loading ? "Publicando..." : "Publicar artículo"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sección de la imagen (25% del ancho) */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-xl shadow-md p-6 h-full">
              <h2 className="text-xl font-semibold mb-4">¿Necesitas ayuda?</h2>
              <div className="aspect-w-1 aspect-h-1 mb-4">
                <img
                  src="/images/imagen-soporte.png"
                  alt="Asistencia para publicar"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              <p className="text-gray-600 text-sm">
                Completa todos los campos del formulario para publicar tu
                artículo. Si tienes dudas, consulta nuestra guía de publicación.
              </p>
              <div className="flex items-center justify-between mt-4 gap-4">
                <a
                  href="/guias/publicar-articulo"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC107] bg-[#d2691e] hover:bg-[#d74c20]"
                >
                  Ver Guía de Publicación
                </a>
                <a
                  href="https://wa.me/543412345678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFC107] bg-[#3b82f680] hover:bg-[#004fcf80]"
                >
                  Contactar a Soporte
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CreateItemPage;
