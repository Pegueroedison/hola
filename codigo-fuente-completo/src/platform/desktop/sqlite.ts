export async function openDesktopDb() {
  const { default: Database } = await import('@tauri-apps/plugin-sql');
  return Database.load('sqlite:erp-pos.db');
}

export async function ensureDesktopSchema() {
  const db = await openDesktopDb();
  await db.execute(`
    create table if not exists offline_operations (
      id text primary key,
      entity text not null,
      action text not null,
      payload text not null,
      dedupe_key text not null unique,
      status text not null,
      created_at text not null,
      updated_at text not null
    )
  `);
  return db;
}
