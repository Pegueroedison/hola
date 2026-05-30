import { Badge, Button, Card, CardDescription, CardHeader, CardTitle, DataTable } from '@/design-system/components';
import type { ModuleDefinition } from '../moduleRegistry';

const demoRows = [
  { id: '1', name: 'Registro principal', status: 'Activo', updatedAt: 'Hoy' },
  { id: '2', name: 'Configuración pendiente', status: 'Revisar', updatedAt: 'Ayer' }
];

export function GenericModule({ module }: { module: ModuleDefinition }) {
  const Icon = module.icon;
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <div className="mb-3 inline-flex rounded-2xl bg-brand-50 p-3 text-brand-700 dark:bg-slate-800 dark:text-brand-500"><Icon size={24} /></div>
            <CardTitle>{module.title}</CardTitle>
            <CardDescription>{module.description}</CardDescription>
          </div>
          <Button>Nuevo</Button>
        </CardHeader>
        <DataTable
          data={demoRows}
          columns={[
            { key: 'name', header: 'Nombre' },
            { key: 'status', header: 'Estado', render: (row) => <Badge tone={row.status === 'Activo' ? 'success' : 'warning'}>{String(row.status)}</Badge> },
            { key: 'updatedAt', header: 'Actualizado' }
          ]}
        />
      </Card>
    </div>
  );
}
