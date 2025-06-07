export const handler = async (event, context) => {
  // Headers CORS
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Content-Type": "application/json",
  };

  // Manejar preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: "",
    };
  }

  // Ruta de prueba básica
  if (event.path === "/") {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "🚀 API funcionando en Netlify",
        timestamp: new Date().toISOString(),
        path: event.path,
        method: event.httpMethod,
      }),
    };
  }

  // Ruta para items (hardcoded para testing)
  if (event.path.includes("/items")) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([
        {
          id: 1,
          title: "Item de prueba",
          description: "Descripción de prueba",
        },
        { id: 2, title: "Otro item", description: "Otra descripción" },
      ]),
    };
  }

  // Ruta para categories (hardcoded para testing)
  if (event.path.includes("/categories")) {
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify([
        { id: 1, name: "Categoría 1" },
        { id: 2, name: "Categoría 2" },
      ]),
    };
  }

  // Cualquier otra ruta
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      error: "Ruta no encontrada",
      path: event.path,
      availableRoutes: ["/items", "/categories"],
    }),
  };
};
