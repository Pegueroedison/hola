import { deleteLocal, getAllLocal, putLocal } from './indexedDb';
import type { OfflineOperation } from '@/types';
import { nowIso, uid } from '@/lib/utils';

export async function enqueueOperation<T>(entity: string, action: OfflineOperation<T>['action'], payload: T, dedupeKey: string) {
  const existing = await getAllLocal<OfflineOperation<T>>('operations');
  const duplicated = existing.find((operation) => operation.dedupeKey === dedupeKey && operation.status !== 'synced');
  if (duplicated) return duplicated;

  const operation: OfflineOperation<T> = {
    id: uid('op'),
    entity,
    action,
    payload,
    dedupeKey,
    status: 'pending',
    createdAt: nowIso(),
    updatedAt: nowIso()
  };
  await putLocal('operations', operation);
  return operation;
}

export async function listPendingOperations() {
  return (await getAllLocal<OfflineOperation>('operations')).filter((operation) => operation.status === 'pending' || operation.status === 'failed');
}

export async function markOperationSynced(id: string) {
  await deleteLocal('operations', id);
}

export async function markOperationFailed(operation: OfflineOperation, error: string) {
  await putLocal('operations', { ...operation, status: 'failed', error, updatedAt: nowIso() });
}
