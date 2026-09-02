// Punto de entrada del backend (servidor + API)
// Importamos las dependencias
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargamos las variables de entorno del archivo .env
dotenv.config();

// Creamos la aplicación Express
const app = express();

// Middlewares globales
app.use(cors());           // Permite que el frontend (Astro) pueda consultar la API
app.use(express.json());   // Permite recibir JSON en el body de las peticiones

// Ruta de prueba para saber que el servidor está vivo
app.get('/', (req, res) => {
  res.json({ mensaje: 'API del portfolio funcionando' });
});

// Puerto del servidor (por defecto 4000 si no está en .env)
const PORT = process.env.PORT || 4000;

// Arrancamos el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
