import { useEffect, useMemo, useState } from 'react';
import { Menu, Moon, Sun } from 'lucide-react';
import { Button } from '@/design-system/components';
import { can, visibleFor } from '@/lib/permissions';
import { startSyncLoop } from '@/offline/syncEngine';
import { useSessionStore } from '@/stores/sessionStore';
import { useSettingsStore } from '@/stores/settingsStore';
import type { ModuleKey } from '@/types';
import { Dashboard } from '@/modules/dashboard/Dashboard';
import { POS } from '@/modules/pos/POS';
import { Settings } from '@/modules/settings/Settings';
import { GenericModule } from '@/modules/shared/GenericModule';
import { getModule, modules } from '@/modules/moduleRegistry';

function renderModule(active: ModuleKey) {
  if (active === 'dashboard') return <Dashboard />;
  if (active === 'pos') return <POS />;
  if (active === 'settings') return <Settings />;
  return <GenericModule module={getModule(active)} />;
}

export default function App() {
  const [active, setActive] = useState<ModuleKey>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = useSessionStore((state) => state.session);
  const settings = useSettingsStore();

  useEffect(() => startSyncLoop(), []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', settings.darkMode);
  }, [settings.darkMode]);

  const visibleModules = useMemo(() => {
    const ordered = settings.moduleOrder.map((key) => modules.find((module) => module.key === key)).filter(Boolean) as typeof modules;
    return ordered.filter((module) => !settings.hiddenModules.includes(module.key) && visibleFor(session, module.key));
  }, [settings.moduleOrder, settings.hiddenModules, session]);

  useEffect(() => {
    if (!visibleModules.some((module) => module.key === active)) {
      setActive(visibleModules[0]?.key ?? 'dashboard');
    }
  }, [visibleModules, active]);

  return (
    <div className="min-h-screen bg-surface text-slate-950 dark:text-slate-50">
      <div className="flex min-h-screen">
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-40 w-80 border-r border-slate-200 bg-panel p-4 transition md:sticky md:top-0 md:translate-x-0 dark:border-slate-800`}>
          <div className="mb-5 rounded-3xl bg-slate-950 p-4 text-white dark:bg-white dark:text-slate-950">
            <div className="text-lg font-black">{settings.appName}</div>
            <div className="text-xs opacity-80">Multiempresa · Multisucursal</div>
          </div>
          <nav className="space-y-1 overflow-y-auto pb-8">
            {visibleModules.map((module) => {
              const Icon = module.icon;
              const isActive = active === module.key;
              return (
                <button key={module.key} onClick={() => { setActive(module.key); setSidebarOpen(false); }} className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-semibold transition ${isActive ? 'bg-brand-600 text-white shadow-soft' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
                  <Icon size={18} />
                  <span>{module.title}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {sidebarOpen && <button className="fixed inset-0 z-30 bg-slate-950/50 md:hidden" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menú" />}

        <main className="flex-1 p-4 md:p-6">
          <header className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Button variant="outline" className="md:hidden" onClick={() => setSidebarOpen(true)}><Menu size={18} /></Button>
              <div>
                <h1 className="text-2xl font-black tracking-tight">{getModule(active).title}</h1>
                <p className="text-sm text-muted">Empresa demo · Sucursal principal</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => settings.setDarkMode(!settings.darkMode)}>{settings.darkMode ? <Sun size={18} /> : <Moon size={18} />}</Button>
              {can(session, 'settings', 'view') && <Button variant="secondary" onClick={() => setActive('settings')}>Admin</Button>}
            </div>
          </header>
          {renderModule(active)}
        </main>
      </div>
    </div>
  );
}
