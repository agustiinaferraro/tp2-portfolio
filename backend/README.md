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
   npm install
   ```

2. Copiá la plantilla de variables de entorno y completá tus datos de MongoDB Atlas:

   ```sh
   cp .env.example .env
   ```

3. Levantá el servidor en modo desarrollo:

   ```sh
   npm run dev
   ```

El servidor arranca en `http://localhost:4000`.

> Los modelos y rutas de datos se definen según las necesidades del portfolio (ver README de la raíz).
