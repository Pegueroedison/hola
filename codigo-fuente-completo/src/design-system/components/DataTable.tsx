import React from 'react';
import { cn } from '@/lib/utils';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({ data, columns, empty = 'No hay datos' }: { data: T[]; columns: Column<T>[]; empty?: string }) {
  if (!data.length) return <div className="rounded-2xl border border-dashed border-slate-300 p-6 text-center text-sm text-muted dark:border-slate-700">{empty}</div>;
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>{columns.map((col) => <th key={String(col.key)} className={cn('px-4 py-3 text-left font-bold text-slate-600 dark:text-slate-300', col.className)}>{col.header}</th>)}</tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, index) => (
              <tr key={String(row.id ?? index)} className="bg-panel hover:bg-slate-50 dark:hover:bg-slate-900/70">
                {columns.map((col) => <td key={String(col.key)} className="px-4 py-3">{col.render ? col.render(row) : String(row[col.key] ?? '')}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
