# Sistema de Venta ERP/POS

Proyecto ERP/POS empresarial moderno, multiempresa, multisucursal, offline-first y preparado para producción.

## Entrega actual

Esta carpeta está preparada como una versión compilada de producción para publicar directamente en GitHub Pages, Netlify, Vercel o hosting tradicional.

La raíz contiene la app compilada:

- `index.html`
- `assets/`
- `icons/`
- `manifest.webmanifest`
- `404.html`
- `.nojekyll`

El código fuente editable está en:

- `codigo-fuente-completo/`

La documentación y el prompt maestro están en:

- `docs/`

## Publicación rápida en GitHub Pages

Sube todo el contenido de esta carpeta a tu repositorio y configura GitHub Pages así:

- Source: Deploy from a branch
- Branch: main
- Folder: / root

El archivo `index.html` debe quedar en la raíz del repositorio.

## Desarrollo local

Para modificar el código fuente:

```bash
cd codigo-fuente-completo
npm install
npm run dev
```

Para compilar una nueva versión:

```bash
npm run build
```

## Requisito de publicación universal

La app debe poder publicarse sin pantalla blanca en GitHub Pages, Netlify, Vercel, hosting tradicional, dominio propio y subcarpetas. La versión publicada debe usar rutas compatibles y debe abrir la interfaz aunque Supabase o Cloudflare R2 todavía no estén configurados.
