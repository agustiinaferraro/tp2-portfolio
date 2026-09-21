//rutas de administracion: validan la clave para entrar al panel del admin
import { Router } from 'express';

const router = Router();

//post a /api/admin/verificar
//recibe usuario y clave y responde si son validos o no (sin revelar informacion extra)
router.post('/verificar', (req, res) => {
  const { usuario, clave } = req.body ?? {};

  if (
    process.env.ADMIN_USUARIO &&
    process.env.ADMIN_CLAVE &&
    usuario === process.env.ADMIN_USUARIO &&
    clave === process.env.ADMIN_CLAVE
  ) {
    return res.json({ ok: true });
  }

  res.status(401).json({ ok: false, mensaje: 'Usuario o contraseña incorrecta' });
});

export default router;