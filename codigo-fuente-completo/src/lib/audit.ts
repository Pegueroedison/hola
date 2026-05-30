import { getSupabaseClient } from './supabase';
import { enqueueOperation } from '@/offline/offlineQueue';

export async function auditLog(input: {
  companyId: string;
  branchId?: string;
  module: string;
  action: string;
  entity: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  authorizerUserId?: string;
}) {
  const payload = {
    company_id: input.companyId,
    branch_id: input.branchId,
    module: input.module,
    action: input.action,
    entity: input.entity,
    entity_id: input.entityId,
    before_data: input.before ?? null,
    after_data: input.after ?? null,
    reason: input.reason ?? null,
    authorizer_user_id: input.authorizerUserId ?? null
  };

  const client = await getSupabaseClient();
  if (!client || !navigator.onLine) {
    await enqueueOperation('audit_logs', 'insert', payload, `audit:${input.entity}:${input.entityId}:${input.action}`);
    return;
  }

  const { error } = await client.from('audit_logs').insert(payload);
  if (error) {
    await enqueueOperation('audit_logs', 'insert', payload, `audit:${input.entity}:${input.entityId}:${input.action}`);
  }
}
