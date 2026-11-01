import { useState } from 'react';
import { Keyboard, CheckCircle2, XCircle, RotateCcw, ArrowRight, Lightbulb, Zap, CircuitBoard } from 'lucide-react';
import { KEYS, keyPosition, KEY_ROWS } from '../data/keys';
import { useDb } from '../lib/store';
import { SectionTitle } from './ui';

const LEDS = [
  { led: 'D1', r: 'R19', lado: 'esquerda' },
  { led: 'D2', r: 'R20', lado: 'esquerda' },
  { led: 'D3', r: 'R21', lado: 'esquerda' },
  { led: 'D4', r: 'R8', lado: 'direita' },
  { led: 'D5', r: 'R9', lado: 'direita' },
  { led: 'D6', r: 'R18', lado: 'direita' },
];

export default function KeyTester() {
  const { db, update } = useDb();
  const [sel, setSel] = useState('k1');
  const key = KEYS.find((k) => k.id === sel);
  const results = db.testeTeclas || {};
  const ok = KEYS.filter((k) => results[k.id] === 'ok').length;
  const fail = KEYS.filter((k) => results[k.id] === 'falha').length;

  const mark = (id, v) => update((d) => {
    d.testeTeclas = { ...(d.testeTeclas || {}) };
    if (v) d.testeTeclas[id] = v; else delete d.testeTeclas[id];
    return d;
  });

  const markAndNext = (v) => {
    mark(sel, v);
    const i = KEYS.findIndex((k) => k.id === sel);
    setSel(KEYS[(i + 1) % KEYS.length].id);
  };

  const pos = keyPosition(key);
  const lado = pos.x < 500 ? 'esquerda' : 'direita';

  return (
    <div>
      <SectionTitle
        icon={Keyboard}
        title="Testador de teclas — BD4039 REV01"
        subtitle="Toque em uma tecla da membrana para ver o guia de teste de contato, o caminho do sinal e a iluminação."
        right={
          <div className="flex items-center gap-2 text-sm">
            <span className="chip border-green-500/50 text-green-300 bg-green-500/10"><CheckCircle2 size={13} /> {ok} OK</span>
            <span className="chip border-red-500/50 text-red-300 bg-red-500/10"><XCircle size={13} /> {fail} falha</span>
            <span className="chip border-bench-600 text-slate-400">{KEYS.length - ok - fail} pendentes</span>
            {(ok || fail) > 0 && (
              <button className="btn-ghost !px-2 !py-1" onClick={() => confirm('Limpar o resultado de todas as teclas?') && update((d) => { d.testeTeclas = {}; return d; })}>
                <RotateCcw size={14} />
              </button>
            )}
          </div>
        }
      />

      <div className="panel p-3 sm:p-5 mb-4">
        <Membrane selected={sel} onSelect={setSel} results={results} />
        <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
          <span className="text-sm text-slate-400 mr-1">
            Tecla <b className="text-slate-100">{key.label}</b>{key.sub ? ` (${key.sub})` : ''} · PCB “<span className="font-mono text-amber-300">{key.pcb}</span>”:
          </span>
          <button className="btn !bg-green-500/15 border border-green-500/50 text-green-300 hover:!bg-green-500/25" onClick={() => markAndNext('ok')}>
            <CheckCircle2 size={16} /> Contato OK
          </button>
          <button className="btn-danger" onClick={() => markAndNext('falha')}>
            <XCircle size={16} /> Falhou
          </button>
          {results[sel] && <button className="btn-ghost" onClick={() => mark(sel, null)}>Limpar</button>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="panel p-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-100 mb-3">
            <Zap size={16} className="text-amber-300" /> Teste de contato da pastilha
          </h3>
          <p className="text-xs text-slate-400 mb-3">
            {KEY_ROWS[key.row]} · marcação na placa: <span className="font-mono text-amber-300">{key.pcb}</span>
          </p>
          {key.operacao && (
            <p className="text-xs text-green-200 bg-green-500/10 border border-green-500/30 rounded-md px-2.5 py-2 mb-3">
              <b>Na operação:</b> {key.operacao}
            </p>
          )}
          <ol className="space-y-2.5 text-sm text-slate-300 list-decimal pl-5 marker:text-amber-400">
            <li>Desligue o teclado e separe a manta de silicone da placa <span className="font-mono">BD4039 REV01</span>.</li>
            <li>Inspecione a trilha interdigitada (pente duplo de cobre) da tecla <b>{key.pcb}</b>: procure oxidação, sujeira ou trilha interrompida. Limpe com álcool isopropílico.</li>
            <li>Multímetro em continuidade (ou Ω). Uma ponta em cada pente da trilha <b>{key.pcb}</b>: deve indicar <b>aberto</b>.</li>
            <li>Pressione a pastilha condutiva da manta sobre a trilha (ou faça uma ponte com a ponta do dedo/borracha condutiva): deve indicar <b>continuidade</b> (poucas centenas de Ω ou menos).</li>
            <li>Sem continuidade com a manta? Meça a pastilha da manta isolada: resistência alta indica pastilha gasta — limpe ou substitua a manta.</li>
          </ol>
        </div>

        <div className="panel p-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-100 mb-3">
            <CircuitBoard size={16} className="text-amber-300" /> Caminho do sinal
          </h3>
          <div className="flex flex-col gap-1.5 text-sm">
            {[
              ['Pastilha', `Trilha “${key.pcb}” da matriz de 16 teclas`],
              ['U1', 'Controlador local TQFP de 32 pernas (varredura da matriz)'],
              ['R1 · R16 · R13 · R7', '4 trilhas de comunicação em série'],
              ['Conector 12 pinos', 'Interligação BD4039 → BD4038'],
              ['TP4 · TP6', 'Pontos de teste na placa principal (+5V em repouso)'],
              ['Processador', 'Sob o LCD, envia a tecla ao validador via U4'],
            ].map(([t, d], i, arr) => (
              <div key={t}>
                <div className="rounded-lg border border-bench-600 bg-bench-900 px-3 py-2">
                  <div className="font-mono text-amber-300 text-xs">{t}</div>
                  <div className="text-slate-300 text-xs mt-0.5">{d}</div>
                </div>
                {i < arr.length - 1 && <div className="flex justify-center text-slate-600"><ArrowRight size={14} className="rotate-90" /></div>}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-3">
            Se só esta tecla falha, o problema está na trilha/manta. Se uma linha inteira ou várias teclas falham juntas, meça U1 (+5V), as 4 trilhas e o conector de 12 pinos.
          </p>
        </div>

        <div className="panel p-4">
          <h3 className="flex items-center gap-2 font-semibold text-slate-100 mb-3">
            <Lightbulb size={16} className="text-amber-300" /> LEDs de iluminação (6 SMD)
          </h3>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {['esquerda', 'direita'].map((l) => (
              <div key={l} className={`rounded-lg border p-2 ${l === lado ? 'border-amber-400/60 bg-amber-400/5' : 'border-bench-600 bg-bench-900'}`}>
                <div className="kv-label mb-1">Borda {l}</div>
                {LEDS.filter((x) => x.lado === l).map((x) => (
                  <div key={x.led} className="flex justify-between font-mono text-xs py-0.5">
                    <span className="text-sky-300">{x.led}</span>
                    <span className="text-slate-400">{x.r}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-400 mb-2">
            A tecla <b className="text-slate-200">{key.label}</b> fica do lado <b className="text-amber-300">{lado}</b> — os LEDs mais próximos estão destacados.
          </p>
          <ol className="space-y-2 text-sm text-slate-300 list-decimal pl-5 marker:text-amber-400">
            <li>Desligado: multímetro em teste de diodo, ponta vermelha no anodo — o LED deve acender fraco.</li>
            <li>Meça cada resistor (R19, R20, R21 / R8, R9, R18): os três da mesma borda devem ter o mesmo valor.</li>
            <li>Ligado com backlight aceso: deve haver tensão sobre cada resistor. Todos os 6 apagados → verifique o driver Q3/D2 na BD4038 e o conector de 12 pinos.</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function Membrane({ selected, onSelect, results }) {
  return (
    <svg viewBox="0 0 1000 400" className="w-full h-auto max-w-4xl mx-auto block" role="group" aria-label="Membrana frontal do DK620">
      <defs>
        <linearGradient id="memb" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#facc15" />
          <stop offset="1" stopColor="#eab308" />
        </linearGradient>
      </defs>
      <path d="M8 46 Q500 -46 992 46 L992 330 Q900 392 760 392 L240 392 Q100 392 8 330 Z" fill="#111" stroke="#333" strokeWidth="3" />
      <path d="M26 58 Q500 -26 974 58 L974 322 Q890 374 756 374 L244 374 Q110 374 26 322 Z" fill="url(#memb)" />
      <text x="500" y="300" textAnchor="middle" fontSize="18" fontWeight="800" fill="#111" letterSpacing="4">PRODATA · DK620</text>
      {KEYS.map((k) => {
        const p = keyPosition(k);
        const r = results[k.id];
        const isSel = selected === k.id;
        const base = k.color === 'red' ? '#dc2626' : k.color === 'green' ? '#16a34a' : '#18181b';
        const w = 104;
        const h = 78;
        return (
          <g
            key={k.id}
            role="button"
            tabIndex={0}
            aria-label={`Tecla ${k.label} ${k.sub}`}
            aria-pressed={isSel}
            onClick={() => onSelect(k.id)}
            onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect(k.id))}
            className="cursor-pointer focus:outline-none"
          >
            <rect x={p.x - w / 2} y={p.y - h / 2 + 4} width={w} height={h} rx="16" fill="#000" opacity="0.35" />
            <rect
              x={p.x - w / 2} y={p.y - h / 2} width={w} height={h} rx="16" fill={base}
              stroke={isSel ? '#38bdf8' : r === 'ok' ? '#22c55e' : r === 'falha' ? '#ef4444' : '#000'}
              strokeWidth={isSel ? 6 : r ? 5 : 2}
            />
            <text x={p.x} y={k.label.length > 3 ? p.y - 4 : p.y + 4} textAnchor="middle" fontSize={k.label.length > 3 ? 17 : 30} fontWeight="800" fill={k.color ? '#fff' : '#facc15'}>
              {k.label}
            </text>
            {k.sub && (
              <text x={p.x} y={p.y + (k.label.length > 3 ? 22 : 28)} textAnchor="middle" fontSize={k.func ? 20 : 14} fontWeight="700" fill={k.color ? '#fff' : '#fde68a'} opacity="0.9">
                {k.sub}
              </text>
            )}
            {r && (
              <circle cx={p.x + w / 2 - 10} cy={p.y - h / 2 + 10} r="9" fill={r === 'ok' ? '#22c55e' : '#ef4444'} stroke="#000" strokeWidth="2" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
