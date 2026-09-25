//configuracion de firebase-admin: valida los tokens de sesion de los usuarios
//las cuentas se crean en firebase authentication y el backend solo verifica el token
//las credenciales del servicio (service account) viajan en variables de entorno de vercel:
//firebase_project_id, firebase_client_email y firebase_private_key
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

//devuelve las credenciales del servicio, o null si no estan configuradas aun
function credenciales() {
  const proyecto = process.env.FIREBASE_PROJECT_ID;
  const email = process.env.FIREBASE_CLIENT_EMAIL;
  const clave = process.env.FIREBASE_PRIVATE_KEY;
  if (proyecto && email && clave) {
    return {
      projectId: proyecto,
      clientEmail: email,
      //la clave llega con \n escapados (por como se guarda en vercel); se restauran
      privateKey: clave.replace(/\\n/g, '\n'),
    };
  }
  return null;
}

let app = null;

//inicializa la app de firebase admin una sola vez (o devuelve la ya creada)
function obtenerApp() {
  if (!app) {
    const cred = credenciales();
    if (!cred) {
      throw new Error('sin-configuracion-firebase');
    }
    app = initializeApp({
      credential: cert(cred),
    });
  }
  return app;
}

//valida el token de sesion que manda el frontend y devuelve los datos del usuario
export async function verificarTokenFirebase(token) {
  const datos = await getAuth(obtenerApp()).verifyIdToken(token);
  return {
    id: datos.uid,
    nombre: datos.name ?? datos.email ?? 'Visitante',
    email: datos.email ?? '',
  };
}