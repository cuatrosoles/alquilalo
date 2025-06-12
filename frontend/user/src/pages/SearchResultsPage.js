import React, { useState, useEffect, useMemo } from "react";
import { useLocation, Link } from "react-router-dom";
import Pagination from "../components/Pagination";
import { getCategories, calculateDistance } from "../services/api"; // --- Se importa la función de API ---

// Componente para organizar el sidebar
const FilterSection = ({ title, children }) => (
  <div className="py-6 border-b border-gray-200">
    <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-4">{children}</div>
  </div>
);

function SearchResultsPage() {
  const location = useLocation();
  const { results: initialResults = [], filters: searchFilters = {} } =
    location.state || {};

  // --- Estados para la página ---
  const [displayedResults, setDisplayedResults] = useState(
    Array.isArray(initialResults) ? initialResults : []
  );
  const [categories, setCategories] = useState([]); // <-- NUEVO: Estado para las categorías
  const [loading, setLoading] = useState(false); // No se necesita loading inicial, los datos ya vienen
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  const [filters, setFilters] = useState({
    maxPrice: 100000,
    itemCondition: "all",
    category: "all",
    sortBy: "relevance",
    maxDistance: 50, // Distancia máxima en km
  });

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  // NUEVO: Efecto para cargar las categorías al montar el componente
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error("No se pudieron cargar las categorías para el filtro.");
        setError("Error al cargar filtros de categoría.");
      }
    };
    fetchCategories();
  }, []);

  // Obtener ubicación del usuario al montar el componente
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error al obtener la ubicación:", error);
        }
      );
    }
  }, []);

  // Efecto para aplicar filtros y ordenamiento
  useEffect(() => {
    let resultsToFilter = Array.isArray(initialResults)
      ? [...initialResults]
      : [];

    resultsToFilter = resultsToFilter.filter((item) => {
      if (item.pricePerDay > filters.maxPrice) return false;
      const itemCondition = item.itemCondition ? item.itemCondition : "all";
      if (
        filters.itemCondition !== "all" &&
        itemCondition !== filters.itemCondition
      )
        return false;
      if (filters.category !== "all" && item.categoryId !== filters.category)
        return false;

      // Filtrar por distancia si tenemos la ubicación del usuario
      if (userLocation && item.location?.latitude && item.location?.longitude) {
        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.location.latitude,
          item.location.longitude
        );
        if (distance > filters.maxDistance) return false;
      }

      return true;
    });

    switch (filters.sortBy) {
      case "price_asc":
        resultsToFilter.sort((a, b) => a.pricePerDay - b.pricePerDay);
        break;
      case "price_desc":
        resultsToFilter.sort((a, b) => b.pricePerDay - a.pricePerDay);
        break;
      default:
        break;
    }

    setDisplayedResults(resultsToFilter);
    setCurrentPage(1);
  }, [filters, initialResults, userLocation]);

  const currentItemsOnPage = useMemo(() => {
    if (!Array.isArray(displayedResults)) return [];
    const firstItemIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return displayedResults.slice(
      firstItemIndex,
      firstItemIndex + ITEMS_PER_PAGE
    );
  }, [currentPage, displayedResults]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({
      maxPrice: 100000,
      itemCondition: "all",
      category: "all",
      sortBy: "relevance",
      maxDistance: 50,
    });
  };

  const formatLocation = (location) => {
    if (!location || !location.address) return "Sin ubicación";
    const { city, province } = location.address;
    return [city, province].filter(Boolean).join(", ");
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.id === categoryId);
    return category ? category.name : "Sin Categoría";
  };

  return (
    <div className="bg-white">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Resultados de Búsqueda
          </h1>
          <p className="text-gray-600 mt-1">
            {displayedResults.length} artículos encontrados
            {searchFilters?.search && ` para "${searchFilters.search}"`}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-8 gap-y-10">
          {/* --- Sidebar de Filtros --- */}
          <aside className="hidden lg:block bg-gray-50 p-6 rounded-lg self-start sticky top-24">
            <h2 className="text-xl font-bold mb-6">Filtros</h2>
            <FilterSection title="Categoría">
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500 py-[0.65rem] px-[0.25rem]"
              >
                <option value="all">Todas las categorías</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </FilterSection>

            <FilterSection title="Precio máximo del alquiler">
              <input
                type="range"
                name="maxPrice"
                min="0"
                max="100000"
                step="1000"
                value={filters.maxPrice}
                onChange={handleFilterChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-center font-medium text-gray-700">
                ${Number(filters.maxPrice).toLocaleString()}
              </div>
            </FilterSection>

            <FilterSection title="Condición">
              <div className="flex items-center">
                <input
                  id="cond-all"
                  name="itemCondition"
                  type="radio"
                  value="all"
                  checked={filters.itemCondition === "all"}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <label
                  htmlFor="cond-all"
                  className="ml-3 text-sm text-gray-600"
                >
                  Todos
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="cond-excelent"
                  name="itemCondition"
                  type="radio"
                  value="excelent"
                  checked={filters.itemCondition === "excelent"}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <label
                  htmlFor="cond-excelent"
                  className="ml-3 text-sm text-gray-600"
                >
                  Excelente
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="cond-good"
                  name="itemCondition"
                  type="radio"
                  value="good"
                  checked={filters.itemCondition === "good"}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <label
                  htmlFor="cond-good"
                  className="ml-3 text-sm text-gray-600"
                >
                  Bueno
                </label>
              </div>
              <div className="flex items-center">
                <input
                  id="cond-fair"
                  name="itemCondition"
                  type="radio"
                  value="fair"
                  checked={filters.itemCondition === "fair"}
                  onChange={handleFilterChange}
                  className="h-4 w-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                />
                <label
                  htmlFor="cond-fair"
                  className="ml-3 text-sm text-gray-600"
                >
                  Regular
                </label>
              </div>
            </FilterSection>

            <FilterSection title="Distancia máxima">
              <div className="space-y-2">
                <input
                  type="range"
                  name="maxDistance"
                  min="1"
                  max="100"
                  step="1"
                  value={filters.maxDistance}
                  onChange={handleFilterChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="text-center font-medium text-gray-700">
                  {filters.maxDistance} km
                </div>
                {!userLocation && (
                  <p className="text-xs text-gray-500 text-center">
                    Activa la ubicación para filtrar por distancia
                  </p>
                )}
              </div>
            </FilterSection>

            <button
              onClick={resetFilters}
              className="w-full mt-6 bg-gray-200 text-gray-800 font-semibold py-2 rounded-md hover:bg-gray-300 transition"
            >
              Limpiar Filtros
            </button>
          </aside>

          {/* --- Resultados --- */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <p className="text-gray-500">Ordenar por:</p>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
              >
                <option value="relevance">Relevancia</option>
                <option value="price_asc">Precio: más bajo a más alto</option>
                <option value="price_desc">Precio: más alto a más bajo</option>
              </select>
            </div>
            {initialResults.length > 0 ? (
              displayedResults.length > 0 ? (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                    {currentItemsOnPage.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-lg shadow-md overflow-hidden group"
                      >
                        <div className="relative">
                          <img
                            src={
                              item.images[0] || "https://placehold.co/300x200"
                            }
                            alt={item.title}
                            className="h-48 w-full object-cover"
                          />
                          <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {item.itemCondition === "excelent" && "Excelente"}
                            {item.itemCondition === "good" && "Bueno"}
                            {item.itemCondition === "fair" && "Regular"}
                          </div>
                        </div>
                        <div className="p-4">
                          <h3 className="font-semibold text-lg text-gray-800 truncate group-hover:text-orange-600 transition">
                            {item.title}
                          </h3>
                          <p className="text-gray-500 text-sm mt-1">
                            {getCategoryName(item.categoryId)}
                          </p>
                          <p className="text-gray-500 text-sm mt-1">
                            {formatLocation(item.location)}
                          </p>
                          <div className="mt-3 flex justify-between items-center">
                            <p className="text-lg font-bold text-gray-900">
                              $
                              {item.priceType === "daily"
                                ? item.pricePerDay
                                : item.pricePerHour}
                              <span className="text-sm font-normal text-gray-500">
                                {item.priceType === "daily" ? "/día" : "/hora"}
                              </span>
                            </p>
                            <Link
                              to={`/item/${item.id}`}
                              className="text-orange-500 font-semibold text-sm hover:text-orange-600"
                            >
                              Ver Detalles
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Pagination
                    totalItems={displayedResults.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                  />
                </div>
              ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                  <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                    Ningún resultado coincide con los filtros
                  </h2>
                  <p className="text-gray-600 mb-6">
                    Prueba a cambiar o limpiar los filtros.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="bg-orange-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-orange-600 transition"
                  >
                    Limpiar Filtros
                  </button>
                </div>
              )
            ) : (
              <div className="text-center py-20 bg-gray-50 rounded-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  No se encontraron resultados
                </h2>
                <p className="text-gray-600 mb-6">
                  Intenta con otros términos de búsqueda.
                </p>
                <Link
                  to="/"
                  className="bg-orange-500 text-white font-semibold px-6 py-2 rounded-md hover:bg-orange-600 transition"
                >
                  Volver al inicio
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default SearchResultsPage;
