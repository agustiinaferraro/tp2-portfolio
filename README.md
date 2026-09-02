# Portfolio — Trabajo Final

Portfolio personal desarrollado como trabajo final de la carrera **Tecnología Multimedia** (Universidad Maimónides).

El proyecto está organizado en dos partes independientes:

```
/
├── frontend/   # Sitio web: Astro + React + Tailwind CSS v4
└── backend/    # Servidor y API: Node.js + Express + Mongoose (MongoDB Atlas)
```

## Frontend (`frontend/`)

Web estática e interactiva del portfolio. Construida con Astro, componentes de React e integración de estilos con Tailwind CSS v4.

```sh
cd frontend
npm install
npm run dev      # Levanta el sitio en http://localhost:4321
```

## Backend (`backend/`)

API REST + conexión a MongoDB que gestiona los datos del portfolio (proyectos, mensajes, servicios, etc.).

```sh
cd backend
npm install
npm run dev      # Levanta la API en http://localhost:4000
```

> Los modelos de datos y endpoints se definen según las necesidades del portfolio. Ver `backend/README.md`.
