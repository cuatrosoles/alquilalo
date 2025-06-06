import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

function SearchResultsPage() {
  const location = useLocation();
  const { results, filters } = location.state || { results: [], filters: {} };

  const formatLocation = (location) => {
    if (!location || !location.address) return 'Sin ubicación';
    const { city, zip, province, country } = location.address;
    const parts = [city, zip, province, country].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <div className="bg-[#F5F7FA] min-h-screen flex flex-col">
      <Header />
      
      <main className="max-w-7xl w-full mx-auto px-8 py-14">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Resultados de búsqueda</h1>
          <p className="text-gray-600">
            {results.length} artículos encontrados
            {filters.search && ` para "${filters.search}"`}
            {filters.location && ` en ${filters.location}`}
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {results.map((item) => (
              <div key={item.id} className="bg-white rounded-2xl shadow p-6 flex flex-col relative">
                <img 
                  src={item.images[0] || "https://picsum.photos/300/200"} 
                  alt={item.title} 
                  className="rounded-xl h-40 object-cover mb-3" 
                />
                <span className="bg-[#FFC107] text-white text-xs font-bold px-3 py-1 rounded-full absolute top-3 left-3">
                  {item.isNew ? "Nuevo" : "Disponible"}
                </span>
                <span className="font-semibold text-lg mt-2">{item.title}</span>
                <span className="text-gray-500 text-base">
                  {item.categoryName || "Sin categoría"} · {formatLocation(item.location)}
                </span>
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
        ) : (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">No se encontraron resultados</h2>
            <p className="text-gray-600 mb-8">
              Intenta con otros términos de búsqueda o ajusta los filtros
            </p>
            <Link 
              to="/"
              className="bg-[#FFC107] text-white font-semibold px-8 py-3 rounded-full text-lg shadow hover:bg-[#ffb300] transition"
            >
              Volver al inicio
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default SearchResultsPage; 