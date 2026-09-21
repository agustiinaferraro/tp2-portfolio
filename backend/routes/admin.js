//rutas de administracion: validan la clave para entrar al panel del admin
import { Router } from 'express';

const router = Router();

//post a /api/admin/verificar
//recibe la clave y responde si es valida o no (sin revelar informacion extra)
router.post('/verificar', (req, res) => {
  const { clave } = req.body ?? {};

  if (process.env.ADMIN_CLAVE && clave === process.env.ADMIN_CLAVE) {
    return res.json({ ok: true });
  }

  res.status(401).json({ ok: false, mensaje: 'Clave incorrecta' });
});

export default router;