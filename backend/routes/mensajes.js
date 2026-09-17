// Rutas de la API de mensajes
import { Router } from 'express';
import Mensaje from '../models/Mensaje.js';

const router = Router();

// POST a /api/mensajes
// Recibe los datos del formulario de contacto y los guarda en la base
router.post('/', async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body ?? {};

    // Validación: si falta algún campo, respondemos 400 con un mensaje claro
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        mensaje: 'Faltan datos: nombre, email y mensaje son obligatorios',
      });
    }

    // Se guarda el mensaje y se responde 201 (recurso creado)
    const nuevoMensaje = await Mensaje.create({ nombre, email, mensaje });
    res.status(201).json({ mensaje: 'Mensaje recibido', datos: nuevoMensaje });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar el mensaje', error: error.message });
  }
});

export default router;