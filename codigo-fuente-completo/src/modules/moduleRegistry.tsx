import { BarChart3, Boxes, Building2, ClipboardCheck, CreditCard, FileText, Landmark, LayoutDashboard, PackagePlus, Receipt, Settings, ShoppingCart, Store, Tags, Ticket, Truck, Users, WalletCards, Workflow } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ModuleKey } from '@/types';

export interface ModuleDefinition {
  key: ModuleKey;
  title: string;
  description: string;
  icon: LucideIcon;
}

export const modules: ModuleDefinition[] = [
  { key: 'dashboard', title: 'Dashboard', description: 'Indicadores principales de la empresa.', icon: LayoutDashboard },
  { key: 'pos', title: 'POS', description: 'Ventas rápidas, tickets, crédito y pagos mixtos.', icon: ShoppingCart },
  { key: 'inventory', title: 'Inventario', description: 'Productos, lotes, vencimientos, kardex y transferencias.', icon: Boxes },
  { key: 'purchases', title: 'Compras', description: 'Órdenes, recepciones, crédito y devoluciones.', icon: PackagePlus },
  { key: 'sales', title: 'Ventas', description: 'Facturas, cotizaciones, pedidos y devoluciones.', icon: Receipt },
  { key: 'customers', title: 'Clientes', description: 'Historial, crédito, descuentos y estado de cuenta.', icon: Users },
  { key: 'suppliers', title: 'Proveedores', description: 'Historial, compras, pagos y vencimientos.', icon: Truck },
  { key: 'receivables', title: 'Cuentas por cobrar', description: 'Abonos, saldos pendientes y antigüedad.', icon: WalletCards },
  { key: 'payables', title: 'Cuentas por pagar', description: 'Facturas pendientes, pagos y vencimientos.', icon: CreditCard },
  { key: 'cash', title: 'Caja', description: 'Apertura, cierre, entradas, salidas y diferencias.', icon: Store },
  { key: 'accounting', title: 'Contabilidad', description: 'Catálogo, diario, mayor y estados financieros.', icon: Landmark },
  { key: 'payroll', title: 'Nómina', description: 'Empleados, comisiones, deducciones, préstamos y recibos.', icon: FileText },
  { key: 'hr', title: 'RRHH', description: 'Expedientes, contratos, documentos y evaluaciones.', icon: Building2 },
  { key: 'workflow', title: 'Áreas de trabajo', description: 'Cocina, barra, despacho, taller, laboratorio o producción.', icon: Workflow },
  { key: 'labels', title: 'Etiquetas', description: 'Impresión de etiquetas con precio, SKU, QR y lote.', icon: Tags },
  { key: 'tickets', title: 'Tickets', description: 'Plantillas 58mm, 80mm, factura y reimpresión.', icon: Ticket },
  { key: 'reports', title: 'Reportes', description: 'PDF, Excel, CSV y gráficos operativos.', icon: BarChart3 },
  { key: 'authorizations', title: 'Autorizaciones', description: 'Aprobaciones de supervisor y administrador.', icon: ClipboardCheck },
  { key: 'audit', title: 'Auditoría', description: 'Registro total de cambios, motivos y autorizadores.', icon: ClipboardCheck },
  { key: 'settings', title: 'Configuración', description: 'Empresas, sucursales, menús, campos, temas y permisos.', icon: Settings }
];

export function getModule(key: ModuleKey) {
  return modules.find((module) => module.key === key)!;
}
