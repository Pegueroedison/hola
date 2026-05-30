# Instrucciones de publicación

Esta entrega está pensada para publicarse rápido y bien como app compilada de producción.

## Qué se sube a GitHub Pages

Sube a tu repositorio todo lo que está en la raíz de esta carpeta:

- `index.html`
- `assets/`
- `icons/`
- `manifest.webmanifest`
- `404.html`
- `.nojekyll`
- `README.md`
- `docs/`
- `codigo-fuente-completo/`

El archivo `index.html` debe quedar en la raíz del repositorio, no dentro de otra carpeta.

## Configuración recomendada en GitHub Pages

- Source: Deploy from a branch
- Branch: main
- Folder: / root

## Qué contiene `codigo-fuente-completo/`

Ahí está el proyecto editable React/Vite/TypeScript. No es lo que GitHub Pages ejecuta directamente cuando publicas desde rama; se incluye para futuras modificaciones.

## Regla de entrega

La raíz del ZIP contiene la app compilada y optimizada. El código fuente completo se incluye aparte.
