import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './Button';

export function Modal({ open, title, children, onClose, className }: { open: boolean; title: string; children: React.ReactNode; onClose: () => void; className?: string }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/55 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className={cn('w-full max-w-xl rounded-3xl bg-panel p-5 shadow-soft dark:border dark:border-slate-800', className)}>
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} aria-label="Cerrar"><X size={18} /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}
