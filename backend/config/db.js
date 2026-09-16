// Archivo de configuración de la conexión a MongoDB
// Importa mongoose (la librería que conecta y habla con MongoDB)
import mongoose from 'mongoose';

// Se guarda la conexión para reutilizarla y no abrir una en cada petición
let conexion = null;

// Esta función conecta el backend con MongoDB Atlas
// Se usa la variable MONGODB_URI que está en el archivo .env
export async function conectarDB() {
  // Si ya hay una conexión abierta, se reutiliza
  if (conexion) return conexion;

  conexion = mongoose.connect(process.env.MONGODB_URI);
  await conexion;
  console.log('✅ Conectado a MongoDB Atlas');
  return conexion;
}