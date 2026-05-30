# ERP/POS Multiempresa Offline-First

Proyecto base completo para crear una plataforma ERP/POS moderna, multiempresa, multisucursal, offline-first, instalable como PWA y preparada para Desktop Windows con Tauri.

Este repositorio fue generado a partir del prompt maestro ubicado en `docs/PROMPT_MAESTRO.txt`.

## Qué incluye

- React + Vite + TypeScript.
- Tailwind CSS.
- Design system centralizado para botones, formularios, modales, tarjetas, tablas y badges.
- Modo oscuro global.
- Registro centralizado de módulos y permisos.
- Panel administrativo configurable.
- POS con carrito, pagos mixtos y flujo de autorizaciones.
- Inventario con lotes, vencimientos, autorización para vender sin existencia o vencido.
- Clientes, proveedores, compras, ventas, cuentas por cobrar, cuentas por pagar, caja, contabilidad, nómina, RRHH, reportes, auditoría, etiquetas, tickets y motor de áreas operativas.
- Offline-first para Web/PWA usando IndexedDB.
- Base preparada para Desktop Windows con Tauri y SQLite.
- Supabase Auth, PostgreSQL, RLS, RPC, triggers y Edge Functions.
- Cloudflare R2 para imágenes/documentos y Supabase solo para metadata.

## Instalación rápida

```bash
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

Copia `.env.example` a `.env` y configura:

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_APP_NAME=ERP POS
VITE_R2_PUBLIC_URL=
```

Para Supabase Edge Functions también configura los secretos:

```bash
supabase secrets set R2_ACCOUNT_ID=xxx R2_ACCESS_KEY_ID=xxx R2_SECRET_ACCESS_KEY=xxx R2_BUCKET=xxx R2_PUBLIC_URL=xxx
```

## Base de datos

Las migraciones principales están en:

```bash
supabase/migrations/001_initial_erp_schema.sql
supabase/migrations/002_rls_policies.sql
supabase/migrations/003_rpc_authorizations_and_audit.sql
```

Ejecuta con Supabase CLI:

```bash
supabase login
supabase link --project-ref TU_PROJECT_REF
supabase db push
supabase functions deploy r2-signed-upload
```

## Desktop Windows con Tauri

```bash
npm run tauri:dev
npm run tauri:build
```

La app Web/PWA usa IndexedDB. La versión Desktop queda preparada para SQLite vía Tauri, ubicada en `src/platform/desktop`.

## Estructura importante

```txt
src/design-system       Componentes globales reutilizables
src/modules             Módulos del ERP/POS
src/lib                 Supabase, permisos, auditoría, sincronización
src/offline             IndexedDB, cola offline y motor de sincronización
src/platform            Adaptadores Web/PWA/Desktop
supabase/migrations     Schema, RLS, RPC y triggers
supabase/functions      Edge Functions
src-tauri               Configuración Desktop Windows
```

## Regla de arquitectura

No se deben crear botones, tablas, formularios o modales aislados dentro de módulos. Todo debe salir del design system centralizado para que un cambio visual afecte todo el sistema.

## Estado de esta entrega

Esta entrega es una base completa y ejecutable de arquitectura inicial. Incluye pantallas, rutas internas, flujo POS, permisos, offline queue, migraciones SQL, RLS base y estructura lista para crecer. Un ERP comercial completo requiere completar reglas fiscales específicas, integraciones de impresoras, comprobantes fiscales del país, pruebas QA, hardening de seguridad y despliegue real.


## Importante: cómo abrir el proyecto

Este proyecto usa Vite. El `index.html` de la raíz es el punto de entrada para el servidor de desarrollo, por eso no debe probarse solo con doble clic como si fuera una página HTML normal.

Para probar rápido sin instalar nada, abre:

```text
ABRIR_DEMO_LOCAL.html
```

Ese archivo abre la versión compilada incluida en `dist/index.html`.

Para desarrollo real usa:

```bash
npm install
npm run dev
```

Para generar una nueva versión compilada:

```bash
npm run build
```
