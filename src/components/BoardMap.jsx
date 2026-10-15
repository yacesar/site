import { useMemo, useRef, useState } from 'react';
import { Cpu, ImagePlus, Trash2, Move, RotateCcw, Search, Eye, EyeOff, Info } from 'lucide-react';
import { BOARDS, STATUS } from '../data/boardMaps';
import { useDb, readImageFile } from '../lib/store';
import { SectionTitle, KV, StatusPicker } from './ui';

const VIEWS = [
  { id: 'bd4038', label: 'Placa Principal', sub: 'BD4038 REV00' },
  { id: 'bd4039', label: 'Placa de Teclas', sub: 'BD4039 REV01' },
  { id: 'borne', label: 'Borne e Chicote', sub: '4 fios · 24V / 1,0A' },
];

export function defaultStatus(hs, componentes) {
  if (hs.seedRef) {
    const c = componentes.find((x) => x.id === hs.seedRef);
    if (c?.statusPadrao && STATUS[c.statusPadrao]) return c.statusPadrao;
  }
  return 'pendente';
}

export function resolveInfo(hs, componentes) {
  if (!hs.seedRef) return hs;
  const c = componentes.find((x) => x.id === hs.seedRef);
  if (!c) return hs;
  return { ...hs, codigo: c.nome, especificacao: c.especificacao, funcao: c.funcao, ondeMedir: c.ondeMedir, valorEsperado: c.valorEsperado };
}

