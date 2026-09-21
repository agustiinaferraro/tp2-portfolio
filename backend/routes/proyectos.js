//rutas de la api para los proyectos
//el get es publico (cualquiera ve los proyectos), las modificaciones piden clave de administrador
import { Router } from 'express';
import Proyecto from '../models/Proyecto.js';
import esAdmin from '../middlewares/esAdmin.js';

const router = Router();

//get a /api/proyectos
//devuelve la lista de todos los proyectos cargados en la base
//soporta ?destacados=true (solo destacados) y ?ligero=true (sin imagenes, para el buscador)
router.get('/', async (req, res) => {
  try {
    const { destacados, ligero } = req.query;

    //filtro: si se pide destacado, se traen solo los destacados
    const filtro = destacados === 'true' ? { destacado: true } : {};

    //proyeccion: el modo ligero no manda las imagenes (pesan bastante en base64)
    const proyeccion = ligero === 'true' ? { titulo: 1, resumen: 1, tags: 1 } : null;

    const proyectos = await Proyecto.find(filtro, proyeccion).lean();
    res.json(proyectos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener los proyectos', error: error.message });
  }
});

//post a /api/proyectos (solo admin)
//crea un proyecto nuevo con titulo (obligatorio), descripcion e imagen opcionales
router.post('/', esAdmin, async (req, res) => {
  try {
    const { titulo, resumen, imagen } = req.body ?? {};

    //validacion: el titulo es obligatorio
    if (!titulo || !titulo.trim()) {
      return res.status(400).json({ mensaje: 'El titulo es obligatorio' });
    }

    const nuevoProyecto = await Proyecto.create({
      titulo: titulo.trim(),
      resumen: resumen ?? '',
      imagen: imagen ?? '',
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
//actualiza los campos que lleguen (titulo, descripcion o imagen)
router.put('/:id', esAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, resumen, imagen } = req.body ?? {};

    //se arma un objeto solo con los campos que vinieron en la peticion
    const cambios = {};
    if (titulo !== undefined) cambios.titulo = titulo;
    if (resumen !== undefined) cambios.resumen = resumen;
    if (imagen !== undefined) cambios.imagen = imagen;

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