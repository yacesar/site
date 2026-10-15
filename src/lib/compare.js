// Campos de medição do formulário e sua chave na referência do teclado bom.
export const U4_FIELDS = [
  { key: 'pino16', ref: 'u4_pino16_vcc', label: 'Pino 16 (V)', hint: 'VCC +5V' },
  { key: 'pino2', ref: 'u4_pino2_vpos', label: 'Pino 2 (V)', hint: 'V+ bomba de carga' },
  { key: 'pino6', ref: 'u4_pino6_vneg', label: 'Pino 6 (V)', hint: 'V− bomba de carga' },
  { key: 'pino14Repouso', ref: 'u4_pino14_repouso', label: 'Pino 14 em repouso (V)', hint: 'T1OUT' },
  { key: 'depoisR25', ref: 'depois_r25', label: 'Depois do R25 (V)', hint: 'Lado do C17' },
];

export const TP_FIELDS = [
  { key: 'tp1', ref: 'tp1_tx_ttl', label: 'TP1 (V)', hint: 'TX TTL' },
  { key: 'tp2', ref: 'tp2_rx_ttl', label: 'TP2 (V)', hint: 'RX TTL' },
  { key: 'tp3', ref: 'tp3_debug', label: 'TP3 (V)', hint: 'Debug' },
  { key: 'tp4', ref: 'tp4_teclas', label: 'TP4 (V)', hint: 'Teclas' },
  { key: 'tp5', ref: 'tp5_entrada24v', label: 'TP5 (V)', hint: 'Entrada 24V' },
  { key: 'tp6', ref: 'tp6_teclas', label: 'TP6 (V)', hint: 'Teclas' },
  { key: 'tp7', ref: 'tp7_pos_d3', label: 'TP7 (V)', hint: 'Pós D3' },
  { key: 'tp8', ref: 'tp8_saida_regulada', label: 'TP8 (V)', hint: 'Saída 5V' },
];

export const REF_LABELS = Object.fromEntries(
  [...U4_FIELDS.map((f) => [f.ref, `U4 ${f.label.replace(' (V)', '')}`]), ...TP_FIELDS.map((f) => [f.ref, `${f.label.replace(' (V)', '')} · ${f.hint}`])],
);

export function num(v) {
  if (v === null || v === undefined || v === '') return null;
  const n = parseFloat(String(v).replace(',', '.').trim());
  return Number.isFinite(n) ? n : null;
}

// Compara uma medição com a referência: ok / atenção / anomalia.
export function compareValue(measured, reference) {
  const m = num(measured);
  const r = num(reference);
  if (m === null || r === null) return null;
  const tol = Math.max(0.5, Math.abs(r) * 0.1);
  const diff = m - r;
  const level = Math.abs(diff) <= tol ? 'ok' : Math.abs(diff) <= tol * 2 ? 'warn' : 'bad';
  return { m, r, diff, tol, level };
}

// Regras de diagnóstico aprendidas na bancada.
export function diagnose(u4 = {}, tp = {}) {
  const out = [];
  const v = (o, k) => num(o?.[k]);
  const p16 = v(u4, 'pino16');
  const p2 = v(u4, 'pino2');
  const p6 = v(u4, 'pino6');
  const p14 = v(u4, 'pino14Repouso');
  const r25 = v(u4, 'depoisR25');
  const t = (k) => v(tp, k);

  if (t('tp5') !== null && t('tp5') < 20) out.push({ level: 'bad', msg: 'TP5 abaixo de 20V: entrada de 24V ausente ou baixa — conferir fio vermelho, solda do borne e a fonte.' });
  if ((t('tp5') === null || t('tp5') >= 20) && t('tp7') !== null && t('tp7') < 1) out.push({ level: 'bad', msg: 'TP7 em ~0V com entrada presente: diodo de proteção D3 aberto.' });
  if (t('tp8') !== null && t('tp8') < 4.5 && (t('tp7') === null || t('tp7') > 18)) out.push({ level: 'bad', msg: 'TP8 abaixo de 4,5V: fonte step-down com defeito (D5, C18, L1, D4) ou curto na linha de 5V.' });
  if (t('tp8') !== null && t('tp8') > 5.5) out.push({ level: 'bad', msg: 'TP8 acima de 5,5V: regulação da fonte step-down fora — risco para processador e U4.' });
  if (p16 !== null && p16 < 4.5) out.push({ level: 'bad', msg: 'Pino 16 do U4 sem +5V: o problema é de alimentação (TP8 / fonte), não do U4.' });
  if (p16 !== null && p16 >= 4.5 && ((p2 !== null && p2 < 7) || (p6 !== null && p6 > -7)))
    out.push({ level: 'bad', msg: 'Pino 2 / Pino 6 fora de ±7V com VCC normal: bomba de carga do ST232C (capacitores externos) ou U4 defeituoso.' });
  if (p14 !== null && Math.abs(p14) < 1) out.push({ level: 'bad', msg: 'Pino 14 em ~0V: falha no U4 (T1OUT) ou curto na linha TX.' });
  if (p14 !== null && p14 <= -4 && r25 !== null && Math.abs(r25) < 1) out.push({ level: 'bad', msg: 'Pino 14 normal e 0V depois do R25: R25 (10 Ω) aberto.' });
  else if (p14 !== null && p14 <= -4 && r25 !== null && Math.abs(r25 - p14) > 1.5)
    out.push({ level: 'warn', msg: 'Diferença grande entre Pino 14 e depois do R25: verificar R25, C17 e fuga para GND na linha TX (oxidação).' });
  if (p14 !== null && p14 > 1) out.push({ level: 'warn', msg: 'Pino 14 positivo em repouso: TP1 pode estar em 0V (TX ativo/travado) — conferir TP1 e R18.' });
  if (t('tp1') !== null && t('tp1') < 1) out.push({ level: 'bad', msg: 'TP1 em ~0V: processador não está mantendo TX em repouso, ou R18 / linha com problema.' });
  if (t('tp2') !== null && t('tp2') < 1) out.push({ level: 'bad', msg: 'TP2 em ~0V: saída R1OUT (Pino 12 do U4) ou R21 com problema.' });
  if ((t('tp4') !== null && t('tp4') < 1) || (t('tp6') !== null && t('tp6') < 1))
    out.push({ level: 'bad', msg: 'TP4/TP6 em ~0V: linha de teclas — conferir conector de 12 pinos, U1 e as trilhas R1, R16, R13, R7.' });
  if (t('tp3') !== null && t('tp3') < 1) out.push({ level: 'warn', msg: 'TP3 (debug) em ~0V: suspeita no processador.' });
  return out;
}

export function compareAll(record, reference) {
  const rows = [
    ...U4_FIELDS.map((f) => ({ ...f, grupo: 'U4', ...(compareValue(record.medicoesU4?.[f.key], reference[f.ref]) || {}), raw: record.medicoesU4?.[f.key] })),
    ...TP_FIELDS.map((f) => ({ ...f, grupo: 'TP', ...(compareValue(record.medicoesTP?.[f.key], reference[f.ref]) || {}), raw: record.medicoesTP?.[f.key] })),
  ];
  return { rows, regras: diagnose(record.medicoesU4, record.medicoesTP) };
}
