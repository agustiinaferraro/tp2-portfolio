// Rutas públicas de la API para los servicios
// El frontend consulta estas rutas para mostrar los servicios ofrecidos
import { Router } from 'express';
import Servicio from '../models/Servicio.js';

const router = Router();

// GET a /api/servicios
// Devuelve la lista de todos los servicios cargados en la base
router.get('/', async (req, res) => {
  try {
    const servicios = await Servicio.find();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los servicios', error: error.message });
  }
});

export default router;