export default function BoardMap() {
  const { db, update } = useDb();
  const [view, setView] = useState('bd4038');
  const [selectedId, setSelectedId] = useState('U4');
  const [adjust, setAdjust] = useState(false);
  const [showSchematic, setShowSchematic] = useState(true);
  const [photoOpacity, setPhotoOpacity] = useState(1);
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState(false);
  const fileRef = useRef(null);

  const board = BOARDS[view];
  const photo = db.fotos?.[view];
  const posicoes = db.posicoes?.[view] || {};

  const hotspots = useMemo(
    () => board.hotspots.map((h) => ({ ...h, ...(posicoes[h.id] || {}) })),
    [board, posicoes],
  );

  const statusOf = (hs) => db.statusComponentes[`${view}:${hs.id}`] || defaultStatus(hs, db.componentesBD4038);
  const selected = hotspots.find((h) => h.id === selectedId);
  const info = selected ? resolveInfo(selected, db.componentesBD4038) : null;
  const key = selected ? `${view}:${selected.id}` : null;

  const counts = useMemo(() => {
    const c = { normal: 0, pendente: 0, suspeito: 0, oxidacao: 0 };
    hotspots.forEach((h) => { c[db.statusComponentes[`${view}:${h.id}`] || defaultStatus(h, db.componentesBD4038)]++; });
    return c;
  }, [hotspots, db.statusComponentes, db.componentesBD4038, view]);

  const switchView = (id) => {
    setView(id);
    setSelectedId(BOARDS[id].hotspots.find((h) => h.kind !== 'area')?.id ?? null);
    setAdjust(false);
  };

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const img = await readImageFile(file);
      update((d) => { d.fotos[view] = img; return d; });
      setShowSchematic(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setBusy(false);
    }
  };

  const filtered = hotspots.filter((h) => {
    if (!query) return true;
    const i = resolveInfo(h, db.componentesBD4038);
    return `${h.label} ${i.codigo} ${i.funcao}`.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div>
      <SectionTitle
        icon={Cpu}
        title="Mapa interativo das placas"
        subtitle="Toque em um componente, ponto de teste ou pino para ver a ficha de medição e marcar o estado deste teclado."
      />

      <div className="flex flex-wrap gap-2 mb-4" role="tablist">
        {VIEWS.map((v) => (
          <button
            key={v.id}
            role="tab"
            aria-selected={view === v.id}
            onClick={() => switchView(v.id)}
            className={`rounded-lg border px-3 py-2 text-left transition-colors ${
              view === v.id ? 'border-amber-400 bg-amber-400/10' : 'border-bench-600 bg-bench-850 hover:bg-bench-800'
            }`}
          >
            <div className={`text-sm font-semibold ${view === v.id ? 'text-amber-300' : 'text-slate-200'}`}>{v.label}</div>
            <div className="text-xs font-mono text-slate-400">{v.sub}</div>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-3 min-w-0">
          <div className="panel p-2 flex flex-wrap items-center gap-2">
            <button className="btn-ghost" onClick={() => fileRef.current?.click()} disabled={busy}>
              <ImagePlus size={16} /> {photo ? 'Trocar foto' : 'Carregar foto'}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPhoto} />
            {photo && (
              <>
                <button className="btn-ghost" onClick={() => setShowSchematic((v) => !v)}>
                  {showSchematic ? <EyeOff size={16} /> : <Eye size={16} />} {showSchematic ? 'Ocultar diagrama' : 'Mostrar diagrama'}
                </button>
                <label className="flex items-center gap-2 px-2">
                  Foto
                  <input type="range" min="0.2" max="1" step="0.05" value={photoOpacity} onChange={(e) => setPhotoOpacity(+e.target.value)} className="w-24 p-0 border-0 bg-transparent accent-amber-400" />
                </label>
                <button
                  className="btn-danger"
                  onClick={() => confirm('Remover a foto desta placa?') && update((d) => { d.fotos[view] = null; return d; })}
                >
                  <Trash2 size={16} /> <span className="hidden sm:inline">Remover foto</span>
                </button>
              </>
            )}
            <div className="flex-1" />
            <button className={adjust ? 'btn-primary' : 'btn-ghost'} onClick={() => setAdjust((v) => !v)} aria-pressed={adjust}>
              <Move size={16} /> {adjust ? 'Concluir ajuste' : 'Ajustar hotspots'}
            </button>
            {Object.keys(posicoes).length > 0 && (
              <button
                className="btn-ghost"
                title="Voltar às posições do diagrama"
                onClick={() => confirm('Voltar todos os hotspots desta placa às posições originais?') && update((d) => { d.posicoes[view] = {}; return d; })}
              >
                <RotateCcw size={16} />
              </button>
            )}
          </div>

          {adjust && (
            <div className="text-xs text-amber-200 bg-amber-400/10 border border-amber-400/30 rounded-lg px-3 py-2 flex gap-2">
              <Info size={14} className="shrink-0 mt-0.5" />
              Arraste cada marcador até o componente correspondente na foto. As posições ficam salvas para esta placa.
            </div>
          )}

          <div className="panel overflow-hidden">
            <BoardSvg
              board={board}
              hotspots={hotspots}
              photo={photo}
              photoOpacity={photoOpacity}
              showSchematic={showSchematic || !photo}
              selectedId={selectedId}
              onSelect={setSelectedId}
              statusOf={statusOf}
              adjust={adjust}
              onMove={(id, x, y) => update((d) => { d.posicoes[view] = { ...(d.posicoes[view] || {}), [id]: { x, y } }; return d; })}
            />
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            {Object.entries(STATUS).map(([k, s]) => (
              <span key={k} className="chip border-bench-600 bg-bench-850 text-slate-300">
                <span aria-hidden>{s.dot}</span> {s.label}: <b className="text-slate-100">{counts[k]}</b>
              </span>
            ))}
          </div>
          <p className="text-xs text-slate-500">
            Diagrama esquemático com posições aproximadas — carregue a foto real da placa e use “Ajustar hotspots” para alinhar.
          </p>
        </div>

        <aside className="space-y-3 min-w-0">
          {info ? (
            <div className="panel p-4 space-y-4 lg:sticky lg:top-32">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="kv-label">{board.codigo}</div>
                  <h3 className="text-base font-semibold text-slate-100 mt-0.5">{info.codigo}</h3>
                </div>
                <span className={`chip border-current ${STATUS[statusOf(selected)].text}`}>
                  {STATUS[statusOf(selected)].dot} {selected.label}
                </span>
              </div>
              <KV label="Código">{selected.label}</KV>
              <KV label="Valor / Especificação">{info.especificacao}</KV>
              <KV label="O que ele faz">{info.funcao}</KV>
              <KV label="Onde medir">{info.ondeMedir}</KV>
              <div className="rounded-lg bg-green-500/5 border border-green-500/30 p-3">
                <KV label="Valor esperado" mono>{info.valorEsperado}</KV>
              </div>
              <div>
                <div className="kv-label mb-2">Estado neste teclado</div>
                <StatusPicker
                  value={statusOf(selected)}
                  onChange={(s) => update((d) => { d.statusComponentes[key] = s; return d; })}
                />
              </div>
              <div>
                <div className="kv-label mb-1">Notas de bancada</div>
                <textarea
                  rows={3}
                  className="w-full text-sm"
                  placeholder="Ex.: solda fria no pino 14, crosta verde no terminal..."
                  value={db.notasComponentes[key] || ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    update((d) => { d.notasComponentes[key] = v; return d; });
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="panel p-4 text-sm text-slate-400">Selecione um componente no diagrama.</div>
          )}

          <div className="panel p-3">
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input className="w-full pl-8 text-sm" placeholder="Buscar componente..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <ul className="max-h-72 overflow-y-auto divide-y divide-bench-700">
              {filtered.map((h) => {
                const st = STATUS[statusOf(h)];
                return (
                  <li key={h.id}>
                    <button
                      onClick={() => setSelectedId(h.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm rounded ${selectedId === h.id ? 'bg-bench-700' : 'hover:bg-bench-800'}`}
                    >
                      <span aria-hidden>{st.dot}</span>
                      <span className="font-mono text-slate-100 w-20 shrink-0 truncate">{h.label}</span>
                      <span className="text-slate-400 truncate">{resolveInfo(h, db.componentesBD4038).codigo}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function BoardSvg({ board, hotspots, photo, photoOpacity, showSchematic, selectedId, onSelect, statusOf, adjust, onMove }) {
  const svgRef = useRef(null);
  const [drag, setDrag] = useState(null);
  const [vw, vh] = board.viewBox;

  const toSvg = (e) => {
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const p = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: Math.max(0, Math.min(vw, Math.round(p.x))), y: Math.max(0, Math.min(vh, Math.round(p.y))) };
  };

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${vw} ${vh}`}
      className={`w-full h-auto block select-none ${adjust ? 'touch-none' : ''}`}
      style={{ background: '#05070a' }}
      onPointerMove={(e) => {
        if (!drag) return;
        const p = toSvg(e);
        setDrag({ ...drag, ...p });
      }}
      onPointerUp={() => {
        if (drag) onMove(drag.id, drag.x, drag.y);
        setDrag(null);
      }}
      onPointerLeave={() => setDrag(null)}
      role="img"
      aria-label={`Diagrama ${board.codigo}`}
    >
      {photo && <image href={photo.src} x="0" y="0" width={vw} height={vh} preserveAspectRatio="xMidYMid meet" opacity={photoOpacity} />}
      {showSchematic && <Schematic board={board.id} hotspots={hotspots} faded={!!photo} />}
      {hotspots
        .filter((h) => h.kind === 'area' || h.kind === 'hidden')
        .concat(hotspots.filter((h) => h.kind !== 'area' && h.kind !== 'hidden'))
        .map((h0) => {
          const h = drag?.id === h0.id ? { ...h0, x: drag.x, y: drag.y } : h0;
          return (
            <Hotspot
              key={h.id}
              h={h}
              status={statusOf(h0)}
              selected={selectedId === h.id}
              photoMode={!!photo && !showSchematic}
              onSelect={() => onSelect(h.id)}
              onPointerDown={(e) => {
                if (!adjust) return;
                e.preventDefault();
                onSelect(h.id);
                setDrag({ id: h.id, ...toSvg(e) });
              }}
              adjust={adjust}
            />
          );
        })}
    </svg>
  );
}

function Hotspot({ h, status, selected, onSelect, onPointerDown, adjust, photoMode }) {
  const s = STATUS[status];
  const x0 = h.x - h.w / 2;
  const y0 = h.y - h.h / 2;
  const isArea = h.kind === 'area' || h.kind === 'hidden';
  const fillOp = isArea ? 0.04 : photoMode ? 0.25 : 0.18;

  return (
    <g
      className="hotspot"
      tabIndex={0}
      role="button"
      aria-label={`${h.label} — ${s.label}`}
      onClick={adjust ? undefined : onSelect}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), onSelect())}
      onPointerDown={onPointerDown}
      style={{ cursor: adjust ? 'grab' : 'pointer' }}
    >
      {selected && (
        <rect
          className="hs-selected"
          x={x0 - 6} y={y0 - 6} width={h.w + 12} height={h.h + 12} rx={h.kind === 'tp' ? (h.w + 12) / 2 : 6}
          fill="none" stroke="#fbbf24" strokeWidth="2.5"
        />
      )}
      {h.kind === 'tp' ? (
        <>
          <circle className="hs-shape" cx={h.x} cy={h.y} r={h.w / 2} fill="#d4a017" stroke={s.fill} strokeWidth="3" />
          <circle cx={h.x} cy={h.y} r={4} fill="#3b2a05" />
        </>
      ) : h.kind === 'wire' ? (
        <>
          <rect className="hs-shape" x={x0} y={y0} width={h.w} height={h.h} rx={8} fill={s.fill} fillOpacity={0.12} stroke={s.fill} strokeWidth="2" />
          <circle cx={x0 + 22} cy={h.y} r={12} fill="#9ca3af" stroke="#374151" strokeWidth="2" />
          <path d={`M${x0 + 14} ${h.y}h16`} stroke="#374151" strokeWidth="3" />
        </>
      ) : (
        <>
          <rect
            className="hs-shape"
            x={x0} y={y0} width={h.w} height={h.h} rx={h.kind === 'pad' ? 10 : 3}
            fill={isArea ? '#94a3b8' : s.fill} fillOpacity={fillOp}
            stroke={isArea ? '#64748b' : s.fill} strokeWidth={isArea ? 1.5 : 2}
            strokeDasharray={isArea ? '8 6' : undefined}
          />
          {h.kind === 'ic' && <IcPins h={h} />}
          {h.kind === 'pad' && <PadComb h={h} />}
        </>
      )}
      <text
        x={h.kind === 'wire' ? x0 + 42 : h.x}
        y={isArea ? y0 + 18 : h.kind === 'tp' ? h.y - h.h / 2 - 6 : h.kind === 'pad' ? h.y + h.h / 2 + 14 : h.y + 4}
        textAnchor={h.kind === 'wire' ? 'start' : 'middle'}
        fontSize={isArea ? 14 : h.kind === 'wire' ? 15 : h.w < 34 ? 10 : 12}
        fontFamily="ui-monospace, monospace"
        fontWeight="700"
        fill={isArea ? '#94a3b8' : '#f8fafc'}
        stroke="#05070a" strokeWidth="3" paintOrder="stroke"
        pointerEvents="none"
      >
        {h.label}
      </text>
    </g>
  );
}

function IcPins({ h }) {
  const n = 8;
  const pins = [];
  for (let i = 0; i < n; i++) {
    const px = h.x - h.w / 2 + 6 + (i * (h.w - 12)) / (n - 1);
    pins.push(<rect key={`t${i}`} x={px - 2} y={h.y - h.h / 2 - 7} width="4" height="7" fill="#cbd5e1" />);
    pins.push(<rect key={`b${i}`} x={px - 2} y={h.y + h.h / 2} width="4" height="7" fill="#cbd5e1" />);
  }
  return <g pointerEvents="none">{pins}<rect x={h.x - h.w / 2 + 2} y={h.y - h.h / 2 + 2} width={h.w - 4} height={h.h - 4} fill="#111" opacity="0.75" rx="2" /></g>;
}

function PadComb({ h }) {
  const fingers = [];
  const top = h.y - h.h / 2 + 8;
  const bottom = h.y + h.h / 2 - 8;
  for (let i = 0; i < 7; i++) {
    const fx = h.x - h.w / 2 + 10 + i * ((h.w - 20) / 6);
    fingers.push(
      <line key={i} x1={fx} x2={fx} y1={i % 2 ? top + 6 : top} y2={i % 2 ? bottom : bottom - 6} stroke="#c99a2e" strokeWidth="2" />,
    );
  }
  return (
    <g pointerEvents="none" opacity="0.9">
      <line x1={h.x - h.w / 2 + 8} x2={h.x + h.w / 2 - 8} y1={top} y2={top} stroke="#c99a2e" strokeWidth="2" />
      <line x1={h.x - h.w / 2 + 8} x2={h.x + h.w / 2 - 8} y1={bottom} y2={bottom} stroke="#c99a2e" strokeWidth="2" />
      {fingers}
    </g>
  );
}

// Fundo esquemático (placa, trilhas e textos) de cada vista.
function Schematic({ board, hotspots, faded }) {
  const P = Object.fromEntries(hotspots.map((h) => [h.id, h]));
  const trace = (ids, extra = {}) => (
    <polyline
      points={ids.filter((id) => P[id]).map((id) => `${P[id].x},${P[id].y}`).join(' ')}
      fill="none" stroke="#c99a2e" strokeWidth="2" strokeOpacity={faded ? 0.5 : 0.55} strokeLinejoin="round" {...extra}
    />
  );
  const op = faded ? 0.35 : 1;

  if (board === 'bd4038') {
    return (
      <g pointerEvents="none">
        <rect x="14" y="14" width="872" height="532" rx="18" fill="#0f5132" opacity={op} stroke="#1f7a4d" strokeWidth="2" />
        {[[40, 40], [860, 40], [40, 520], [860, 520]].map(([x, y]) => (
          <circle key={`${x}${y}`} cx={x} cy={y} r="9" fill="#05070a" stroke="#c99a2e" strokeWidth="2" opacity={op} />
        ))}
        <text x="40" y="96" fill="#e2e8f0" fontSize="13" fontFamily="ui-monospace,monospace" opacity={0.75}>APB PRODATA BD4038 REV00</text>
        {trace(['TP1', 'R18', 'U4'])}
        {trace(['U4', 'R21', 'TP2'])}
        {trace(['U4', 'R25', 'C17'])}
        <polyline points={`${P.C17?.x},${P.C17?.y} 840,${P.C17?.y} 840,290`} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeOpacity="0.7" />
        {trace(['U4', 'R19', 'C15'])}
        <polyline points={`${P.C15?.x},${P.C15?.y} 840,${P.C15?.y} 840,250`} fill="none" stroke="#e5e7eb" strokeWidth="2" strokeOpacity="0.5" strokeDasharray="4 4" />
        {trace(['TP5', 'D3', 'TP7', 'D5', 'C18', 'L1', 'D4', 'TP8'], { strokeWidth: 4 })}
        <polyline points={`${P.TP5?.x},${P.TP5?.y} 840,${P.TP5?.y} 840,440`} fill="none" stroke="#ef4444" strokeWidth="3" strokeOpacity="0.6" />
        {trace(['Q3', 'D2'])}
        {trace(['R28', 'Q3'])}
        {trace(['R36', 'Q3'])}
        <polyline points={`${P.D2?.x},${P.D2?.y} ${P.D2?.x},62 ${P.J2?.x + 150},62`} fill="none" stroke="#c99a2e" strokeWidth="2" strokeOpacity="0.55" />
        {trace(['CN12', 'TP4', 'PROC'])}
        {trace(['TP6', 'PROC'])}
        {trace(['TP3', 'PROC'])}
        {trace(['PROC', 'TP1'])}
        {trace(['TP2', 'PROC'])}
        {[['1 RX', 250, '#e5e7eb'], ['2 TX', 290, '#22c55e'], ['3 GND', 400, '#9ca3af'], ['4 +24V', 440, '#ef4444']].map(([t, y, c]) => (
          <g key={t}>
            <circle cx="862" cy={y} r="9" fill={c} stroke="#111" strokeWidth="2" />
            <text x="845" y={y + 4} textAnchor="end" fontSize="10" fontFamily="ui-monospace,monospace" fill={c} stroke="#05070a" strokeWidth="3" paintOrder="stroke">{t}</text>
          </g>
        ))}
        <text x="515" y="540" textAnchor="middle" fontSize="11" fill="#a7f3d0" fontFamily="ui-monospace,monospace" opacity="0.8">Fonte step-down 24V → 5V</text>
      </g>
    );
  }

  if (board === 'bd4039') {
    return (
      <g pointerEvents="none">
        <path
          d="M10 40 Q500 -50 990 40 L990 380 Q900 445 760 445 L240 445 Q100 445 10 380 Z"
          fill="#0f5132" opacity={op} stroke="#1f7a4d" strokeWidth="2"
        />
        <text x="500" y="262" textAnchor="middle" fontSize="12" fill="#e2e8f0" fontFamily="ui-monospace,monospace" opacity="0.75">APB PRODATA BD4039 REV01 · MO/10439-05/05</text>
        {hotspots.filter((h) => h.kind === 'pad').map((h) => (
          <line key={h.id} x1={h.x} y1={h.y + h.h / 2} x2={P.U1?.x} y2={P.U1?.y} stroke="#c99a2e" strokeOpacity="0.18" strokeWidth="1.5" />
        ))}
        {['R1', 'R16', 'R13', 'R7'].map((id) => (
          <polyline key={id} points={`${P.U1?.x},${P.U1?.y} ${P[id]?.x},${P[id]?.y} ${P[id]?.x},${P.CN12_T?.y}`} fill="none" stroke="#c99a2e" strokeOpacity="0.6" strokeWidth="2" />
        ))}
        {['LED_D1', 'LED_D2', 'LED_D3', 'LED_D4', 'LED_D5', 'LED_D6'].map((id) => (
          <circle key={id} cx={P[id]?.x} cy={P[id]?.y} r="18" fill="#60a5fa" opacity="0.12" />
        ))}
      </g>
    );
  }

  // Borne e chicote
  const dest = {
    W1: 'C15 → R19 (47 Ω) → Pino 13 (R1IN) U4',
    W2: 'Pino 14 (T1OUT) U4 → R25 (10 Ω) → C17',
    W3: 'Pino 15 (GND) U4 · referência comum',
    W4: 'TP5 → D3 → TP7 → step-down → TP8 (+5V)',
  };
  return (
    <g pointerEvents="none">
      <rect x="40" y="70" width="70" height="350" rx="8" fill="#1f2937" stroke="#4b5563" strokeWidth="2" opacity={op} />
      <text x="75" y="58" textAnchor="middle" fontSize="13" fill="#94a3b8" fontFamily="ui-monospace,monospace">BORNE</text>
      {hotspots.map((h) => (
        <g key={h.id}>
          <path
            d={`M${h.x + h.w / 2} ${h.y} C ${h.x + 260} ${h.y}, ${h.x + 260} ${h.y}, 560 ${h.y}`}
            stroke={h.color} strokeWidth="9" fill="none" strokeLinecap="round" opacity={0.9 * op + 0.1}
          />
          <rect x="560" y={h.y - 22} width="320" height="44" rx="8" fill="#0d1117" stroke={h.color} strokeOpacity="0.6" />
          <text x="574" y={h.y - 4} fontSize="13" fontWeight="700" fill={h.color === '#6b7280' ? '#cbd5e1' : h.color} fontFamily="ui-monospace,monospace">{h.sinal}</text>
          <text x="574" y={h.y + 13} fontSize="11.5" fill="#cbd5e1" fontFamily="ui-monospace,monospace">{dest[h.id]}</text>
        </g>
      ))}
      <text x="450" y="445" textAnchor="middle" fontSize="12" fill="#94a3b8">Alimentação nominal 24V DC / 1,0A · na bancada limite a fonte em 300 mA</text>
    </g>
  );
}
