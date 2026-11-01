import { useState } from 'react';
import { Workflow, ChevronRight, ChevronDown, Stethoscope, CheckSquare, Square, ArrowRight, Monitor } from 'lucide-react';
import { SUBSYSTEMS, SYMPTOMS, LCD_MESSAGES } from '../data/diagnostics';
import { SectionTitle } from './ui';

const GROUPS = [
  { id: 'fonte', label: 'Entrada 24V / Fonte', chains: ['fonte'] },
  { id: 'rs232', label: 'Serial RS-232 (U4)', chains: ['tx', 'rx'] },
  { id: 'backlight', label: 'Driver de Backlight', chains: ['backlight'] },
  { id: 'teclas', label: 'Varredura de Teclas', chains: ['teclas'] },
];

const groupOf = (chainId) => GROUPS.find((g) => g.chains.includes(chainId))?.id ?? 'fonte';

export default function SignalFlow({ onOpenTab }) {
  const [group, setGroup] = useState('fonte');
  const [block, setBlock] = useState(null);
  const [symptom, setSymptom] = useState(null);
  const [done, setDone] = useState({});

  const g = GROUPS.find((x) => x.id === group);
  const chains = SUBSYSTEMS.filter((s) => g.chains.includes(s.id));
  const sym = SYMPTOMS.find((s) => s.id === symptom);

  return (
    <div className="space-y-6">
      <section>
        <SectionTitle
          icon={Workflow}
          title="Fluxo de sinal por subsistema"
          subtitle="Toque em cada bloco para ver o que medir. Siga a cadeia da esquerda para a direita até achar onde o sinal some."
        />
        <div className="flex flex-wrap gap-2 mb-4">
          {GROUPS.map((x) => (
            <button
              key={x.id}
              onClick={() => { setGroup(x.id); setBlock(null); }}
              className={`rounded-full px-3 py-1.5 text-sm border transition-colors ${
                group === x.id ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-bench-600 text-slate-300 hover:bg-bench-800'
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {chains.map((c) => (
            <div key={c.id} className="panel p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: c.cor }}>
                <span className="inline-block w-3 h-3 rounded-full" style={{ background: c.cor }} /> {c.titulo}
              </h3>
              <div className="flex flex-col md:flex-row md:flex-wrap md:items-stretch gap-1">
                {c.blocos.map((b, i) => {
                  const active = block?.id === b.id;
                  return (
                    <div key={b.id} className="flex flex-col md:flex-row items-center gap-1">
                      <button
                        onClick={() => setBlock(active ? null : { ...b, cor: c.cor })}
                        className={`w-full md:w-auto md:min-w-[120px] md:max-w-[170px] rounded-lg border px-3 py-2 text-left transition-colors ${
                          active ? 'bg-bench-700' : 'bg-bench-900 hover:bg-bench-800'
                        }`}
                        style={{ borderColor: active ? c.cor : '#334052' }}
                        aria-expanded={active}
                      >
                        <div className="font-mono text-sm font-semibold text-slate-100">{b.t}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{b.medir}</div>
                      </button>
                      {i < c.blocos.length - 1 && (
                        <svg width="28" height="14" className="rotate-90 md:rotate-0 shrink-0" aria-hidden>
                          <line x1="0" y1="7" x2="20" y2="7" stroke={c.cor} strokeWidth="2" className="flow-dash" />
                          <path d="M18 2 L27 7 L18 12 Z" fill={c.cor} />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
              {block && c.blocos.some((b) => b.id === block.id) && (
                <div className="mt-3 rounded-lg border p-3 bg-bench-900" style={{ borderColor: block.cor }}>
                  <div className="font-mono font-semibold text-slate-100">{block.t}</div>
                  <p className="text-sm text-slate-300 mt-1">{block.d}</p>
                  <p className="text-sm mt-2"><span className="kv-label mr-2">Medir</span><span className="font-mono text-green-300">{block.medir}</span></p>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          icon={Monitor}
          title="Mensagens do LCD em operação normal"
          subtitle="Referência registrada com o teclado instalado no ônibus (sobre o OM-7000). Compare com o que o teclado em teste mostra."
        />
        <div className="grid gap-3 md:grid-cols-2">
          {LCD_MESSAGES.map((m) => (
            <div key={m.linhas[0]} className="panel p-4 flex flex-col sm:flex-row gap-4">
              <div className="shrink-0 self-start rounded-lg bg-[#1d3fbf] border-4 border-[#0b1636] px-3 py-2 font-mono text-[15px] leading-6 text-[#dfe8ff] tracking-wider w-full sm:w-[14.5rem]" aria-label={`LCD: ${m.linhas.join(' / ')}`}>
                <div className="whitespace-pre">{m.linhas[0].padEnd(16, ' ')}</div>
                <div className="whitespace-pre">{(m.linhas[1] || '').padEnd(16, ' ')}</div>
              </div>
              <div className="text-sm min-w-0">
                <p className="text-slate-300">{m.quando}</p>
                <p className={`mt-1.5 ${m.tipo === 'ok' ? 'text-green-300' : 'text-sky-300'}`}>{m.significa}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionTitle
          icon={Stethoscope}
          title="Assistente de resolução de problemas"
          subtitle="Escolha o sintoma. Os testes aparecem na ordem certa — marque cada um conforme avança."
        />
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 mb-4">
          {SYMPTOMS.map((s) => (
            <button
              key={s.id}
              onClick={() => { setSymptom(symptom === s.id ? null : s.id); setDone({}); }}
              className={`rounded-lg border p-3 text-left transition-colors ${
                symptom === s.id ? 'border-amber-400 bg-amber-400/10' : 'border-bench-600 bg-bench-850 hover:bg-bench-800'
              }`}
            >
              <div className={`font-semibold text-sm flex items-center justify-between ${symptom === s.id ? 'text-amber-300' : 'text-slate-100'}`}>
                {s.titulo} {symptom === s.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
              </div>
              <div className="text-xs text-slate-400 mt-1">{s.resumo}</div>
            </button>
          ))}
        </div>

        {sym && (
          <div className="panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className="font-semibold text-slate-100">{sym.titulo} — sequência de testes</h3>
              <button className="btn-ghost text-xs" onClick={() => { setGroup(groupOf(sym.subsistema)); setBlock(null); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>
                Ver fluxo de sinal <ArrowRight size={14} />
              </button>
            </div>
            <ol className="space-y-2">
              {sym.passos.map((p, i) => (
                <li key={i}>
                  <button
                    onClick={() => setDone((d) => ({ ...d, [i]: !d[i] }))}
                    className={`w-full text-left rounded-lg border p-3 flex gap-3 transition-colors ${
                      done[i] ? 'border-green-500/40 bg-green-500/5' : 'border-bench-600 bg-bench-900 hover:bg-bench-800'
                    }`}
                  >
                    <span className="mt-0.5 shrink-0 text-amber-300">{done[i] ? <CheckSquare size={18} className="text-green-400" /> : <Square size={18} />}</span>
                    <span className="flex-1 min-w-0">
                      <span className={`block text-sm ${done[i] ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                        <b className="text-amber-300 mr-1">{i + 1}.</b>{p.t}
                      </span>
                      <span className="mt-1.5 flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs">
                        <span><span className="text-slate-500">Esperado: </span><span className="font-mono text-green-300">{p.esperado}</span></span>
                        <span><span className="text-slate-500">Se não: </span><span className="text-red-300">{p.se}</span></span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="btn-ghost" onClick={() => onOpenTab('mapa')}>Abrir mapa das placas</button>
              {sym.id === 'serial' && <button className="btn-ghost" onClick={() => onOpenTab('serial')}>Abrir simulador serial</button>}
              {sym.id === 'teclas' && <button className="btn-ghost" onClick={() => onOpenTab('teclas')}>Abrir testador de teclas</button>}
              <button className="btn-ghost" onClick={() => onOpenTab('registros')}>Registrar reparo</button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
