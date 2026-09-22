# Portfolio — Trabajo Final

Portfolio personal desarrollado como trabajo final de la carrera **Tecnología Multimedia** (Universidad Maimónides).

> **Consigna:** el enunciado del Examen Final de Programación Multimedial IV está en [`docs/consigna.md`](docs/consigna.md).

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
yarn install
yarn dev      # Levanta el sitio en http://localhost:4321
```

## Backend (`backend/`)

API REST + conexión a MongoDB que gestiona los datos del portfolio (proyectos, mensajes, servicios, etc.).

```sh
cd backend
yarn install
yarn dev      # Levanta la API en http://localhost:4000
```

> Los modelos de datos y endpoints se definen según las necesidades del portfolio. Ver `backend/README.md`.

## Deploy

Ambas partes están deployadas en Vercel, cada una como un proyecto independiente conectado a este repositorio:

- **Frontend:** https://agustinaportfolio.vercel.app
- **Backend (API):** https://agustinaportfolio-api.vercel.app

Cada proyecto tiene configurado su **Root Directory** (`frontend` y `backend`) y sus variables de entorno en Vercel. Cada `push` a `main` dispara un deploy automático.
