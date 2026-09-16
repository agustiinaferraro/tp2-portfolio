// Punto de entrada del backend (servidor + API)
// Funciona en dos ambientes:
//   - Local:  node server.js   (arranca con app.listen)
//   - Vercel: la app se exporta como función serverless

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Importa la conexión a MongoDB y las rutas
import { conectarDB } from './config/db.js';
import proyectosRouter from './routes/proyectos.js';
import serviciosRouter from './routes/servicios.js';

// Se cargan las variables de entorno del archivo .env (solo importa en local)
dotenv.config();

// Se crea la aplicación Express
const app = express();

// Middlewares globales
app.use(cors());           // Permite que el frontend (Astro) pueda consultar la API
app.use(express.json());   // Permite recibir JSON en el body de las peticiones

// Middleware: se conecta a MongoDB antes de cada petición
// Reutiliza la conexión si ya está abierta (la función de conexión lo maneja)
app.use(async (req, res, next) => {
  try {
    await conectarDB();
    next();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al conectar a MongoDB', error: error.message });
  }
});

// Rutas de la API (públicas por ahora)
app.use('/api/proyectos', proyectosRouter);
app.use('/api/servicios', serviciosRouter);

// Ruta de prueba para saber que el servidor está vivo
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del portfolio funcionando' });
});

// Puerto del servidor (por defecto 4000 si no está en .env)
const PORT = process.env.PORT || 4000;

// Solo se arranca el servidor en local con app.listen.
// En Vercel no se usa listen: la app se exporta y Vercel la ejecuta.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
}

// Se exporta la app para que Vercel pueda ejecutarla como función serverless
export default app;