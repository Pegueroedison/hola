export type ID = string;

export type RoleKey =
  | 'owner'
  | 'admin'
  | 'manager'
  | 'supervisor'
  | 'cashier'
  | 'seller'
  | 'purchases'
  | 'inventory'
  | 'accounting'
  | 'hr'
  | 'auditor'
  | 'readonly';

export type PermissionAction = 'view' | 'create' | 'update' | 'delete' | 'approve' | 'authorize' | 'export' | 'print' | 'void';

export type ModuleKey =
  | 'dashboard'
  | 'pos'
  | 'inventory'
  | 'purchases'
  | 'sales'
  | 'customers'
  | 'suppliers'
  | 'receivables'
  | 'payables'
  | 'accounting'
  | 'payroll'
  | 'hr'
  | 'cash'
  | 'reports'
  | 'audit'
  | 'settings'
  | 'labels'
  | 'tickets'
  | 'authorizations'
  | 'workflow';

export interface Permission {
  module: ModuleKey;
  action: PermissionAction;
  companyId?: ID;
  branchId?: ID;
  warehouseId?: ID;
  registerId?: ID;
}

export interface UserSession {
  id: ID;
  fullName: string;
  email: string;
  role: RoleKey;
  companyId: ID;
  branchId: ID;
  permissions: Permission[];
}

export interface Product {
  id: ID;
  name: string;
  sku: string;
  barcode?: string;
  price: number;
  taxRate: number;
  stock: number;
  unit: string;
  category?: string;
  lot?: string;
  expirationDate?: string;
  requiresLot?: boolean;
  allowAuthorizedExpiredSale?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
  authorizationId?: ID;
}

export interface OfflineOperation<T = unknown> {
  id: ID;
  entity: string;
  action: 'insert' | 'update' | 'delete' | 'rpc';
  payload: T;
  dedupeKey: string;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
  createdAt: string;
  updatedAt: string;
  error?: string;
}
