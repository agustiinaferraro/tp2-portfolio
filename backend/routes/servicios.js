//rutas publicas de la api para los servicios
//el frontend consulta estas rutas para mostrar los servicios ofrecidos
import { Router } from 'express';
import Servicio from '../models/Servicio.js';

const router = Router();

//get a /api/servicios
//devuelve la lista de todos los servicios cargados en la base
router.get('/', async (req, res) => {
  try {
    const servicios = await Servicio.find();
    res.json(servicios);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los servicios', error: error.message });
  }
});

//get a /api/servicios/:slug
//devuelve un solo servicio segun su slug (ej. /api/servicios/diseno-ux-ui)
router.get('/:slug', async (req, res) => {
  try {
    const servicio = await Servicio.findOne({ slug: req.params.slug });
    if (!servicio) {
      return res.status(404).json({ mensaje: 'Servicio no encontrado' });
    }
    res.json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el servicio', error: error.message });
  }
});

export default router;