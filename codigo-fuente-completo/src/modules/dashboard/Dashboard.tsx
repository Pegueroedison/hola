import { Card, CardDescription, CardHeader, CardTitle } from '@/design-system/components';
import { money } from '@/lib/utils';

const salesData = [
  { day: 'Lun', total: 12500 },
  { day: 'Mar', total: 18400 },
  { day: 'Mié', total: 9700 },
  { day: 'Jue', total: 22300 },
  { day: 'Vie', total: 31000 },
  { day: 'Sáb', total: 27750 }
];

export function Dashboard() {
  const max = Math.max(...salesData.map((item) => item.total));

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Ventas de hoy', money(48750)],
          ['Caja abierta', money(12680)],
          ['Cuentas por cobrar', money(142300)],
          ['Productos bajos', '18']
        ].map(([label, value]) => (
          <Card key={label}>
            <CardDescription>{label}</CardDescription>
            <div className="mt-2 text-2xl font-black">{value}</div>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Ventas semanales</CardTitle>
            <CardDescription>Resumen visual de ventas por día, sin cargar librerías pesadas en el inicio.</CardDescription>
          </div>
        </CardHeader>
        <div className="flex h-72 items-end gap-3 rounded-3xl bg-slate-50 p-4 dark:bg-slate-900">
          {salesData.map((item) => (
            <div key={item.day} className="flex h-full flex-1 flex-col justify-end gap-2">
              <div className="rounded-t-2xl bg-brand-600 transition-all" style={{ height: `${Math.max((item.total / max) * 100, 8)}%` }} title={`${item.day}: ${money(item.total)}`} />
              <div className="text-center text-xs font-bold text-muted">{item.day}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
