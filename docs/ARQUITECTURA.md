# Arquitectura general

## Principios

1. Multiempresa real desde base de datos.
2. Multisucursal, multicaja y multialmacén.
3. Offline-first: las operaciones se guardan localmente y se sincronizan con Supabase.
4. Permisos granulares por empresa, sucursal, almacén, caja, rol, usuario, módulo y acción.
5. Autorizaciones trazables para acciones sensibles.
6. Design system centralizado: ningún módulo debe crear componentes visuales aislados.
7. Auditoría total de cambios.

## Flujo offline

- Web/PWA usa IndexedDB.
- Desktop Windows usa SQLite mediante Tauri.
- Cada operación genera una clave `dedupeKey` para prevenir duplicados.
- La cola sincroniza cuando vuelve internet o cada cierto intervalo.
- Si Supabase rechaza una operación, queda marcada como `failed` para revisión.

## Autorizaciones

Acciones que deben pasar por `authorization_requests`:

- Venta sin existencia.
- Venta de producto vencido.
- Descuento especial.
- Cambio manual de precio.
- Reimpresión.
- Anulación.
- Superar límite de crédito.
- Cierre de caja con diferencia.

## Motor de áreas operativas

Cada empresa puede crear áreas: cocina, barra, laboratorio, producción, despacho, taller, recepción o cualquier otra. Las rutas se configuran por producto o categoría. Al completar una venta, `create_workflow_orders_for_sale` genera órdenes para las áreas correspondientes.

## Archivos

Cloudflare R2 almacena imágenes y documentos. Supabase guarda metadata en `file_assets`.
