import { Badge, Button, Card, CardDescription, CardHeader, CardTitle, DataTable, Field, Input } from '@/design-system/components';
import { useSettingsStore } from '@/stores/settingsStore';
import { modules } from '../moduleRegistry';

export function Settings() {
  const settings = useSettingsStore();
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Configuración administrable</CardTitle>
            <CardDescription>Logos, temas, menús, módulos, tickets y dashboard.</CardDescription>
          </div>
          <Button onClick={() => settings.setDarkMode(!settings.darkMode)}>{settings.darkMode ? 'Modo claro' : 'Modo oscuro'}</Button>
        </CardHeader>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre del sistema"><Input value={settings.appName} onChange={(event) => settings.updateSettings({ appName: event.target.value })} /></Field>
          <Field label="Moneda"><Input value={settings.currency} onChange={(event) => settings.updateSettings({ currency: event.target.value })} /></Field>
          <Field label="Ticket por defecto"><Input value={settings.ticketWidth} onChange={(event) => settings.updateSettings({ ticketWidth: event.target.value as '58mm' | '80mm' })} /></Field>
          <Field label="No volver a mostrar notificaciones por días"><Input type="number" value={settings.notificationPromptSnoozeDays} onChange={(event) => settings.updateSettings({ notificationPromptSnoozeDays: Number(event.target.value) })} /></Field>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <div>
            <CardTitle>Módulos del sistema</CardTitle>
            <CardDescription>El orden y la visibilidad se guardan por empresa.</CardDescription>
          </div>
        </CardHeader>
        <DataTable
          data={modules.map((module, index) => ({ id: module.key, order: index + 1, module: module.title, status: settings.hiddenModules.includes(module.key) ? 'Oculto' : 'Visible' }))}
          columns={[
            { key: 'order', header: 'Orden' },
            { key: 'module', header: 'Módulo' },
            { key: 'status', header: 'Estado', render: (row) => <Badge tone={row.status === 'Visible' ? 'success' : 'warning'}>{String(row.status)}</Badge> }
          ]}
        />
      </Card>
    </div>
  );
}
