# Portfolio — Trabajo Final

Portfolio web personal e interactivo desarrollado como **Examen Final de Programación Multimedial IV** (Tecnología Multimedia — Universidad Maimónides).

> **Enunciado del examen:** [`docs/consigna.md`](docs/consigna.md) · **Evidencia de proceso:** [`docs/proceso.md`](docs/proceso.md) · **Guía de defensa:** [`docs/defensa.md`](docs/defensa.md)

## Propuesta y público

Un portfolio personal que presenta a Agustina Ferraro como diseñadora multimedia y desarrolladora full stack. Combina una página institucional (inicio, sobre mí, servicios, contacto) con una **sección de proyectos dinámica y administrable**: los proyectos viven en una base de datos, se cargan con un panel propio con clave, se filtran por categoría, y cada uno abre un **detalle tipo Behance** con galería de imágenes.

La propuesta busca comunicar identidad (paleta oscura con violeta en los botones y verde en los detalles de texto, tipografía limpia, microanimaciones) y a la vez demostrar un recorrido técnico completo: sitio estático con Astro + componentes React interactivos, una API REST propia y una base remota. El público es tanto alguien que visita el portfolio como quien evalúa el trabajo: se puede recorrer la web como visitante o entrar al panel `/admin` para gestionar el contenido.

## Sitios publicados

- **Frontend (web):** https://agustinaportfolio.vercel.app
- **Backend (API):** https://agustinaportfolio-api.vercel.app
- **Repositorio:** https://github.com/agustiinaferraro/tp2-portfolio

## Estructura del proyecto

```
tp2-portfolio/
├── frontend/     # Sitio web: Astro + React + Tailwind CSS v4
├── backend/      # API REST: Node.js + Express + Mongoose (MongoDB Atlas)
└── docs/         # Consigna, evidencia de proceso y guía de defensa
```

## Instalación, ejecución y build

### Frontend (`frontend/`)

```sh
cd frontend
yarn install
yarn dev        # levanta el sitio en http://localhost:4321
yarn astro build   # genera la versión estática en frontend/dist
```

> La web es estática: las secciones dinámicas (proyectos, buscador, servicios) consumen la API por red en el navegador.

### Backend (`backend/`)

```sh
cd backend
yarn install
cp .env.example .env   # completá MONGODB_URI, ADMIN_USUARIO y ADMIN_CLAVE
yarn dev               # levanta la API en http://localhost:4000
```

Para poblar la base con los proyectos de Behance (opcional):

```sh
cd backend
node scripts/importar-behance.js
```

### Requisitos

- Node.js 18+ (el backend usa `fetch` nativo en el script de importación).
- Una base de datos MongoDB Atlas. URLs de deploy en Vercel.

## Tecnologías y decisiones principales

- **AstroJS** (única tecnología obligatoria de la consigna): genera el sitio estático y aísla los islands de React que necesitan interactividad (buscador, grilla de proyectos, admin).
- **React** para los componentes interactivos, **Tailwind CSS v4** para estilos.
- **Node.js + Express** para la API, **Mongoose + MongoDB Atlas** para la persistencia.
- **Deploy en Vercel**: dos proyectos conectados al mismo repositorio (`Root Directory: frontend` y `backend`), cada `push` a `main` redespliega ambos.
- **Cada tarjeta de proyecto abre un detalle propio** (`/proyectos/?id=`), no redirige a Behance. Al ser el sitio estático, el detalle se resuelve por parámetro en la URL en lugar de una ruta dinámica que Astro no puede pregenerar para ids arbitrarios.
- **Imágenes en base64** guardadas en MongoDB, comprimidas en el navegador antes de subir para respetar el límite de tamaño de request de Vercel.
- **Panel de administración** protegido por usuario y clave (variables de entorno), con sesión compartida con el detalle vía `sessionStorage`.

## Componentes propios relevantes

- **`Buscador`**: busca en los proyectos (sin imágenes, para ser liviano) por título, descripción o tags y muestra resultados en vivo.
- **`GrillaProyectos`**: carga los proyectos desde la API, muestra **chips de filtro por categoría** (interacción significativa, modifica qué proyectos se ven), maneja los estados de carga/error/ausencia y resuelve el detalle por `?id=` sincronizando el historial del navegador (botón "atrás").
- **`ProyectoDetalle`**: vista tipo Behance de un proyecto (galería de imágenes con miniaturas, tags, categoría, link). Si entrás con la clave de admin, permite **editar** todo (incluida la categoría o crear una nueva) y cambiar imágenes.
- **`SelectorImagenes`**: sube varias imágenes a la vez, las comprime en el navegador, controla el presupuesto de peso total y marca la primera como portada. Se usa tanto en el panel como en el detalle.
- **`AdminProyectos`**: panel completo (login con clave, alta/edición/borrado de proyectos, categorías nuevas). Toda la lógica admin.
- **`ServicioDetalle`**: página dinámica por service (slug) que trae de la API el servicio y listas los proyectos de esa categoría.
- **`Contacto` / `AdminMensajes`**: formulario de contacto persistido en la base y bandeja de mensajes para el admin.

## Fuente dinámica / API

