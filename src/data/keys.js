// Membrana frontal do DK620 / placa de teclas BD4039 REV01.
// "pcb" é a marcação serigrafada ao lado da pastilha na placa.
export const KEYS = [
  // Linha superior
  { id: 'k1', label: '1', sub: '', pcb: '1', row: 0, col: 0 },
  { id: 'k2', label: '2', sub: 'ABC', pcb: '2', row: 0, col: 1 },
  { id: 'k3', label: '3', sub: 'DEF', pcb: '3', row: 0, col: 2 },
  { id: 'k4', label: '4', sub: 'GHI', pcb: '4', row: 0, col: 3 },
  { id: 'k5', label: '5', sub: 'JKL', pcb: '5', row: 0, col: 4 },
  { id: 'kAN', label: 'Alfa/Num', sub: '▲', pcb: 'AN', row: 0, col: 5, func: true },
  { id: 'kF1', label: 'F1', sub: '◀', pcb: 'F1', row: 0, col: 6, func: true },
  // Linha intermediária
  { id: 'k6', label: '6', sub: 'MNO', pcb: '6', row: 1, col: 0 },
  { id: 'k7', label: '7', sub: 'PQR', pcb: '7', row: 1, col: 1 },
  { id: 'k8', label: '8', sub: 'STU', pcb: '8', row: 1, col: 2 },
  { id: 'k9', label: '9', sub: 'VWX', pcb: '9', row: 1, col: 3 },
  { id: 'k0', label: '0', sub: 'YZ', pcb: '0', row: 1, col: 4 },
  { id: 'kF2', label: 'F2', sub: '▼', pcb: 'F2', row: 1, col: 5, func: true },
  { id: 'kF3', label: 'F3', sub: '▶', pcb: 'F3', row: 1, col: 6, func: true },
  // Extremidades inferiores
  { id: 'kX', label: 'X', sub: 'Cancelar', pcb: 'X', row: 2, col: 0, color: 'red' },
  {
    id: 'kV', label: '✓', sub: 'Confirmar', pcb: 'V', row: 2, col: 1, color: 'green',
    operacao: 'Tecla de OK/liberar. 1 toque: validador fica em espera pelo cartão (roleta libera com o cartão aceito). 2 toques: libera a roleta direto, para pagante em dinheiro.',
  },
];

// Posição de cada tecla num viewBox 1000 x 460, em arco (bordas mais altas).
export function keyPosition(key) {
  if (key.row === 2) {
    return key.col === 0 ? { x: 150, y: 318 } : { x: 850, y: 318 };
  }
  const x = 110 + key.col * 130;
  const dx = x - 500;
  const arc = 0.00022 * dx * dx;
  const base = key.row === 0 ? 120 : 224;
  return { x, y: base - arc };
}

export const KEY_ROWS = ['Linha superior', 'Linha intermediária', 'Extremidade inferior'];
