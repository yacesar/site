import { useState } from 'react';
import {
  ClipboardList, Plus, Save, Trash2, Pencil, ChevronDown, ChevronRight, AlertTriangle, CheckCircle2, Gauge, ListChecks, X, Star,
} from 'lucide-react';
import { useDb } from '../lib/store';
import { U4_FIELDS, TP_FIELDS, REF_LABELS, compareAll, compareValue, num } from '../lib/compare';
import { SectionTitle, Field } from './ui';

const SUBTABS = [
  { id: 'registros', label: 'Registros de reparo', icon: ClipboardList },
  { id: 'referencia', label: 'Referência (teclado bom)', icon: Gauge },
  { id: 'pendencias', label: 'O que ainda falta levantar', icon: ListChecks },
];

const today = () => new Date().toISOString().slice(0, 10);

const emptyRecord = () => ({
  id: '',
  data: today(),
  numeroSerie: '',
  carroOrigem: '',
  sintoma: '',
  medicoesU4: Object.fromEntries(U4_FIELDS.map((f) => [f.key, ''])),
  medicoesTP: Object.fromEntries(TP_FIELDS.map((f) => [f.key, ''])),
  oQueFoiFeito: '',
  pecasUsadas: '',
  resultado: '',
});

function nextId(list) {
  const max = list.reduce((m, r) => Math.max(m, parseInt(String(r.id).replace(/\D/g, ''), 10) || 0), 0);
  return `REP-${String(max + 1).padStart(3, '0')}`;
}

