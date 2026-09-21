# Backend del Portfolio

API REST del portfolio construida con **Node.js + Express + Mongoose**, conectada a **MongoDB Atlas**.

## Estructura

```
backend/
├── server.js          # Punto de entrada: config y arranque del servidor
├── package.json
├── .env.example       # Plantilla de variables de entorno (copiá a .env)
├── config/            # Conexión a MongoDB (a completar)
├── models/            # Modelos de datos (proyectos, mensajes, servicios...)
└── routes/            # Rutas/endpoints de la API
```

## Puesta en marcha

1. Instalá las dependencias:

   ```sh
   yarn install
   ```

2. Copiá la plantilla de variables de entorno y completá tus datos de MongoDB Atlas:

   ```sh
   cp .env.example .env
   ```

3. Levantá el servidor en modo desarrollo:

   ```sh
   yarn dev
   ```

El servidor arranca en `http://localhost:4000`.

> Los modelos y rutas de datos se definen según las necesidades del portfolio (ver README de la raíz).

## Deploy

Deployado en Vercel como función serverless: https://agustinaportfolio-api.vercel.app

- La variable `MONGODB_URI` se configura en Vercel (no se sube al repositorio).
- Las variables `ADMIN_USUARIO` y `ADMIN_CLAVE` (credenciales del panel `/admin`) también se configuran en Vercel.
- `vercel.json` define el build con `@vercel/node` y enruta todas las peticiones a `server.js`.
