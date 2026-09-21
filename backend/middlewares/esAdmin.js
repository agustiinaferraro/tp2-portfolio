//middleware compartido de administracion
//valida que la clave de admin llegue en el header x-admin-clave y sea correcta
//se usa en las rutas que solo pueden tocar las personas autorizadas
export default function esAdmin(req, res, next) {
  const clave = req.header('x-admin-clave');

  if (!process.env.ADMIN_CLAVE || clave !== process.env.ADMIN_CLAVE) {
    return res.status(401).json({ mensaje: 'No autorizado: clave de administrador incorrecta' });
  }

  next();
}