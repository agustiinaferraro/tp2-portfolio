//middleware de autenticacion de usuarios
//valida que el token de sesion llegue en el header authorization (formato bearer)
//se usa en las rutas que necesitan estar logueado (ej. publicar comentarios)
import jwt from 'jsonwebtoken';

const clave = () => process.env.JWT_SECRET ?? 'portfolio-firma-token';

export default function esAutenticado(req, res, next) {
  const encabezado = req.headers.authorization ?? '';
  const token = encabezado.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return res.status(401).json({ mensaje: 'Necesitás iniciar sesión' });
  }

  try {
    const datos = jwt.verify(token, clave());
    req.usuario = datos;
    next();
  } catch {
    return res.status(401).json({ mensaje: 'La sesión expiró. Entrá de nuevo.' });
  }
}