//rutas de la api de mensajes
//el post es publico (el formulario de contacto lo usa), la lectura y el borrado piden clave de admin
import { Router } from 'express';
import Mensaje from '../models/Mensaje.js';
import esAdmin from '../middlewares/esAdmin.js';

const router = Router();

//get a /api/mensajes (solo admin)
//devuelve todos los mensajes recibidos, los mas nuevos primero
router.get('/', esAdmin, async (req, res) => {
  try {
    const mensajes = await Mensaje.find().sort({ createdAt: -1 }).lean();
    res.json(mensajes);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los mensajes', error: error.message });
  }
});

//get a /api/mensajes/conversaciones (solo admin)
//agrupa los mensajes por persona (mismo email) para verlos como chats
//cada conversacion trae nombre, cantidad, fecha del ultimo y todos sus mensajes
router.get('/conversaciones', esAdmin, async (req, res) => {
  try {
    const conversaciones = await Mensaje.aggregate([
      //los nuevos primero para que el primer mensaje de cada grupo sea el ultimo
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: { $toLower: '$email' },
          nombre: { $first: '$nombre' },
          email: { $first: '$email' },
          cantidad: { $sum: 1 },
          ultimaFecha: { $first: '$createdAt' },
          mensajes: { $push: '$$ROOT' },
        },
      },
      //las conversaciones con actividad mas reciente quedan arriba
      { $sort: { ultimaFecha: -1 } },
    ]);
    res.json(conversaciones);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener las conversaciones', error: error.message });
  }
});

//post a /api/mensajes
//recibe los datos del formulario de contacto y los guarda en la base
router.post('/', async (req, res) => {
  try {
    const { nombre, email, mensaje } = req.body ?? {};

    //validacion: si falta algun campo, respondemos 400 con un mensaje claro
    if (!nombre || !email || !mensaje) {
      return res.status(400).json({
        mensaje: 'Faltan datos: nombre, email y mensaje son obligatorios',
      });
    }

    //se guarda el mensaje y se responde 201 (recurso creado)
    const nuevoMensaje = await Mensaje.create({ nombre, email, mensaje });
    res.status(201).json({ mensaje: 'Mensaje recibido', datos: nuevoMensaje });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar el mensaje', error: error.message });
  }
});

//delete a /api/mensajes/:id (solo admin)
//borra un mensaje de la base
router.delete('/:id', esAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const borrado = await Mensaje.findByIdAndDelete(id);

    if (!borrado) {
      return res.status(404).json({ mensaje: 'Mensaje no encontrado' });
    }

    res.json({ mensaje: 'Mensaje borrado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al borrar el mensaje', error: error.message });
  }
});

export default router;