El frontend consume la **propia API REST** (`https://agustinaportfolio-api.vercel.app`) como fuente dinámica de datos:

- `GET /api/proyectos` — lista de proyectos (con filtros `?destacados=true`, `?servicio=slug`, `?ligero=true` sin imágenes para el buscador).
- `GET /api/proyectos/:id` — detalle de un proyecto (galería completa).
- `GET /api/servicios` — categorías/servicios (y `POST /api/servicios` para crear categorías desde admin).
- `POST /api/mensajes` — mensajes del formulario de contacto.
- `POST/PUT/DELETE /api/proyectos/:id`, `POST /api/admin/verificar` — operaciones admin protegidas por clave.

Como **fuente externa**, el script `backend/scripts/importar-behance.js` consume el **feed RSS público de Behance** (`https://www.behance.net/agustiinaferraro.rss`) para poblar la base con títulos, descripciones, links y miniaturas de los proyectos publicados en Behance. El sitio no depende de Behance en runtime: solo se importa una vez y la web siempre lee de MongoDB.

**Sincronización automática:** un workflow de **GitHub Actions** (`.github/workflows/importar-behance.yml`) corre ese script **cada 6 horas** (y se puede ejecutar a mano desde la pestaña *Actions* del repo). Cuando se publica un proyecto nuevo en Behance, aparece solo en el portfolio; si se edita, el título/descripción/miniatura se actualizan. No pisa categoría, destacado ni imágenes cargadas desde el panel. Requiere el secret `MONGODB_URI` en el repositorio.

Como **otra fuente externa**, los **trabajos de programación desplegados en Vercel** se sincronizan con el script `backend/scripts/importar-vercel.js` (workflow `.github/workflows/importar-vercel.yml`, también cada 6 horas): lee la API de Vercel, toma el **link de producción** de cada proyecto y lo publica en el portfolio bajo la categoría **Desarrollo Full Stack** (la portada es una imagen generada; el botón de la tarjeta abre la web del proyecto). Requiere los secrets `VERCEL_TOKEN` y `MONGODB_URI`.

**Manejo de errores y límites:** cada componente muestra su estado de carga, error y vacío (por ejemplo, si la API no responde se muestra "Verificá que el backend esté corriendo"). El script de importación avisa si el feed no se puede descargar y nunca repite proyectos (deduplica por link). El panel avisa al usuario si una imagen pesa demasiado o si la galería completa excede el límite para no fallar el guardado.

## Responsive y accesibilidad

- **Responsive:** navegación de escritorio con links y búsqueda; menú hamburguesa con panel desplegable en móvil; grillas que pasan de 1/2/3 columnas según el ancho; imágenes con `object-cover` para no deformarse. Se probó en tamaños de escritorio, tablet y móvil (ver evidencia de proceso).
- **Accesibilidad:** link "saltar al contenido" para navegación por teclado; **foco visible** en todos los elementos interactivos (`:focus-visible`); textos alternativos descriptivos en todas las imágenes; `aria-label` en botones iconográficos (menú, filtros, panel); `aria-pressed` en los chips de filtro; `aria-live`/`role="alert"` para mensajes de estado; contraste de paleta (zinc sobre zinc-950) pensado para legibilidad; el tema es oscuro por decisión de identidad con acentos violeta (#B884E7) solo en los botones y verde (#69F5CC) en los detalles de texto.

## Limitaciones conocidas y líneas de mejora

- Las miniaturas importadas de Behance son las que publica su feed (resolución media). Para mejor calidad se reemplazan desde el panel de administración (las imágenes propias se comprimen a máximo 1280px).
- Las categorías nuevas creadas desde el admin quedan disponibles en bases/filtros, pero su **página propia** solo se genera al agregarlas a `frontend/src/data/servicios.js` y redesplegar (el site es estático).
- Las imágenes se guardan en base64 dentro de MongoDB; una alternativa a futuro es subirlas a un servicio de archivos (CDN/GridFS) y guardar solo la URL.
- Falta paginación en la grilla; con pocos proyectos no es necesaria, pero con muchos convendría.
- El buscador solo indexa título/descripción/tags (no texto de imágenes o PDFs).

## Créditos y licencias de terceros

- **AstroJS**, **React**, **Tailwind CSS**, **Node.js**, **Express**, **Mongoose**: de código abierto.
- **Vercel** para el hosting y **MongoDB Atlas** para la base (planes gratuitos).
- **Behance** (feed RSS público) como fuente externa de contenido del propio perfil de la autora.
- **Datos propios de la autora:** proyectos, servicios, textos e imágenes del portfolio (salvo los que ya eran de Behance).
- Iconos: SVG propios o del sistema (símbolos de redes, candado, lupa, etc.).

## Registro de uso de IA

Se usaron **herramientas de asistencia por IA (opencode)** durante el desarrollo. El registro honesto de para qué se usó, qué se revisó y qué decisiones fueron propias está en [`docs/proceso.md`](docs/proceso.md). En resumen: la IA asistió en implementación, debugging y documentación, pero la autora revisó, adaptó y decidió cada parte, y puede explicar y modificar todo el código (ver [`docs/defensa.md`](docs/defensa.md)).