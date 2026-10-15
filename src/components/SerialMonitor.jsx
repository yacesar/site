import { useEffect, useRef, useState } from 'react';
import { Usb, Plug, Unplug, Send, Trash2, Download, AlertTriangle, Pause, Play } from 'lucide-react';
import { SectionTitle, Field } from './ui';

const BAUDS = [4800, 9600, 19200, 38400, 115200];
const GAP_MS = 40; // bytes que chegam com menos que isso viram a mesma linha
const MAX_LINES = 1500;

const toHex = (bytes) => Array.from(bytes, (b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
const toAscii = (bytes) =>
  Array.from(bytes, (b) => (b >= 32 && b < 127 ? String.fromCharCode(b) : b === 13 ? '␍' : b === 10 ? '␊' : '·')).join('');
const stamp = (t) => {
  const d = new Date(t);
  return `${d.toLocaleTimeString('pt-BR', { hour12: false })}.${String(d.getMilliseconds()).padStart(3, '0')}`;
};

export function parseHex(text) {
  const clean = text.replace(/0x/gi, ' ').replace(/[,;:\-]/g, ' ').trim();
  if (!clean) throw new Error('Digite ao menos um byte em HEX.');
  const parts = clean.includes(' ') ? clean.split(/\s+/) : clean.match(/.{1,2}/g);
  return Uint8Array.from(parts.map((p) => {
    if (!/^[0-9a-f]{1,2}$/i.test(p)) throw new Error(`Byte inválido: “${p}”`);
    return parseInt(p, 16);
  }));
}

export default function SerialMonitor() {
  const supported = typeof navigator !== 'undefined' && 'serial' in navigator;
  const [baud, setBaud] = useState(9600);
  const [parity, setParity] = useState('none');
  const [connected, setConnected] = useState(false);
  const [portInfo, setPortInfo] = useState('');
  const [lines, setLines] = useState([]);
  const [mode, setMode] = useState('both');
  const [paused, setPaused] = useState(false);
  const [txText, setTxText] = useState('');
  const [txAscii, setTxAscii] = useState(false);
  const [appendCr, setAppendCr] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ rx: 0, tx: 0 });

  const portRef = useRef(null);
  const readerRef = useRef(null);
  const keepReading = useRef(false);
  const loopRef = useRef(null);
  const logRef = useRef(null);
  const pausedRef = useRef(false);
  pausedRef.current = paused;

  const push = (dir, bytes) => {
    const now = Date.now();
    setLines((prev) => {
      const last = prev[prev.length - 1];
      if (dir === 'rx' && last && last.dir === 'rx' && now - last.end < GAP_MS) {
        const merged = new Uint8Array(last.bytes.length + bytes.length);
        merged.set(last.bytes);
        merged.set(bytes, last.bytes.length);
        return [...prev.slice(0, -1), { ...last, bytes: merged, end: now }];
      }
      const next = [...prev, { id: `${now}-${Math.random()}`, t: now, end: now, dir, bytes }];
      return next.length > MAX_LINES ? next.slice(-MAX_LINES) : next;
    });
  };

  const sys = (msg) => push('sys', new TextEncoder().encode(msg));

  useEffect(() => {
    if (!paused && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [lines, paused]);

  useEffect(() => () => { disconnect(true); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function readLoop(port) {
    while (port.readable && keepReading.current) {
      const reader = port.readable.getReader();
      readerRef.current = reader;
      try {
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          if (value?.length) {
            setStats((s) => ({ ...s, rx: s.rx + value.length }));
            if (!pausedRef.current) push('rx', value);
          }
        }
      } catch (err) {
        if (keepReading.current) sys(`Erro de leitura: ${err.message}`);
      } finally {
        reader.releaseLock();
      }
    }
  }

  async function connect() {
    setError('');
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: baud, dataBits: 8, stopBits: 1, parity, flowControl: 'none' });
      portRef.current = port;
      const info = port.getInfo?.() || {};
      const desc = info.usbVendorId ? `USB ${info.usbVendorId.toString(16).padStart(4, '0')}:${(info.usbProductId || 0).toString(16).padStart(4, '0')}` : 'Porta serial';
      setPortInfo(desc);
      setConnected(true);
      keepReading.current = true;
      sys(`Conectado: ${desc} · ${baud} bps · 8${parity === 'none' ? 'N' : parity === 'even' ? 'E' : 'O'}1`);
      loopRef.current = readLoop(port);
      port.addEventListener?.('disconnect', () => {
        keepReading.current = false;
        setConnected(false);
        sys('Cabo USB-RS232 desconectado.');
      });
    } catch (err) {
      if (err?.name !== 'NotFoundError') setError(err.message || String(err));
    }
  }

  async function disconnect(silent) {
    keepReading.current = false;
    try { await readerRef.current?.cancel(); } catch { /* já fechado */ }
    try { await loopRef.current; } catch { /* ignorado */ }
    try { await portRef.current?.close(); } catch { /* já fechado */ }
    portRef.current = null;
    if (!silent) {
      setConnected(false);
      sys('Porta fechada.');
    }
  }

  async function send(bytesOverride) {
    setError('');
    try {
      let bytes = bytesOverride;
      if (!bytes) {
        bytes = txAscii ? new TextEncoder().encode(txText) : parseHex(txText);
        if (appendCr) bytes = Uint8Array.from([...bytes, 0x0d]);
      }
      if (!portRef.current?.writable) throw new Error('Conecte a porta COM antes de enviar.');
      const writer = portRef.current.writable.getWriter();
      await writer.write(bytes);
      writer.releaseLock();
      setStats((s) => ({ ...s, tx: s.tx + bytes.length }));
      push('tx', bytes);
    } catch (err) {
      setError(err.message);
    }
  }

  const exportLog = () => {
    const txt = lines
      .map((l) => `[${stamp(l.t)}] ${l.dir.toUpperCase().padEnd(3)} ${l.dir === 'sys' ? new TextDecoder().decode(l.bytes) : `${toHex(l.bytes)}  |  ${toAscii(l.bytes)}`}`)
      .join('\n');
    const url = URL.createObjectURL(new Blob([txt], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `dk620-serial-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div>
      <SectionTitle
        icon={Usb}
        title="Simulador de validador — monitor serial RS-232"
        subtitle="Teste o DK620 sem o validador do ônibus, usando um cabo conversor USB-RS232 (DB9) ligado ao PC."
      />

      <div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
        <div className="space-y-4">
          <div className="panel p-4">
            <h3 className="font-semibold text-slate-100 mb-3">Guia de ligação</h3>
            <WiringDiagram />
            <ul className="mt-3 space-y-1.5 text-sm">
              <li className="flex gap-2"><Dot c="#ef4444" /> <span><b>Vermelho (+24V)</b> → positivo da fonte de bancada (24V, limite 300 mA)</span></li>
              <li className="flex gap-2"><Dot c="#9ca3af" /> <span><b>Cinza/Preto (GND)</b> → negativo da fonte <b>e</b> Pino 5 (GND) do DB9</span></li>
              <li className="flex gap-2"><Dot c="#22c55e" /> <span><b>Verde (TX do teclado)</b> → Pino 2 (RX) do DB9</span></li>
              <li className="flex gap-2"><Dot c="#e5e7eb" /> <span><b>Branco (RX do teclado)</b> → Pino 3 (TX) do DB9</span></li>
            </ul>
          </div>

          <div className="panel p-4 space-y-3">
            {!supported && (
              <div className="rounded-lg border border-amber-400/40 bg-amber-400/10 p-3 text-sm text-amber-200 flex gap-2">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                <span>Este navegador não tem Web Serial API. Use <b>Google Chrome</b> ou <b>Microsoft Edge</b> no computador (desktop), via HTTPS.</span>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <Field label="Baud rate">
                <select value={baud} onChange={(e) => setBaud(+e.target.value)} disabled={connected}>
                  {BAUDS.map((b) => <option key={b} value={b}>{b} bps</option>)}
                </select>
              </Field>
              <Field label="Paridade (8 bits, 1 stop)">
                <select value={parity} onChange={(e) => setParity(e.target.value)} disabled={connected}>
                  <option value="none">Nenhuma (8N1)</option>
                  <option value="even">Par (8E1)</option>
                  <option value="odd">Ímpar (8O1)</option>
                </select>
              </Field>
            </div>
            {connected ? (
              <button className="btn-danger w-full" onClick={() => disconnect(false)}><Unplug size={16} /> Desconectar ({portInfo})</button>
            ) : (
              <button className="btn-primary w-full" onClick={connect} disabled={!supported}><Plug size={16} /> Conectar Porta COM</button>
            )}
            <p className="text-xs text-slate-500">
              Não recebe nada? Troque o baud rate (desconecte antes) e confira se TX/RX estão cruzados. Com o teclado em repouso o fio verde deve marcar -5V a -9V.
            </p>
          </div>

          <div className="panel p-4 space-y-3">
            <h3 className="font-semibold text-slate-100">Enviar pacote de teste</h3>
            <div className="flex gap-2">
              <input
                className="flex-1 font-mono text-sm min-w-0"
                placeholder={txAscii ? 'Texto ASCII' : 'Ex.: 02 41 42 03'}
                value={txText}
                onChange={(e) => setTxText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button className="btn-primary" onClick={() => send()} disabled={!connected}><Send size={16} /></button>
            </div>
            <div className="flex flex-wrap gap-4 text-sm">
              <label className="flex items-center gap-2 text-slate-300 text-sm"><input type="checkbox" checked={txAscii} onChange={(e) => setTxAscii(e.target.checked)} /> Digitar em ASCII</label>
              <label className="flex items-center gap-2 text-slate-300 text-sm"><input type="checkbox" checked={appendCr} onChange={(e) => setAppendCr(e.target.checked)} /> Acrescentar CR (0D)</label>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['00', '0D', '0D 0A', '55', 'AA', 'FF', '02 03'].map((p) => (
                <button key={p} className="btn-ghost !px-2 !py-1 font-mono text-xs" disabled={!connected} onClick={() => send(parseHex(p))}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        <div className="panel flex flex-col min-h-[420px] xl:h-[calc(100vh-190px)] min-w-0">
          <div className="flex flex-wrap items-center gap-2 p-3 border-b border-bench-700">
            <span className={`chip ${connected ? 'border-green-500/50 text-green-300 bg-green-500/10' : 'border-bench-600 text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-slate-500'}`} />
              {connected ? `Conectado · ${baud} bps` : 'Desconectado'}
            </span>
            <span className="chip border-bench-600 text-slate-400 font-mono">RX {stats.rx} B · TX {stats.tx} B</span>
            <div className="flex-1" />
            <div className="flex rounded-md border border-bench-600 overflow-hidden text-xs">
              {[['both', 'HEX + ASCII'], ['hex', 'HEX'], ['ascii', 'ASCII']].map(([k, l]) => (
                <button key={k} onClick={() => setMode(k)} className={`px-2.5 py-1 ${mode === k ? 'bg-amber-400 text-bench-950 font-semibold' : 'text-slate-300 hover:bg-bench-700'}`}>{l}</button>
              ))}
            </div>
            <button className="btn-ghost !px-2" onClick={() => setPaused((p) => !p)} title={paused ? 'Retomar' : 'Pausar'}>{paused ? <Play size={15} /> : <Pause size={15} />}</button>
            <button className="btn-ghost !px-2" onClick={exportLog} disabled={!lines.length} title="Exportar log"><Download size={15} /></button>
            <button className="btn-ghost !px-2" onClick={() => { setLines([]); setStats({ rx: 0, tx: 0 }); }} title="Limpar"><Trash2 size={15} /></button>
          </div>
          {error && <div className="px-3 py-2 text-sm text-red-300 bg-red-500/10 border-b border-red-500/30">{error}</div>}
          <div ref={logRef} className="flex-1 overflow-auto p-3 font-mono text-[13px] leading-relaxed bg-bench-950/60">
            {lines.length === 0 ? (
              <div className="h-full flex items-center justify-center text-center text-slate-500 text-sm px-6">
                Conecte a porta e pressione as teclas do DK620. Cada pacote recebido aparece aqui com horário, em HEX e ASCII.
              </div>
            ) : (
              lines.map((l) => (
                <div key={l.id} className="flex gap-3 py-0.5 border-b border-bench-800/60">
                  <span className="text-slate-500 shrink-0">{stamp(l.t)}</span>
                  <span className={`shrink-0 w-7 font-bold ${l.dir === 'rx' ? 'text-green-400' : l.dir === 'tx' ? 'text-sky-400' : 'text-amber-400'}`}>
                    {l.dir === 'sys' ? '•' : l.dir.toUpperCase()}
                  </span>
                  {l.dir === 'sys' ? (
                    <span className="text-amber-200/80">{new TextDecoder().decode(l.bytes)}</span>
                  ) : (
                    <span className="flex flex-col sm:flex-row sm:gap-4 min-w-0 break-all">
                      {mode !== 'ascii' && <span className="text-slate-100">{toHex(l.bytes)}</span>}
                      {mode !== 'hex' && <span className="text-amber-200">{toAscii(l.bytes)}</span>}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Dot({ c }) {
  return <span className="mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 border border-black/40" style={{ background: c }} />;
}

function WiringDiagram() {
  const left = [
    { c: '#e5e7eb', y: 50, label: '1 Branco · RX' },
    { c: '#22c55e', y: 95, label: '2 Verde · TX' },
    { c: '#9ca3af', y: 140, label: '3 Cinza/Preto · GND' },
    { c: '#ef4444', y: 185, label: '4 Vermelho · +24V' },
  ];
  const right = [
    { y: 50, label: 'Pino 2 · RX do PC', box: 'db9' },
    { y: 95, label: 'Pino 3 · TX do PC', box: 'db9' },
    { y: 140, label: 'Pino 5 · GND', box: 'db9' },
    { y: 200, label: '+ 24V', box: 'fonte' },
    { y: 230, label: '− GND', box: 'fonte' },
  ];
  // [y origem, y destino, cor]
  const links = [
    [50, 95, '#e5e7eb'],
    [95, 50, '#22c55e'],
    [140, 140, '#9ca3af'],
    [140, 230, '#9ca3af'],
    [185, 200, '#ef4444'],
  ];
  return (
    <svg viewBox="0 0 400 260" className="w-full h-auto" role="img" aria-label="Ligação do DK620 ao DB9 do PC e à fonte de bancada">
      <text x="62" y="18" textAnchor="middle" fontSize="11" fill="#94a3b8">Borne DK620</text>
      <rect x="8" y="28" width="108" height="178" rx="8" fill="#111827" stroke="#4b5563" />
      <text x="320" y="18" textAnchor="middle" fontSize="11" fill="#94a3b8">DB9 (cabo USB-RS232)</text>
      <rect x="262" y="28" width="132" height="134" rx="8" fill="#111827" stroke="#4b5563" />
      <text x="320" y="184" textAnchor="middle" fontSize="11" fill="#94a3b8">Fonte de bancada 300 mA</text>
      <rect x="262" y="188" width="132" height="58" rx="8" fill="#111827" stroke="#4b5563" />
      {links.map(([a, b, c], i) => (
        <path key={i} d={`M116 ${a} C 190 ${a}, 190 ${b}, 262 ${b}`} stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
      ))}
      {left.map((w) => (
        <g key={w.label}>
          <circle cx="116" cy={w.y} r="5" fill={w.c} stroke="#000" />
          <text x="16" y={w.y + 4} fontSize="10" fontWeight="600" fill={w.c === '#9ca3af' ? '#cbd5e1' : w.c}>{w.label}</text>
        </g>
      ))}
      {right.map((r) => (
        <g key={r.label}>
          <circle cx="262" cy={r.y} r="5" fill="#d4a017" stroke="#000" />
          <text x="272" y={r.y + 4} fontSize="10" fontWeight="600" fill="#e2e8f0">{r.label}</text>
        </g>
      ))}
      <text x="190" y="76" textAnchor="middle" fontSize="9" fill="#fbbf24">TX/RX cruzados</text>
    </svg>
  );
}
