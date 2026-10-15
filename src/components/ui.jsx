import { STATUS } from '../data/boardMaps';

export function SectionTitle({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && (
          <div className="mt-0.5 rounded-lg bg-amber-400/10 border border-amber-400/30 p-2 text-amber-300">
            <Icon size={18} />
          </div>
        )}
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-slate-100 leading-tight">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function KV({ label, children, mono }) {
  return (
    <div>
      <div className="kv-label mb-1">{label}</div>
      <div className={`text-sm text-slate-200 leading-relaxed ${mono ? 'font-mono' : ''}`}>{children}</div>
    </div>
  );
}

export function StatusPicker({ value, onChange }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {Object.entries(STATUS).map(([key, s]) => {
        const active = value === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
              active ? `bg-bench-700 border-transparent ring-2 ${s.ring} text-slate-100` : 'border-bench-600 bg-bench-900 text-slate-300 hover:bg-bench-800'
            }`}
            aria-pressed={active}
          >
            <span aria-hidden>{s.dot}</span>
            <span>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label>{label}</label>
      {children}
    </div>
  );
}
