// Hotspots dos diagramas das placas. As posições são esquemáticas
// (viewBox) e podem ser reajustadas sobre a foto real pelo modo "Ajustar".
// Quando "seedRef" existe, a ficha técnica vem de componentesBD4038.
import { KEYS, keyPosition } from './keys';

const tp = (id, x, y, info) => ({ id, label: id, kind: 'tp', x, y, w: 22, h: 22, ...info });

export const BOARDS = {
  bd4038: {
    id: 'bd4038',
    titulo: 'Placa Principal',
    codigo: 'APB PRODATA BD4038 REV00',
    viewBox: [900, 560],
    hotspots: [
      {
        id: 'LCD', label: 'LCD 16x2', kind: 'area', x: 370, y: 180, w: 500, h: 230,
        codigo: 'Módulo LCD 16x2', especificacao: 'Display alfanumérico com backlight azul, encaixado no soquete J2 e fixado por 4 parafusos nos cantos.',
        funcao: 'Exibe as mensagens do validador. O backlight recebe alimentação pelo Pino 15 de J2, chaveado pelo Q3.',
        ondeMedir: 'Pinos de J2 com ponta preta no GND (Pino 15 do U4 ou fio cinza/preto).',
        valorEsperado: 'Alimentação de +5V no módulo; tensão no Pino 15 de J2 com backlight aceso.',
      },
      {
        id: 'PROC', label: 'Processador (sob o LCD)', kind: 'hidden', x: 370, y: 205, w: 150, h: 90,
        codigo: 'Processador principal (código a levantar)', especificacao: 'Fica escondido embaixo do LCD. Retirar os 4 parafusos dos cantos e desencaixar do soquete J2 para ler a gravação.',
        funcao: 'Controla LCD, comunicação serial (TP1/TP2), backlight (Q3) e lê as teclas pelo conector de 12 pinos (TP4/TP6).',
        ondeMedir: 'Indiretamente pelos pontos de teste TP1, TP2, TP3, TP4 e TP6.',
        valorEsperado: '+5V em repouso nos TPs de comunicação e teclas.',
      },
      {
        id: 'J2', label: 'J2', kind: 'conn', x: 370, y: 52, w: 330, h: 20,
        codigo: 'J2 - Soquete fêmea 16 pinos (LCD)', especificacao: 'Barra fêmea de 16 pinos, passo 2,54 mm.',
        funcao: 'Liga o módulo LCD 16x2 à placa principal. O Pino 15 alimenta o anodo do backlight.',
        ondeMedir: 'Pino 15 de J2 em relação ao GND, com o teclado ligado.',
        valorEsperado: 'Tensão presente no Pino 15 quando o backlight está aceso; 0V apagado.',
      },
      { id: 'Q3', label: 'Q3', kind: 'tr', x: 690, y: 105, w: 26, h: 22, seedRef: 'Q3_D2_R28_R36' },
      { id: 'D2', label: 'D2', kind: 'diode', x: 740, y: 105, w: 30, h: 16, seedRef: 'Q3_D2_R28_R36' },
      { id: 'R28', label: 'R28', kind: 'res', x: 690, y: 150, w: 30, h: 14, seedRef: 'Q3_D2_R28_R36' },
      { id: 'R36', label: 'R36', kind: 'res', x: 740, y: 150, w: 30, h: 14, seedRef: 'Q3_D2_R28_R36' },
      { id: 'U4', label: 'U4 ST232C', kind: 'ic', x: 700, y: 340, w: 78, h: 52, seedRef: 'U4' },
      { id: 'R18', label: 'R18', kind: 'res', x: 620, y: 300, w: 30, h: 14, seedRef: 'TP1_R18' },
      { id: 'R21', label: 'R21', kind: 'res', x: 620, y: 380, w: 30, h: 14, seedRef: 'TP2_R21' },
      tp('TP1', 572, 300, { seedRef: 'TP1_R18' }),
      tp('TP2', 572, 380, { seedRef: 'TP2_R21' }),
      { id: 'R25', label: 'R25', kind: 'res', x: 780, y: 300, w: 30, h: 14, seedRef: 'R25' },
      { id: 'R19', label: 'R19', kind: 'res', x: 780, y: 380, w: 30, h: 14, seedRef: 'R19' },
      {
        id: 'C17', label: 'C17', kind: 'cap', x: 780, y: 262, w: 26, h: 14,
        codigo: 'C17 - Capacitor da linha TX', especificacao: 'Capacitor SMD (valor a levantar).',
        funcao: 'Fica entre o R25 e o Fio Verde (TX) do borne, na saída RS-232 do U4.',
        ondeMedir: 'Tensão nos dois lados com o teclado ligado (ponta preta no Pino 15 do U4); continuidade até o borne.',
        valorEsperado: 'Mesmo nível de repouso do Pino 14 / depois do R25 (-5V a -9V) chegando ao fio verde.',
      },
      {
        id: 'C15', label: 'C15', kind: 'cap', x: 780, y: 420, w: 26, h: 14,
        codigo: 'C15 - Capacitor da linha RX', especificacao: 'Capacitor SMD (valor a levantar).',
        funcao: 'Fica entre o Fio Branco (RX) do borne e o R19, na entrada RS-232 do U4.',
        ondeMedir: 'Continuidade do fio branco até C15 e de C15 até R19 / Pino 13 do U4.',
        valorEsperado: 'Sem curto para GND; linha íntegra até o Pino 13 do U4.',
      },
      {
        id: 'BORNE', label: 'Borne', kind: 'conn', x: 862, y: 350, w: 34, h: 230,
        codigo: 'Borne traseiro 4 vias', especificacao: '1-Branco (RX) | 2-Verde (TX) | 3-Cinza/Preto (GND) | 4-Vermelho (+24V)',
        funcao: 'Entrada de alimentação de 24V do ônibus e linhas seriais RS-232 do validador.',
        ondeMedir: 'Entre o pino 4 (vermelho) e o pino 3 (GND) para alimentação; inspecionar os 8 pontos de solda no verso.',
        valorEsperado: '~24V entre vermelho e GND. Soldas brilhantes, sem crosta de oxidação.',
      },
      {
        id: 'D3', label: 'D3', kind: 'diode', x: 770, y: 500, w: 30, h: 16,
        codigo: 'D3 - Diodo de proteção de polaridade', especificacao: 'Diodo em série com a entrada de +24V.',
        funcao: 'Bloqueia a alimentação se o 24V for ligado invertido. Queda direta típica ~0,7V (TP5 → TP7).',
        ondeMedir: 'TP5 (antes) e TP7 (depois), ponta preta no GND.',
        valorEsperado: 'TP5 ≈ 24V e TP7 ≈ 23,3V. TP7 em 0V com TP5 normal indica D3 aberto.',
      },
      tp('TP5', 830, 520, {
        codigo: 'TP5 - Entrada 24V', especificacao: 'Ponto de teste da entrada antes do D3.',
        funcao: 'Confirma a chegada dos 24V do fio vermelho.', ondeMedir: 'Ponta vermelha em TP5, ponta preta no GND.',
        valorEsperado: '~24V.',
      }),
      tp('TP7', 712, 520, {
        codigo: 'TP7 - Pós D3', especificacao: 'Ponto de teste depois do diodo de proteção.',
        funcao: 'Confirma que o D3 está conduzindo e alimentando a fonte step-down.', ondeMedir: 'Ponta vermelha em TP7, ponta preta no GND.',
        valorEsperado: '~23,3V (24V menos a queda do D3).',
      }),
      {
        id: 'D5', label: 'D5', kind: 'diode', x: 650, y: 500, w: 30, h: 16, seedRef: 'FONTE_24V_5V',
      },
      { id: 'C18', label: 'C18', kind: 'cap', x: 590, y: 500, w: 30, h: 20, seedRef: 'FONTE_24V_5V' },
      { id: 'L1', label: 'L1', kind: 'ind', x: 515, y: 495, w: 52, h: 40, seedRef: 'FONTE_24V_5V' },
      { id: 'D4', label: 'D4', kind: 'diode', x: 440, y: 500, w: 30, h: 16, seedRef: 'FONTE_24V_5V' },
      tp('TP8', 385, 500, {
        codigo: 'TP8 - Saída regulada +5V', especificacao: 'Saída da fonte step-down (mesmo nó do Pino 16 do U4).',
        funcao: 'Alimenta processador, LCD, U4 e a placa de teclas.', ondeMedir: 'Ponta vermelha em TP8, ponta preta no GND.',
        valorEsperado: '+5,0V estável (sem oscilação).',
      }),
      tp('TP3', 110, 330, {
        codigo: 'TP3 - Debug', especificacao: 'Ponto de teste ligado ao processador (função de depuração).',
        funcao: 'Linha de debug/programação do processador.', ondeMedir: 'Ponta vermelha em TP3, ponta preta no GND.',
        valorEsperado: '+5V em repouso.',
      }),
      tp('TP4', 200, 440, {
        codigo: 'TP4 - Linha de teclas', especificacao: 'Ponto de teste da comunicação com a placa de teclas.',
        funcao: 'Sinal vindo do U1 da BD4039 pelo conector de 12 pinos até o processador.',
        ondeMedir: 'Ponta vermelha em TP4, ponta preta no GND; observar variação ao pressionar teclas.',
        valorEsperado: '+5V em repouso.',
      }),
      tp('TP6', 255, 440, {
        codigo: 'TP6 - Linha de teclas', especificacao: 'Ponto de teste da comunicação com a placa de teclas.',
        funcao: 'Sinal vindo do U1 da BD4039 pelo conector de 12 pinos até o processador.',
        ondeMedir: 'Ponta vermelha em TP6, ponta preta no GND; observar variação ao pressionar teclas.',
        valorEsperado: '+5V em repouso.',
      }),
      {
        id: 'CN12', label: 'Conector 12 pinos', kind: 'conn', x: 180, y: 515, w: 250, h: 20,
        codigo: 'Conector fêmea de 12 pinos', especificacao: 'Interligação BD4038 ↔ BD4039 (placa de teclas).',
        funcao: 'Leva +5V/GND, as 4 linhas do U1 (via R1, R16, R13, R7) e a alimentação dos LEDs D1-D6 (backlight das teclas).',
        ondeMedir: 'Continuidade pino a pino entre as placas; +5V e GND com o teclado ligado.',
        valorEsperado: 'Terminais limpos e sem oxidação; +5V presente.',
      },
    ],
  },

  bd4039: {
    id: 'bd4039',
    titulo: 'Placa de Teclas',
    codigo: 'APB PRODATA BD4039 REV01',
    viewBox: [1000, 460],
    hotspots: [
      ...KEYS.map((k) => {
        const p = keyPosition(k);
        return {
          id: `PAD_${k.pcb}`, label: k.pcb, kind: 'pad', x: p.x, y: p.y, w: 74, h: 62, keyId: k.id,
          codigo: `Pastilha da tecla ${k.label}${k.sub ? ` (${k.sub})` : ''} — marcação "${k.pcb}"`,
          especificacao: 'Trilha interdigitada de cobre (pente duplo) acionada pela pastilha condutiva da manta de silicone.',
          funcao: 'Fecha o contato da tecla na matriz lida pelo U1.',
          ondeMedir: 'Multímetro em continuidade/ohms entre os dois pentes da trilha com a manta pressionada.',
          valorEsperado: 'Aberto em repouso; poucas centenas de ohms ou menos pressionando.',
        };
      }),
      {
        id: 'U1', label: 'U1', kind: 'ic', x: 500, y: 310, w: 62, h: 62,
        codigo: 'U1 - Controlador de teclado (código a levantar)', especificacao: 'Chip quadrado TQFP de 32 pernas.',
        funcao: 'Varre a matriz das 16 teclas e envia o resultado ao processador da BD4038 por 4 trilhas (R1, R16, R13, R7).',
        ondeMedir: '+5V e GND nos pinos de alimentação; sinais nas 4 trilhas de saída ao pressionar teclas.',
        valorEsperado: '+5V de alimentação; atividade nas trilhas ao pressionar.',
      },
      ...['R1', 'R16', 'R13', 'R7'].map((id, i) => ({
        id, label: id, kind: 'res', x: 440 + i * 40, y: 372, w: 28, h: 12,
        codigo: `${id} - Resistor da trilha de comunicação`, especificacao: 'Resistor SMD em série (valor a levantar).',
        funcao: 'Uma das 4 trilhas que levam os sinais do U1 até o conector de 12 pinos.',
        ondeMedir: 'Resistência desligado; continuidade do U1 até o pino correspondente do conector.',
        valorEsperado: 'Valor estável igual ao do resistor equivalente nas outras trilhas.',
      })),
      ...[['D1', 'R19', 90], ['D2', 'R20', 170], ['D3', 'R21', 250]].flatMap(([d, r, y]) => led(d, r, 30, y, 'esquerda')),
      ...[['D4', 'R8', 90], ['D5', 'R9', 170], ['D6', 'R18', 250]].flatMap(([d, r, y]) => led(d, r, 970, y, 'direita')),
      {
        id: 'CN12_T', label: 'Conector 12 pinos', kind: 'conn', x: 500, y: 418, w: 240, h: 18,
        codigo: 'Conector de 12 pinos (lado teclas)', especificacao: 'Liga a BD4039 à BD4038.',
        funcao: 'Recebe +5V/GND e a alimentação dos LEDs; envia as 4 linhas do U1.',
        ondeMedir: 'Continuidade pino a pino até a placa principal.',
        valorEsperado: 'Terminais limpos; continuidade em todos os pinos.',
      },
    ],
  },

  borne: {
    id: 'borne',
    titulo: 'Borne e Chicote',
    codigo: 'Borne traseiro 4 fios — 24V / 1,0A',
    viewBox: [900, 460],
    hotspots: [
      wire('W1', '1 · Branco', 'RX do teclado', 110, '#e5e7eb',
        'Recebe dados do validador. Caminho: Fio Branco → C15 → R19 (47 Ω) → Pino 13 (R1IN) do U4.',
        'Pino 13 do U4 com ponta preta no Pino 15.', 'Nível RS-232 vindo do validador; sem curto para GND.'),
      wire('W2', '2 · Verde', 'TX do teclado', 200, '#22c55e',
        'Envia dados ao validador. Caminho: Pino 14 (T1OUT) do U4 → R25 (10 Ω) → C17 → Fio Verde.',
        'Fio verde em relação ao GND, teclado ligado em repouso.', '-5V a -9V em repouso (igual ao Pino 14 e depois do R25).'),
      wire('W3', '3 · Cinza/Preto', 'GND', 290, '#6b7280',
        'Referência comum de alimentação e da serial. Vai ao Pino 15 (GND) do U4.',
        'Continuidade entre o fio e o Pino 15 do U4.', '0 Ω (continuidade).'),
      wire('W4', '4 · Vermelho', '+24V', 380, '#ef4444',
        'Alimentação do ônibus. Caminho: Fio Vermelho → TP5 → D3 → TP7 → fonte step-down → TP8 (+5V).',
        'Entre o fio vermelho e o cinza/preto, teclado ligado.', '~24V (fonte de bancada: 24V limitada a 300 mA).'),
    ],
  },
};

