import serverless from "serverless-http";
import app from "../../api/src/app.js";

// Usar directamente tu aplicación Express existente
export const handler = serverless(app);
