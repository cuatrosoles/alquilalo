import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../utils/api";

const RelatedItems = ({ currentItemId, category, ownerId, limit = 4 }) => {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedItems = async () => {
      try {
        setLoading(true);
        // Obtener items relacionados por categoría y propietario
        const response = await api.get("/items/related", {
          params: {
            currentItemId,
            category,
            ownerId,
            limit,
          },
        });
        setRelatedItems(response.data);
      } catch (err) {
        console.error("Error al cargar items relacionados:", err);
        setError("No se pudieron cargar los items relacionados");
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedItems();
  }, [currentItemId, category, ownerId, limit]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[...Array(limit)].map((_, i) => (
          <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  if (relatedItems.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h4 className="font-semibold text-gray-900">Artículos Relacionados</h4>
      <div className="grid grid-cols-2 gap-4">
        {relatedItems.map((item) => (
          <Link
            key={item.id}
            to={`/items/${item.id}`}
            className="group block bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200"
          >
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={item.images[0]}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
            </div>
            <div className="p-3">
              <h5 className="font-medium text-gray-900 group-hover:text-[#FFC107] transition-colors duration-200">
                {item.title}
              </h5>
              <p className="text-sm text-gray-500 mt-1">
                $
                {item.priceType === "hourly"
                  ? item.pricePerHour
                  : item.pricePerDay}
                <span className="text-xs">
                  /{item.priceType === "hourly" ? "hora" : "día"}
                </span>
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default RelatedItems;
