// src/server.js
import app from "./app.js";

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Servidor API de Alquilalo corriendo en el puerto ${PORT}`);
});
