import React from 'react';
import { Button, Card, CardDescription, CardHeader, CardTitle } from '@/design-system/components';

type Props = { children: React.ReactNode };
type State = { error: Error | null };

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error) {
    console.error('ERP POS runtime error:', error);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <main className="min-h-screen bg-surface p-6 text-slate-950 dark:text-slate-50">
        <div className="mx-auto flex min-h-[80vh] max-w-3xl items-center">
          <Card className="w-full">
            <CardHeader className="block">
              <CardTitle>La interfaz encontró un error</CardTitle>
              <CardDescription>La app cargó, pero un módulo falló. Esto evita la pantalla blanca y permite ver el problema.</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <pre className="overflow-auto rounded-2xl bg-slate-950 p-4 text-xs text-slate-50">{this.state.error.message}</pre>
              <Button onClick={() => window.location.reload()}>Recargar</Button>
            </div>
          </Card>
        </div>
      </main>
    );
  }
}
