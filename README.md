# FORMANDO PALABRAS 9

Aplicación web donde cada usuario obtiene una combinación aleatoria de **9 letras** (de las 26 del abecedario). Las combinaciones son únicas a nivel global — 5,429,503,678,976 posibles (26⁹).

A diferencia de la versión de 4 letras, **este proyecto no incluye el flujo de espera con anuncios**: al presionar "Formar Palabra" se redirige a una URL externa (`WAIT_FLOW_URL` en `js/config.js`), que es un proyecto aparte con su propio dominio, sus propios anuncios y sus propias páginas de espera. Cuando ese flujo externo termina, debe redirigir de vuelta aquí con `?formar=1` para revelar la palabra.

---

## Estructura del proyecto

```
formando-palabras-9/
├── index.html              # Markup principal (sin páginas de espera embebidas)
├── css/
│   ├── tokens.css          # Variables de diseño (colores, tipografía, radios)
│   ├── base.css            # Reset, body, ambient, loader, toast, responsive
│   ├── auth.css            # Pantalla de acceso (login + registro con animación)
│   └── main.css            # Página principal, cuadros de letras, dashboard
├── js/
│   ├── config.js           # Credenciales Supabase y constantes del juego (WORD_LENGTH = 9)
│   ├── db.js               # Todas las operaciones con Supabase
│   ├── auth.js             # Lógica de login, registro y animación de tabs
│   ├── game.js             # Generador de 9 letras, redirección al flujo externo, revelado
│   └── main.js             # Estado global, UI helpers, router de páginas, init
└── database/
    └── setup.sql           # Script SQL completo para Supabase (proyecto NUEVO y separado)
```

---

## Configuración

### 1. Base de datos (Supabase) — proyecto NUEVO

⚠️ No reutilices el proyecto de Supabase de "Formando Palabras" (4 letras). Crea uno nuevo para que usuarios, referidos e historial de combinaciones no se mezclen entre ambos juegos.

1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Ve a **SQL Editor → New Query**
3. Pega el contenido de `database/setup.sql` y haz clic en **Run**

### 2. Credenciales y dominio de espera

Edita `js/config.js`:

```js
const SUPABASE_URL      = 'https://TU_PROJECT.supabase.co';
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';
const SITE_URL           = 'https://TU_USUARIO.github.io/TU_REPO'; // o tu dominio propio
```

Y en `js/game.js`, apunta al dominio del proyecto de espera/anuncios que vas a comprar:

```js
const WAIT_FLOW_URL = 'https://tu-dominio-de-espera.com/';
```

Ese proyecto externo debe redirigir de vuelta a `SITE_URL + '/?formar=1'` cuando termine su flujo de anuncios, para que esta página revele y guarde la combinación.

### 3. CORS en Supabase

- Ve a **Project Settings → API → CORS**
- Agrega la URL de tu sitio (ej: `https://tudominio.com`)

---

## Hosting en GitHub Pages

1. Sube el proyecto a un repositorio de GitHub
2. Ve a **Settings → Pages**
3. En **Source** selecciona `main` branch y carpeta `/ (root)`
4. Tu sitio estará en `https://TU_USUARIO.github.io/TU_REPO`

---

## Funcionalidades

| Función | Descripción |
|---|---|
| Login / Registro | Pantalla única con tabs animados. Login busca usuario existente; Registro crea uno nuevo |
| Combinación aleatoria | 9 letras (A–Z) generadas al volver del flujo de espera externo |
| Flujo de espera | Vive en otro proyecto/dominio; este sitio solo redirige y espera `?formar=1` de vuelta |
| Animación de revelado | Los 9 cuadros giran y revelan las letras de forma escalonada |
| Historial personal | Solo tus propias combinaciones formadas, en tiempo real |
| Enlace de referido | Link y código únicos por usuario, bloqueados para edición |
| Contador de referidos | Muestra cuántas personas se registraron con tu enlace |
| Seguridad | RLS en Supabase, CORS, Security Headers, sesión en localStorage |

---

## Seguridad

- **Row Level Security (RLS)** activado en tablas `users` y `words`
- **Security Headers** vía `<meta>` en el HTML
- **CORS** configurable desde el panel de Supabase
- **Sesión** guardada en `localStorage`, verificada contra la BD en cada carga
- Las combinaciones ya usadas **no se pueden repetir** (unique constraint en BD)
- La palabra pendiente se guarda temporalmente en `localStorage` (con expiración de 1 hora) mientras el usuario pasa por el flujo de espera externo
