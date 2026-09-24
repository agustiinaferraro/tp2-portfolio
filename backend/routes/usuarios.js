//rutas de la api de usuarios
//los visitantes se registran y entran con email y contraseña
//al registrarse o entrar se devuelve un token de sesion (jsonwebtoken) para autenticar despues
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Router } from 'express';
import Usuario from '../models/Usuario.js';

const router = Router();

const clave = () => process.env.JWT_SECRET ?? 'portfolio-firma-token';

//arma el token de sesion para un usuario
function firmarSesion(usuario) {
  return jwt.sign({ id: usuario._id, nombre: usuario.nombre, email: usuario.email }, clave(), {
    expiresIn: '30d',
  });
}

//deja el usuario sin la clave (nunca se manda el hash al frontend)
function datosPublicos(usuario) {
  return { id: usuario._id, nombre: usuario.nombre, email: usuario.email };
}

//post a /api/usuarios/registro
//crea la cuenta: nombre, email y contraseña. la contraseña se guarda hasheada
router.post('/registro', async (req, res) => {
  try {
    const { nombre, email, clave } = req.body ?? {};

    if (!nombre || !email || !clave) {
      return res.status(400).json({ mensaje: 'Faltan datos: nombre, email y contraseña son obligatorios' });
    }
    if (String(clave).length < 6) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 6 caracteres' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();

    //si el email ya esta en uso no se deja duplicar
    const yaExiste = await Usuario.findOne({ email: emailNormalizado });
    if (yaExiste) {
      return res.status(409).json({ mensaje: 'Ya existe una cuenta con ese email' });
    }

    const hash = await bcrypt.hash(String(clave), 10);
    const nuevoUsuario = await Usuario.create({ nombre: nombre.trim(), email: emailNormalizado, clave: hash });

    res.status(201).json({ mensaje: 'Cuenta creada', usuario: datosPublicos(nuevoUsuario), token: firmarSesion(nuevoUsuario) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear la cuenta', error: error.message });
  }
});

//post a /api/usuarios/login
//entra con email y contraseña y devuelve el token de sesion
router.post('/login', async (req, res) => {
  try {
    const { email, clave } = req.body ?? {};

    if (!email || !clave) {
      return res.status(400).json({ mensaje: 'Email y contraseña son obligatorios' });
    }

    const emailNormalizado = String(email).trim().toLowerCase();
    const usuario = await Usuario.findOne({ email: emailNormalizado });

    //el mismo mensaje para email o clave incorrectos: no se filtra que cuenta existe
    if (!usuario || !(await bcrypt.compare(String(clave), usuario.clave))) {
      return res.status(401).json({ mensaje: 'Email o contraseña incorrectos' });
    }

    res.json({ mensaje: 'Sesión iniciada', usuario: datosPublicos(usuario), token: firmarSesion(usuario) });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
});

export default router;