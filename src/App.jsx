import { useRef, useState } from 'react';
import {
  Cpu, Keyboard, Workflow, Usb, ClipboardList, Download, Upload, RotateCcw, AlertTriangle, Database, X,
} from 'lucide-react';
import { useDb, exportDb, readJsonFile } from './lib/store';
import BoardMap from './components/BoardMap';
import KeyTester from './components/KeyTester';
import SignalFlow from './components/SignalFlow';
import SerialMonitor from './components/SerialMonitor';
import RepairLog from './components/RepairLog';

const TABS = [
  { id: 'mapa', label: 'Mapa das Placas', short: 'Placas', icon: Cpu },
  { id: 'teclas', label: 'Testador de Teclas', short: 'Teclas', icon: Keyboard },
  { id: 'fluxo', label: 'Diagnóstico e Sinal', short: 'Diagnóstico', icon: Workflow },
  { id: 'serial', label: 'Simulador de Validador', short: 'Serial', icon: Usb },
  { id: 'registros', label: 'Registros e Referência', short: 'Registros', icon: ClipboardList },
];

function readTab() {
  try {
    const t = localStorage.getItem('dk620-tab');
    return TABS.some((x) => x.id === t) ? t : 'mapa';
  } catch {
    return 'mapa';
  }
}

export default function App() {
  const { db, replace, reset, saveError } = useDb();
  const [tab, setTab] = useState(readTab);
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const fileRef = useRef(null);

  const go = (id) => {
    setTab(id);
    try { localStorage.setItem('dk620-tab', id); } catch { /* opcional */ }
  };

  const notify = (msg, kind = 'ok') => {
    setToast({ msg, kind });
    setTimeout(() => setToast(null), 3500);
  };

  const onImport = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const data = await readJsonFile(file);
      if (!confirm('Importar este backup substitui todos os dados atuais deste navegador. Continuar?')) return;
      replace(data);
      notify('Backup importado com sucesso.');
    } catch (err) {
      notify(err.message, 'err');
    }
    setMenuOpen(false);
  };

  const eq = db.equipamento;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 bg-bench-950/95 backdrop-blur border-b border-bench-700">
        <div className="max-w-[1400px] mx-auto px-4 py-3 flex items-center gap-3">
          <div className="rounded-lg bg-pcb border border-pcb-trace/50 p-2 text-pcb-trace shrink-0">
            <Cpu size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-slate-100 leading-tight truncate">
              {eq.modelo} <span className="text-slate-500 font-normal">· {eq.partNumber}</span>
            </h1>
            <p className="text-xs text-slate-400 truncate font-mono">
              {eq.placaPrincipal} + {eq.placaTeclas.split(' (')[0]} · {eq.alimentacaoNominal}
            </p>
          </div>
          <div className="relative">
            <button className="btn-ghost" onClick={() => setMenuOpen((v) => !v)} aria-expanded={menuOpen}>
              <Database size={16} /> <span className="hidden sm:inline">Backup</span>
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 z-50 panel p-2 shadow-2xl">
                  <p className="px-2 py-1.5 text-xs text-slate-400">
                    Os dados ficam salvos neste navegador. Exporte o JSON para guardar ou levar a outro computador.
                  </p>
                  <button className="w-full btn justify-start hover:bg-bench-700" onClick={() => { exportDb(db); setMenuOpen(false); notify('Backup JSON exportado.'); }}>
                    <Download size={16} /> Exportar banco (JSON)
                  </button>
                  <button className="w-full btn justify-start hover:bg-bench-700" onClick={() => fileRef.current?.click()}>
                    <Upload size={16} /> Importar banco (JSON)
                  </button>
                  <div className="my-1 border-t border-bench-700" />
                  <button
                    className="w-full btn justify-start text-red-300 hover:bg-red-500/10"
                    onClick={() => {
                      if (confirm('Restaurar os dados iniciais de fábrica? Registros, fotos e status atuais serão apagados deste navegador.')) {
                        reset();
                        setMenuOpen(false);
                        notify('Dados iniciais restaurados.');
                      }
                    }}
                  >
                    <RotateCcw size={16} /> Restaurar dados iniciais
                  </button>
                </div>
              </>
            )}
            <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={onImport} />
          </div>
        </div>
        <nav className="max-w-[1400px] mx-auto px-2 sm:px-4 flex gap-1 overflow-x-auto" aria-label="Módulos">
          {TABS.map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => go(t.id)}
                className={`flex items-center gap-2 whitespace-nowrap px-3 py-2.5 text-sm border-b-2 transition-colors ${
                  active ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
                aria-current={active ? 'page' : undefined}
              >
                <Icon size={16} />
                <span className="sm:hidden">{t.short}</span>
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      {saveError && (
        <div className="bg-red-500/15 border-b border-red-500/40 text-red-200 text-sm px-4 py-2 flex items-center gap-2 justify-center">
          <AlertTriangle size={16} /> {saveError}
        </div>
      )}

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 py-5">
        {tab === 'mapa' && <BoardMap />}
        {tab === 'teclas' && <KeyTester />}
        {tab === 'fluxo' && <SignalFlow onOpenTab={go} />}
        {tab === 'serial' && <SerialMonitor />}
        {tab === 'registros' && <RepairLog />}
      </main>

      <footer className="text-center text-xs text-slate-600 py-4 border-t border-bench-800">
        Bancada DK620 · dados salvos localmente no navegador · faça backup JSON regularmente
      </footer>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-lg px-4 py-2.5 text-sm shadow-2xl flex items-center gap-2 border ${
            toast.kind === 'err' ? 'bg-red-950 border-red-500/60 text-red-200' : 'bg-bench-800 border-green-500/50 text-green-200'
          }`}
        >
          {toast.msg}
          <button onClick={() => setToast(null)} aria-label="Fechar"><X size={14} /></button>
        </div>
      )}
    </div>
  );
}
