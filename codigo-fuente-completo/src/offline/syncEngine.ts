import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase';
import { listPendingOperations, markOperationFailed, markOperationSynced } from './offlineQueue';

export async function syncPendingOperations() {
  if (!navigator.onLine || !isSupabaseConfigured) return { synced: 0, failed: 0 };
  const client = await getSupabaseClient();
  if (!client) return { synced: 0, failed: 0 };

  const operations = await listPendingOperations();
  let synced = 0;
  let failed = 0;

  for (const operation of operations) {
    try {
      if (operation.action === 'insert') {
        const { error } = await client.from(operation.entity).insert(operation.payload as Record<string, unknown>);
        if (error) throw error;
      }
      if (operation.action === 'update') {
        const payload = operation.payload as { id: string } & Record<string, unknown>;
        const { error } = await client.from(operation.entity).update(payload).eq('id', payload.id);
        if (error) throw error;
      }
      if (operation.action === 'delete') {
        const payload = operation.payload as { id: string };
        const { error } = await client.from(operation.entity).delete().eq('id', payload.id);
        if (error) throw error;
      }
      if (operation.action === 'rpc') {
        const payload = operation.payload as { functionName: string; args: Record<string, unknown> };
        const { error } = await client.rpc(payload.functionName, payload.args);
        if (error) throw error;
      }
      await markOperationSynced(operation.id);
      synced++;
    } catch (error) {
      await markOperationFailed(operation, error instanceof Error ? error.message : 'Error desconocido');
      failed++;
    }
  }

  return { synced, failed };
}

export function startSyncLoop() {
  const run = () => void syncPendingOperations();
  window.addEventListener('online', run);
  const timer = window.setInterval(run, 25_000);
  return () => {
    window.removeEventListener('online', run);
    window.clearInterval(timer);
  };
}
