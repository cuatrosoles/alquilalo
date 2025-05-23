// frontend/user/src/pages/HomePage.js
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { searchItems, getCategories, getFeaturedItems } from "../services/api";

function HomePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [location, setLocation] = useState("");
  const [categories, setCategories] = useState([]);
  const [featuredItems, setFeaturedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const [categoriesData, featuredItemsData] = await Promise.all([
          getCategories(),
          getFeaturedItems()
        ]);
        console.log('Categorías cargadas:', categoriesData);
        setCategories(categoriesData);
        setFeaturedItems(featuredItemsData);
      } catch (error) {
        console.error('Error detallado:', error);
        setError(`Error al cargar los datos iniciales: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const filters = {
        search: searchTerm,
        categoryId: selectedCategory,
        location: location
      };
      const results = await searchItems(filters);
      // Aquí podrías manejar los resultados de la búsqueda
      // Por ejemplo, redirigir a una página de resultados o mostrar los resultados en la misma página
      navigate('/search', { state: { results, filters } });
    } catch (error) {
      setError("Error al realizar la búsqueda");
      console.error("Error:", error);
    }
  };

  const formatLocation = (location) => {
    if (!location || !location.address) return 'Sin ubicación';
    const { city, zip, province, country } = location.address;
    const parts = [city, zip, province, country].filter(Boolean);
    return parts.join(', ');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#009688]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section
        className="relative w-full min-h-[500px] flex items-center justify-center text-white py-20"
        style={{
          backgroundImage: "url('/images/1080.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <div className="max-w-7xl w-full mx-auto px-8 flex flex-col items-center bg-black/30 rounded-2xl py-10">
          <h1 className="text-6xl font-extrabold text-center leading-tight mb-6 tracking-tight">
            Alquila lo que <span className="text-[#00C9A7]">Necesitas</span>, <span className="text-[#FFC107]">Cuando lo Necesitas</span>
          </h1>
          <p className="text-2xl text-center max-w-3xl mb-10 font-light mt-40">
            Descubre una forma inteligente de acceder a miles de artículos. Ahorra dinero, reduce el consumo y vive de manera más sostenible.
          </p>
          
          {/* Formulario de búsqueda */}
          <form onSubmit={handleSearch} className="w-full max-w-6xl mb-[-60px]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* ¿Qué necesitas alquilar? */}
              <div className="relative md:col-span-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="¿Qué necesitas alquilar?"
                  className="pl-12 pr-4 py-3 rounded-[10px] text-gray-400 border border-gray-200 text-lg w-full focus:outline-none h-[68px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Categoría */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <rect x="3" y="3" width="7" height="7" rx="2" />
                    <rect x="14" y="3" width="7" height="7" rx="2" />
                    <rect x="14" y="14" width="7" height="7" rx="2" />
                    <rect x="3" y="14" width="7" height="7" rx="2" />
                  </svg>
                </span>
                <select 
                  className="pl-12 pr-4 py-3 text-gray-400 rounded-[10px] border border-gray-200 text-lg w-full focus:outline-none h-[68px]"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Ubicación */}
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 21C12 21 5 13.5 5 8.5C5 5.46243 7.46243 3 10.5 3C13.5376 3 16 5.46243 16 8.5C16 13.5 12 21 12 21Z" />
                    <circle cx="12" cy="8.5" r="2" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Ubicación"
                  className="pl-12 pr-4 py-3 rounded-[10px] text-gray-400 border border-gray-200 text-lg w-full focus:outline-none h-[68px]"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              {/* Botón Buscar */}
              <button 
                type="submit"
                className="bg-[#FFC107] text-white-700 font-semibold px-6 py-3 rounded-[10px] text-base shadow hover:bg-[#ffb300] transition h-[68px]"
              >
                Buscar
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Ventajas */}
      <section className="max-w-7xl w-full mx-auto px-8 py-14">
        <h2 className="text-4xl font-extrabold text-center mb-6">¿Por qué Alquilalo?</h2>
        <p className="text-center text-gray-500 mb-12 text-lg">Descubre las ventajas de unirte a nuestra comunidad de alquiler compartido.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Tarjetas de ventajas */}
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
            <svg className="h-12 mb-3 text-[#009688]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 21C12 21 5 13.5 5 8.5C5 5.46243 7.46243 3 10.5 3C13.5376 3 16 5.46243 16 8.5C16 13.5 12 21 12 21Z" /></svg>
            <span className="font-semibold text-lg mb-2">Artículos Locales</span>
            <span className="text-gray-500 text-base">Encuentra artículos cerca de tu ubicación, ahorrando tiempo y costes de transporte.</span>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
            <svg className="h-12 mb-3 text-[#009688]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M8 12l2 2 4-4" /></svg>
            <span className="font-semibold text-lg mb-2">Precios Competitivos</span>
            <span className="text-gray-500 text-base">Alquila artículos a precios significativamente más bajos que en tiendas tradicionales.</span>
          </div>
          <div className="bg-white rounded-2xl shadow p-8 flex flex-col items-center text-center">
            <svg className="h-12 mb-3 text-[#009688]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="8" width="18" height="13" rx="2" /><path d="M16 3v4M8 3v4" /></svg>
            <span className="font-semibold text-lg mb-2">Horarios Flexibles</span>
            <span className="text-gray-500 text-base">Flexibilidad horaria para recoger y devolver artículos, adaptándose a tu disponibilidad.</span>
          </div>
        </div>
      </section>

      {/* Artículos Destacados */}
      <section className="max-w-7xl w-full mx-auto px-8 py-14">
        <h2 className="text-4xl font-extrabold text-center mb-6 text-[#009688]">Artículos Destacados</h2>
        <p className="text-center text-gray-500 mb-12 text-lg">Explora algunos de los artículos más populares disponibles para alquilar en nuestra plataforma.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-2xl shadow p-6 flex flex-col relative">
              <img 
                src={item.images[0] || "https://picsum.photos/300/200"} 
                alt={item.title} 
                className="rounded-xl h-40 object-cover mb-3" 
              />
              <span className="bg-[#FFC107] text-white text-xs font-bold px-3 py-1 rounded-full absolute top-3 left-3">
                {item.isNew ? "Nuevo" : "Destacado"}
              </span>
              <span className="font-semibold text-lg mt-2">{item.title}</span>
              <span className="bg-[#009688] text-white text-xs font-bold px-3 py-1 rounded-full absolute top-3 right-3">
                {categories.find(cat => cat.id === item.categoryId)?.name || "Sin categoría"}
              </span>
              <span className="bg-[#f4f4f4] text-gray-700 text-base px-3 py-1 rounded">{formatLocation(item.location)}</span>
              <span className="text-[#009688] font-bold mt-2 text-lg">
                ${item.pricePerDay} <span className="text-xs text-gray-500">/día</span>
              </span>
              <Link 
                to={`/item/${item.id}`}
                className="mt-3 border border-[#009688] text-[#009688] rounded-full py-2 font-semibold hover:bg-[#009688] hover:text-white transition text-center"
              >
                Ver Detalles
              </Link>
            </div>
          ))}
        </div>
        
        <div className="flex justify-center mt-10">
          <Link 
            to="/items"
            className="bg-[#FFC107] text-white font-semibold px-8 py-3 rounded-full text-lg shadow hover:bg-[#ffb300] transition"
          >
            Ver Más Artículos
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}

export default HomePage;