function led(d, r, x, y, lado) {
  const inner = lado === 'esquerda' ? x + 48 : x - 48;
  return [
    {
      id: `LED_${d}`, label: d, kind: 'led', x, y, w: 22, h: 16,
      codigo: `${d} - LED SMD de iluminação das teclas (borda ${lado})`, especificacao: `LED SMD alimentado através do resistor ${r}.`,
      funcao: 'Ilumina a membrana por trás. Alimentado pelo driver de backlight (Q3/D2) da placa principal via conector de 12 pinos.',
      ondeMedir: `Multímetro em teste de diodo sobre o LED (ponta vermelha no anodo); tensão sobre ${r} com o backlight ligado.`,
      valorEsperado: 'Acende fraco no teste de diodo (~2,5V a 3V de queda em LED azul/branco). Queda de tensão em ' + r + ' com backlight ligado.',
    },
    {
      id: `R_${r}`, label: r, kind: 'res', x: inner, y, w: 28, h: 12,
      codigo: `${r} - Resistor limitador do ${d}`, especificacao: 'Resistor SMD (valor a levantar).',
      funcao: `Limita a corrente do LED ${d}.`,
      ondeMedir: 'Resistência com o teclado desligado.',
      valorEsperado: `Mesmo valor dos outros resistores de LED da borda ${lado}.`,
    },
  ];
}

function wire(id, label, sinal, y, color, funcao, ondeMedir, valorEsperado) {
  return {
    id, label, kind: 'wire', x: 150, y, w: 120, h: 40, color, sinal,
    codigo: `Pino ${label} — ${sinal}`, especificacao: `Fio ${label.split('· ')[1]} do chicote de 4 fios.`,
    funcao, ondeMedir, valorEsperado,
  };
}

export const STATUS = {
  normal: { label: 'Normal / Verificado', dot: '🟢', fill: '#22c55e', ring: 'ring-green-500', text: 'text-green-400' },
  pendente: { label: 'Selecionado ou ainda não visto', dot: '🟡', fill: '#eab308', ring: 'ring-yellow-500', text: 'text-yellow-400' },
  suspeito: { label: 'Ponto suspeito deste teclado', dot: '🔴', fill: '#ef4444', ring: 'ring-red-500', text: 'text-red-400' },
  oxidacao: { label: 'Oxidação observada', dot: '🟠', fill: '#f97316', ring: 'ring-orange-500', text: 'text-orange-400' },
};
