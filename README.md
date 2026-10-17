# S3 Teacher - Aplicación Web de Enseñanza Interactiva

Aplicación web estilo Duolingo para enseñanza interactiva de cualquier materia. Incluye lecciones gamificadas, sistema de rachas (streaks), cuaderno de notas inteligente ("La Libreta") con subida de fotos y PDFs, y diseño offline-first.

## Características

- **Gamificación**: Rachas diarias, lecciones con preguntas múltiples, completar espacios, verdadero/falso. Retroalimentación inmediata con animaciones.
- **La Libreta**: Notas diarias + subida ilimitada de fotos y PDFs (almacenados localmente en IndexedDB).
- **Offline-first**: Funciona sin conexión gracias a Service Worker y almacenamiento local.
- **Responsiva**: Optimizada para móviles y escritorio.
- **Progreso local**: Se guarda en localStorage e IndexedDB del navegador.

## Requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari).
- Para desarrollo local: Cualquier servidor estático (recomendado: `npx serve` o Live Server).

## Instalación y Uso Local

1. Clona el repositorio:
   ```bash
   git clone https://github.com/S3ebaz/S3-teacher.git
   cd S3-teacher
   ```

2. (Opcional) Si usas un servidor:
   ```bash
   npx serve .
   ```
   O abre `index.html` directamente en el navegador (algunas funciones de IndexedDB funcionan mejor con servidor).

3. La app está lista. Todo el progreso se guarda automáticamente en tu navegador.

## Configuración para Guardar Avances

- El progreso (lecciones completadas, rachas, notas) se almacena en **localStorage**.
- Archivos (fotos/PDFs) se almacenan en **IndexedDB**.
- No se pierden al cerrar el navegador.
- Para respaldar: Usa las herramientas de desarrollador del navegador (Application > Storage) o exporta manualmente si se implementa.

## Despliegue en GitHub Pages

1. Sube el repositorio a GitHub (nombre recomendado: `S3-teacher`).
2. Ve a **Settings > Pages**.
3. Selecciona la rama `main` y carpeta `/ (root)`.
4. La app estará disponible en `https://S3ebaz.github.io/S3-teacher/`.

## Estructura del Proyecto

```
S3-teacher/
├── index.html
├── manifest.json
├── sw.js
├── README.md
├── css/
│   └── style.css
├── js/
│   ├── app.js
│   ├── lessons.js
│   └── notebook.js
└── data/
    └── lessons.json
```

## Personalización

- Edita `data/lessons.json` para agregar nuevas materias o lecciones.
- Modifica colores en `css/style.css` (variables CSS al inicio).
- Agrega más tipos de preguntas en `js/lessons.js`.

## Tecnologías

- HTML5, CSS3 (variables, flex/grid, animaciones)
- JavaScript moderno (ES6+, IndexedDB, Service Worker)
- PWA ready (manifest + SW)

¡Disfruta aprendiendo! 🚀
