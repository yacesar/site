import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { seedData } from '../data/seedData';

const STORAGE_KEY = 'dk620-bancada-db-v1';

export function createInitialDb() {
  return {
    versao: 5,
    ...structuredClone(seedData),
    statusComponentes: {},
    notasComponentes: {},
    fotos: { bd4038: null, bd4039: null, borne: null },
    posicoes: { bd4038: {}, bd4039: {}, borne: {} },
    testeTeclas: {},
  };
}

// Completa um banco importado/salvo com campos que possam faltar.
export function normalizeDb(raw) {
  const base = createInitialDb();
  if (!raw || typeof raw !== 'object') return base;
  const db = {
    ...base,
    ...raw,
    equipamento: { ...base.equipamento, ...(raw.equipamento || {}) },
    referenciaTecladoBom: { ...base.referenciaTecladoBom, ...(raw.referenciaTecladoBom || {}) },
    fotos: { ...base.fotos, ...(raw.fotos || {}) },
    posicoes: { ...base.posicoes, ...(raw.posicoes || {}) },
    componentesBD4038: Array.isArray(raw.componentesBD4038) ? raw.componentesBD4038 : base.componentesBD4038,
    pendenciasLevantamento: Array.isArray(raw.pendenciasLevantamento) ? raw.pendenciasLevantamento : base.pendenciasLevantamento,
    registrosReparo: Array.isArray(raw.registrosReparo) ? raw.registrosReparo : base.registrosReparo,
  };
  // Pendências acrescentadas em cada versão; entram sem mexer nas existentes.
  const novasPorVersao = { 2: [7, 8], 3: [9] };
  const ids = new Set(db.pendenciasLevantamento.map((p) => p.id));
  Object.entries(novasPorVersao).forEach(([v, novas]) => {
    if ((raw.versao || 1) >= Number(v)) return;
    base.pendenciasLevantamento
      .filter((p) => novas.includes(p.id) && !ids.has(p.id))
      .forEach((p) => db.pendenciasLevantamento.push(p));
  });
  // v4: pendência 7 (blocos no LCD) foi esclarecida em campo. Só atualiza se
  // o técnico ainda não mexeu nela.
  if ((raw.versao || 1) < 4) {
    const p7 = db.pendenciasLevantamento.find((p) => p.id === 7);
    if (p7 && !p7.concluido && p7.notas.startsWith('Vistos no vídeo de 20/10/2026')) {
      Object.assign(p7, base.pendenciasLevantamento.find((p) => p.id === 7));
    }
  }
  // v5: pendência 9 ganhou a confirmação de que "De:/Para:" vem do validador.
  if ((raw.versao || 1) < 5) {
    const p9 = db.pendenciasLevantamento.find((p) => p.id === 9);
    if (p9 && !p9.concluido && p9.notas.startsWith('Confirmado que o LCD mostra mensagens')) {
      p9.notas = base.pendenciasLevantamento.find((p) => p.id === 9).notas;
    }
  }
  db.versao = base.versao;
  return db;
}

function loadDb() {
  try {
    const txt = localStorage.getItem(STORAGE_KEY);
    if (txt) return normalizeDb(JSON.parse(txt));
  } catch {
    /* armazenamento indisponível ou corrompido: volta aos dados iniciais */
  }
  return createInitialDb();
}

const DbContext = createContext(null);

export function DbProvider({ children }) {
  const [db, setDb] = useState(loadDb);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
      setSaveError(null);
    } catch (err) {
      setSaveError(
        err?.name === 'QuotaExceededError'
          ? 'Armazenamento do navegador cheio — remova uma foto ou exporte o backup.'
          : 'Não foi possível salvar no navegador (modo privado?). Exporte o backup JSON.',
      );
    }
  }, [db]);

  const update = useCallback((fn) => setDb((prev) => fn(structuredClone(prev)) ?? prev), []);
  const replace = useCallback((next) => setDb(normalizeDb(next)), []);
  const reset = useCallback(() => setDb(createInitialDb()), []);

  return (
    <DbContext.Provider value={{ db, update, replace, reset, saveError }}>{children}</DbContext.Provider>
  );
}

export function useDb() {
  const ctx = useContext(DbContext);
  if (!ctx) throw new Error('useDb fora do DbProvider');
  return ctx;
}

export function exportDb(db) {
  const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dk620-bancada-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function readJsonFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object' || !('registrosReparo' in data || 'referenciaTecladoBom' in data)) {
          reject(new Error('O arquivo não parece ser um backup do DK620.'));
          return;
        }
        resolve(data);
      } catch {
        reject(new Error('JSON inválido.'));
      }
    };
    reader.onerror = () => reject(new Error('Falha ao ler o arquivo.'));
    reader.readAsText(file);
  });
}

// Reduz a foto para caber no localStorage (lado maior 1600 px, JPEG 0,82).
export function readImageFile(file, maxSide = 1600) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler a imagem.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Imagem inválida.'));
      img.onload = () => {
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ src: canvas.toDataURL('image/jpeg', 0.82), w: canvas.width, h: canvas.height });
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
