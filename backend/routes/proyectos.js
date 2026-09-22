//rutas de la api para los proyectos
//el get es publico (cualquiera ve los proyectos), las modificaciones piden clave de administrador
import { Router } from 'express';
import Proyecto from '../models/Proyecto.js';
import esAdmin from '../middlewares/esAdmin.js';

const router = Router();

//get a /api/proyectos
//devuelve la lista de todos los proyectos cargados en la base
//soportan ?destacados=true (solo destacados), ?ligero=true (sin imagenes) y ?servicio=slug (solo esa categoria)
router.get('/', async (req, res) => {
  try {
    const { destacados, ligero, servicio } = req.query;

    //filtro: se arman las condiciones que lleguen (destacados y/o servicio)
    const filtro = {};
    if (destacados === 'true') filtro.destacado = true;
    if (servicio) filtro.servicio = servicio;

    //proyeccion: el modo ligero no manda las imagenes (pesan bastante en base64)
    const proyeccion = ligero === 'true' ? { titulo: 1, resumen: 1, tags: 1 } : null;

    const proyectos = await Proyecto.find(filtro, proyeccion).lean();
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los proyectos', error: error.message });
  }
});

//get a /api/proyectos/:id
//devuelve un solo proyecto segun su id (para la pagina de detalle)
router.get('/:id', async (req, res) => {
  try {
    const proyecto = await Proyecto.findById(req.params.id).lean();
    if (!proyecto) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }
    res.json(proyecto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener el proyecto', error: error.message });
  }
});

//post a /api/proyectos (solo admin)
//crea un proyecto nuevo con titulo (obligatorio), y resumen, imagen y servicio opcionales
router.post('/', esAdmin, async (req, res) => {
  try {
    const { titulo, resumen, imagen, servicio } = req.body ?? {};

    //validacion: el titulo es obligatorio
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ mensaje: 'El titulo es obligatorio' });
    }

    const nuevoProyecto = await Proyecto.create({
      titulo: titulo.trim(),
      resumen: resumen ?? '',
      imagen: imagen ?? '',
      servicio: servicio ?? '',
      tags: [],
      link: '',
      destacado: false,
    });

    res.status(201).json({ mensaje: 'Proyecto creado', datos: nuevoProyecto });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear el proyecto', error: error.message });
  }
});

//put a /api/proyectos/:id (solo admin)
//actualiza los campos que lleguen (titulo, resumen, imagen o servicio)
router.put('/:id', esAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, resumen, imagen, servicio } = req.body ?? {};

    //se arma un objeto solo con los campos que vinieron en la peticion
    const cambios = {};
    if (titulo !== undefined) cambios.titulo = titulo;
    if (resumen !== undefined) cambios.resumen = resumen;
    if (imagen !== undefined) cambios.imagen = imagen;
    if (servicio !== undefined) cambios.servicio = servicio;

    const actualizado = await Proyecto.findByIdAndUpdate(id, cambios, {
      new: true,
      runValidators: true,
    });

    if (!actualizado) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    res.json({ mensaje: 'Proyecto actualizado', datos: actualizado });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el proyecto', error: error.message });
  }
});

//delete a /api/proyectos/:id (solo admin)
//borra el proyecto de la base
router.delete('/:id', esAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const borrado = await Proyecto.findByIdAndDelete(id);

    if (!borrado) {
      return res.status(404).json({ mensaje: 'Proyecto no encontrado' });
    }

    res.json({ mensaje: 'Proyecto borrado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al borrar el proyecto', error: error.message });
  }
});

export default router;