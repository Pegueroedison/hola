import type { ModuleKey, PermissionAction, UserSession } from '@/types';

export function can(session: UserSession | null, module: ModuleKey, action: PermissionAction) {
  if (!session) return false;
  if (session.role === 'owner') return true;
  return session.permissions.some((permission) => permission.module === module && permission.action === action);
}

export function visibleFor(session: UserSession | null, module: ModuleKey) {
  return can(session, module, 'view');
}

export function requireAuthorization(reason: string) {
  return ['out_of_stock', 'expired_product', 'special_discount', 'manual_price_change', 'void_sale', 'credit_limit', 'cash_difference'].includes(reason);
}