export default function RepairLog() {
  const { db } = useDb();
  const [sub, setSub] = useState('registros');
  const pend = db.pendenciasLevantamento.filter((p) => !p.concluido).length;

  return (
    <div>
      <SectionTitle
        icon={ClipboardList}
        title="Registros de reparo, referência e pendências"
        subtitle="Tudo fica salvo neste navegador. Use o menu Backup para exportar/importar o JSON."
      />
      <div className="flex flex-wrap gap-2 mb-4">
        {SUBTABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setSub(t.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                sub === t.id ? 'border-amber-400 bg-amber-400/10 text-amber-300' : 'border-bench-600 text-slate-300 hover:bg-bench-800'
              }`}
            >
              <Icon size={16} /> {t.label}
              {t.id === 'registros' && <span className="chip border-bench-600 text-slate-400">{db.registrosReparo.length}</span>}
              {t.id === 'pendencias' && pend > 0 && <span className="chip border-amber-400/50 text-amber-300">{pend}</span>}
            </button>
          );
        })}
      </div>
      {sub === 'registros' && <Records />}
      {sub === 'referencia' && <Reference />}
      {sub === 'pendencias' && <Checklist />}
    </div>
  );
}

/* ---------------------------- Registros ---------------------------- */

function Records() {
  const { db, update } = useDb();
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState(db.registrosReparo[0]?.id ?? null);

  const save = (rec) => {
    update((d) => {
      const i = d.registrosReparo.findIndex((r) => r.id === rec.id);
      if (i >= 0) d.registrosReparo[i] = rec;
      else d.registrosReparo.unshift(rec);
      return d;
    });
    setOpen(rec.id);
    setEditing(null);
  };

  const sorted = [...db.registrosReparo].sort((a, b) => String(b.data).localeCompare(String(a.data)));

  if (editing) return <RecordForm initial={editing} onCancel={() => setEditing(null)} onSave={save} />;

  return (
    <div className="space-y-3">
      <button className="btn-primary" onClick={() => setEditing({ ...emptyRecord(), id: nextId(db.registrosReparo) })}>
        <Plus size={16} /> Novo registro de reparo
      </button>
      {sorted.length === 0 && <div className="panel p-6 text-center text-slate-400">Nenhum registro ainda.</div>}
      {sorted.map((r) => {
        const isOpen = open === r.id;
        const { rows, regras } = compareAll(r, db.referenciaTecladoBom);
        const anomalias = rows.filter((x) => x.level === 'bad').length + regras.filter((x) => x.level === 'bad').length;
        return (
          <div key={r.id} className="panel overflow-hidden">
            <button className="w-full text-left p-4 flex gap-3 items-start hover:bg-bench-800/60" onClick={() => setOpen(isOpen ? null : r.id)} aria-expanded={isOpen}>
              <span className="mt-0.5 text-slate-500">{isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}</span>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-amber-300 font-semibold">{r.id}</span>
                  <span className="text-sm text-slate-400">{formatDate(r.data)}</span>
                  {r.carroOrigem && <span className="chip border-bench-600 text-slate-300">{r.carroOrigem}</span>}
                  {anomalias > 0 ? (
                    <span className="chip border-red-500/50 text-red-300 bg-red-500/10"><AlertTriangle size={12} /> {anomalias} anomalia(s)</span>
                  ) : rows.some((x) => x.level) ? (
                    <span className="chip border-green-500/50 text-green-300 bg-green-500/10"><CheckCircle2 size={12} /> medições ok</span>
                  ) : null}
                </div>
                <p className="text-sm text-slate-200 mt-1 line-clamp-2">{r.sintoma || '—'}</p>
                {r.resultado && <p className="text-xs text-green-300/90 mt-1 line-clamp-1">Resultado: {r.resultado}</p>}
              </div>
            </button>
            {isOpen && (
              <div className="border-t border-bench-700 p-4 space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Info label="Nº de série ou etiqueta" mono>{r.numeroSerie}</Info>
                  <Info label="Carro de origem">{r.carroOrigem}</Info>
                  <Info label="Sintoma" className="md:col-span-2">{r.sintoma}</Info>
                  <Info label="O que foi feito" className="md:col-span-2">{r.oQueFoiFeito}</Info>
                  <Info label="Peças usadas">{r.pecasUsadas}</Info>
                  <Info label="Resultado">{r.resultado}</Info>
                </div>
                <Comparison record={r} reference={db.referenciaTecladoBom} />
                <div className="flex flex-wrap gap-2">
                  <button className="btn-ghost" onClick={() => setEditing(structuredClone({ ...emptyRecord(), ...r, medicoesU4: { ...emptyRecord().medicoesU4, ...r.medicoesU4 }, medicoesTP: { ...emptyRecord().medicoesTP, ...r.medicoesTP } }))}>
                    <Pencil size={15} /> Editar
                  </button>
                  <button
                    className="btn-ghost"
                    title="Copia as medições preenchidas deste registro para a tabela de referência"
                    onClick={() => {
                      if (!confirm('Usar as medições deste registro como referência de teclado bom? Só os campos preenchidos serão copiados.')) return;
                      update((d) => {
                        [...U4_FIELDS.map((f) => [f, r.medicoesU4]), ...TP_FIELDS.map((f) => [f, r.medicoesTP])].forEach(([f, src]) => {
                          const n = num(src?.[f.key]);
                          if (n !== null) d.referenciaTecladoBom[f.ref] = n;
                        });
                        return d;
                      });
                    }}
                  >
                    <Star size={15} /> Usar como referência
                  </button>
                  <button
                    className="btn-danger"
                    onClick={() => confirm(`Excluir o registro ${r.id}?`) && update((d) => { d.registrosReparo = d.registrosReparo.filter((x) => x.id !== r.id); return d; })}
                  >
                    <Trash2 size={15} /> Excluir
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Info({ label, children, mono, className = '' }) {
  return (
    <div className={className}>
      <div className="kv-label mb-0.5">{label}</div>
      <div className={`text-sm text-slate-200 whitespace-pre-wrap break-words ${mono ? 'font-mono' : ''}`}>{children || '—'}</div>
    </div>
  );
}

function formatDate(iso) {
  if (!iso) return '—';
  const [y, m, d] = String(iso).split('-');
  return d ? `${d}/${m}/${y}` : iso;
}

function RecordForm({ initial, onSave, onCancel }) {
  const { db } = useDb();
  const [r, setR] = useState(initial);
  const set = (k, v) => setR((p) => ({ ...p, [k]: v }));
  const setM = (grp, k, v) => setR((p) => ({ ...p, [grp]: { ...p[grp], [k]: v } }));
  const isNew = !db.registrosReparo.some((x) => x.id === initial.id);

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(r);
      }}
    >
      <div className="panel p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-slate-100">{isNew ? 'Novo registro de reparo' : 'Editar registro'} <span className="font-mono text-amber-300 ml-1">{r.id}</span></h3>
          <button type="button" className="btn-ghost !px-2" onClick={onCancel} aria-label="Cancelar"><X size={16} /></button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Data"><input type="date" value={r.data} onChange={(e) => set('data', e.target.value)} required /></Field>
          <Field label="Nº de série ou etiqueta" className="lg:col-span-2"><input className="font-mono" value={r.numeroSerie} onChange={(e) => set('numeroSerie', e.target.value)} /></Field>
          <Field label="Carro de origem"><input value={r.carroOrigem} onChange={(e) => set('carroOrigem', e.target.value)} placeholder="Ex.: carro 1234" /></Field>
          <Field label="Sintoma" className="sm:col-span-2 lg:col-span-4">
            <textarea rows={2} value={r.sintoma} onChange={(e) => set('sintoma', e.target.value)} placeholder="O que o teclado apresenta" />
          </Field>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="panel p-4">
          <h3 className="font-semibold text-slate-100">Medições no U4</h3>
          <p className="text-xs text-slate-400 mb-3">Teclado ligado, ponta preta fixa no Pino 15 (GND).</p>
          <MeasureGrid fields={U4_FIELDS} values={r.medicoesU4} reference={db.referenciaTecladoBom} onChange={(k, v) => setM('medicoesU4', k, v)} />
        </div>
        <div className="panel p-4">
          <h3 className="font-semibold text-slate-100">Medições nos pontos de teste</h3>
          <p className="text-xs text-slate-400 mb-3">Ponta preta no GND. Valores em volts.</p>
          <MeasureGrid fields={TP_FIELDS} values={r.medicoesTP} reference={db.referenciaTecladoBom} onChange={(k, v) => setM('medicoesTP', k, v)} />
        </div>
      </div>

      <Comparison record={r} reference={db.referenciaTecladoBom} live />

      <div className="panel p-4 grid gap-3 md:grid-cols-2">
        <Field label="O que foi feito" className="md:col-span-2"><textarea rows={3} value={r.oQueFoiFeito} onChange={(e) => set('oQueFoiFeito', e.target.value)} /></Field>
        <Field label="Peças usadas"><input value={r.pecasUsadas} onChange={(e) => set('pecasUsadas', e.target.value)} /></Field>
        <Field label="Resultado"><input value={r.resultado} onChange={(e) => set('resultado', e.target.value)} /></Field>
      </div>

      <div className="flex gap-2 justify-end sticky bottom-0 -mx-4 px-4 py-3 bg-bench-950/95 backdrop-blur border-t border-bench-700">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn-primary"><Save size={16} /> Salvar registro</button>
      </div>
    </form>
  );
}

const LEVEL = {
  ok: { cls: 'border-green-500/60 focus:ring-green-400/50', txt: 'text-green-300' },
  warn: { cls: 'border-amber-400/70 focus:ring-amber-400/50', txt: 'text-amber-300' },
  bad: { cls: 'border-red-500/80 bg-red-500/10 focus:ring-red-400/50', txt: 'text-red-300' },
};

function MeasureGrid({ fields, values, reference, onChange }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {fields.map((f) => {
        const c = compareValue(values[f.key], reference[f.ref]);
        return (
          <div key={f.key} className="flex flex-col gap-1">
            <label htmlFor={`m-${f.key}`}>{f.label}</label>
            <input
              id={`m-${f.key}`}
              inputMode="decimal"
              className={`font-mono ${c ? LEVEL[c.level].cls : ''}`}
              value={values[f.key] ?? ''}
              onChange={(e) => onChange(f.key, e.target.value)}
              placeholder={reference[f.ref] !== undefined ? String(reference[f.ref]) : ''}
            />
            <span className={`text-[11px] ${c ? LEVEL[c.level].txt : 'text-slate-500'}`}>
              {c ? `${c.diff >= 0 ? '+' : ''}${c.diff.toFixed(2)} V vs ref.` : `${f.hint} · ref ${reference[f.ref] ?? '—'} V`}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Comparison({ record, reference, live }) {
  const { rows, regras } = compareAll(record, reference);
  const measured = rows.filter((x) => x.level);
  if (!measured.length && !regras.length) {
    return live ? (
      <div className="panel p-4 text-sm text-slate-400">Digite as tensões medidas — a comparação com o teclado bom aparece aqui automaticamente.</div>
    ) : null;
  }
  const bad = measured.filter((x) => x.level !== 'ok');
  return (
    <div className="panel p-4 space-y-3">
      <h3 className="font-semibold text-slate-100 flex items-center gap-2">
        <Gauge size={16} className="text-amber-300" /> Comparação com o teclado bom
      </h3>
      {regras.length > 0 && (
        <ul className="space-y-2">
          {regras.map((g, i) => (
            <li key={i} className={`rounded-lg border p-3 text-sm flex gap-2 ${g.level === 'bad' ? 'border-red-500/50 bg-red-500/10 text-red-200' : 'border-amber-400/50 bg-amber-400/10 text-amber-200'}`}>
              <AlertTriangle size={16} className="shrink-0 mt-0.5" /> {g.msg}
            </li>
          ))}
        </ul>
      )}
      {regras.length === 0 && bad.length === 0 && (
        <div className="rounded-lg border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-200 flex gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" /> Todas as medições preenchidas estão dentro da tolerância da referência.
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 text-xs uppercase tracking-wider">
              <th className="py-1.5 pr-3 font-semibold">Ponto</th>
              <th className="py-1.5 pr-3 font-semibold text-right">Medido</th>
              <th className="py-1.5 pr-3 font-semibold text-right">Referência</th>
              <th className="py-1.5 pr-3 font-semibold text-right">Diferença</th>
              <th className="py-1.5 font-semibold">Situação</th>
            </tr>
          </thead>
          <tbody className="font-mono">
            {measured.map((x) => (
              <tr key={x.key} className="border-t border-bench-700">
                <td className="py-1.5 pr-3 font-sans text-slate-300">{x.grupo === 'U4' ? `U4 ${x.label.replace(' (V)', '')}` : x.label.replace(' (V)', '')}</td>
                <td className="py-1.5 pr-3 text-right text-slate-100">{x.m.toFixed(2)}</td>
                <td className="py-1.5 pr-3 text-right text-slate-400">{x.r.toFixed(2)}</td>
                <td className={`py-1.5 pr-3 text-right ${LEVEL[x.level].txt}`}>{x.diff >= 0 ? '+' : ''}{x.diff.toFixed(2)}</td>
                <td className={`py-1.5 font-sans text-xs ${LEVEL[x.level].txt}`}>
                  {x.level === 'ok' ? '🟢 normal' : x.level === 'warn' ? '🟡 atenção' : '🔴 anomalia'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-slate-500">Tolerância: ±10% da referência (mínimo ±0,5 V). Até o dobro disso = atenção; acima = anomalia.</p>
    </div>
  );
}

/* ---------------------------- Referência ---------------------------- */

function Reference() {
  const { db, update } = useDb();
  const ref = db.referenciaTecladoBom;
  const [draft, setDraft] = useState(() => Object.fromEntries(Object.entries(ref).map(([k, v]) => [k, String(v)])));
  const dirty = Object.keys(draft).some((k) => num(draft[k]) !== num(ref[k]));

  const groups = [
    { t: 'U4 (ST232C) — ponta preta no Pino 15', keys: U4_FIELDS.map((f) => f.ref) },
    { t: 'Pontos de teste TP1 a TP8', keys: TP_FIELDS.map((f) => f.ref) },
  ];

  return (
    <div className="space-y-4">
      <div className="panel p-4 text-sm text-slate-300 flex gap-2">
        <Gauge size={16} className="text-amber-300 shrink-0 mt-0.5" />
        <span>Tensões de um DK620 100% funcional. Todos os registros de reparo são comparados com esta tabela. Meça um teclado bom na bancada e grave os valores reais aqui.</span>
      </div>
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          update((d) => {
            Object.entries(draft).forEach(([k, v]) => {
              const n = num(v);
              if (n !== null) d.referenciaTecladoBom[k] = n;
            });
            return d;
          });
        }}
      >
        {groups.map((g) => (
          <div key={g.t} className="panel p-4">
            <h3 className="font-semibold text-slate-100 mb-3">{g.t}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {g.keys.map((k) => (
                <Field key={k} label={REF_LABELS[k] || k}>
                  <input
                    inputMode="decimal"
                    className={`font-mono ${num(draft[k]) === null ? 'border-red-500' : ''}`}
                    value={draft[k] ?? ''}
                    onChange={(e) => setDraft((p) => ({ ...p, [k]: e.target.value }))}
                  />
                </Field>
              ))}
            </div>
          </div>
        ))}
        <div className="flex gap-2 justify-end">
          <button type="button" className="btn-ghost" disabled={!dirty} onClick={() => setDraft(Object.fromEntries(Object.entries(ref).map(([k, v]) => [k, String(v)])))}>
            Descartar
          </button>
          <button type="submit" className="btn-primary" disabled={!dirty}><Save size={16} /> Salvar referência</button>
        </div>
      </form>
    </div>
  );
}

/* ---------------------------- Pendências ---------------------------- */

function Checklist() {
  const { db, update } = useDb();
  const [novo, setNovo] = useState('');
  const items = db.pendenciasLevantamento;
  const done = items.filter((i) => i.concluido).length;

  const patch = (id, fields) => update((d) => {
    d.pendenciasLevantamento = d.pendenciasLevantamento.map((p) => (p.id === id ? { ...p, ...fields } : p));
    return d;
  });

  return (
    <div className="space-y-3">
      <div className="panel p-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-slate-300">{done} de {items.length} levantados</span>
          <span className="font-mono text-amber-300">{items.length ? Math.round((done / items.length) * 100) : 0}%</span>
        </div>
        <div className="h-2 rounded-full bg-bench-700 overflow-hidden">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${items.length ? (done / items.length) * 100 : 0}%` }} />
        </div>
      </div>

      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!novo.trim()) return;
          update((d) => {
            const id = d.pendenciasLevantamento.reduce((m, p) => Math.max(m, Number(p.id) || 0), 0) + 1;
            d.pendenciasLevantamento.push({ id, item: novo.trim(), concluido: false, notas: '' });
            return d;
          });
          setNovo('');
        }}
      >
        <input className="flex-1 min-w-0" placeholder="Nova pendência (ex.: valor do C17)" value={novo} onChange={(e) => setNovo(e.target.value)} />
        <button className="btn-primary" type="submit"><Plus size={16} /> <span className="hidden sm:inline">Adicionar</span></button>
      </form>

      {[...items].sort((a, b) => Number(a.concluido) - Number(b.concluido)).map((p) => (
        <div key={p.id} className={`panel p-4 ${p.concluido ? 'opacity-80' : ''}`}>
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              className="mt-1 !w-5 !h-5 shrink-0"
              checked={p.concluido}
              onChange={(e) => patch(p.id, { concluido: e.target.checked })}
              aria-label={`Concluído: ${p.item}`}
            />
            <div className="flex-1 min-w-0 space-y-2">
              <div className={`text-sm font-medium ${p.concluido ? 'text-green-300' : 'text-slate-100'}`}>
                {p.concluido && <CheckCircle2 size={14} className="inline mr-1 -mt-0.5" />}
                {p.item}
              </div>
              <textarea
                rows={2}
                className="w-full text-sm"
                placeholder="Notas / códigos levantados na bancada"
                value={p.notas}
                onChange={(e) => patch(p.id, { notas: e.target.value })}
              />
            </div>
            <button
              className="text-slate-500 hover:text-red-400 p-1"
              aria-label="Excluir pendência"
              onClick={() => confirm(`Excluir “${p.item}”?`) && update((d) => { d.pendenciasLevantamento = d.pendenciasLevantamento.filter((x) => x.id !== p.id); return d; })}
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
