// Rutas públicas de la API para los proyectos
// El frontend consulta estas rutas para mostrar los proyectos
import { Router } from 'express';
import Proyecto from '../models/Proyecto.js';

const router = Router();

// GET a /api/proyectos
// Devuelve la lista de todos los proyectos cargados en la base
// Soporta un parámetro opcional ?destacados=true para traer solo los destacados
router.get('/', async (req, res) => {
  try {
    const { destacados } = req.query;

    // Filtro: si se pide destacado, se traen solo los destacados
    const filtro = destacados === 'true' ? { destacado: true } : {};

    const proyectos = await Proyecto.find(filtro);
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los proyectos', error: error.message });
  }
});

export default router;