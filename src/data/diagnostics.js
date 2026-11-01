// Subsistemas do DK620 em cadeias de blocos (fluxo de sinal).
export const SUBSYSTEMS = [
  {
    id: 'fonte',
    titulo: 'Entrada 24V e Fonte Step-Down (24V → 5V)',
    cor: '#ef4444',
    blocos: [
      { id: 'f1', t: 'Fio Vermelho +24V', d: 'Pino 4 do borne. Fio Cinza/Preto (pino 3) é o GND.', medir: 'Vermelho × GND: ~24V' },
      { id: 'f2', t: 'TP5', d: 'Entrada antes do diodo de proteção.', medir: '~24V' },
      { id: 'f3', t: 'D3', d: 'Diodo de proteção contra inversão de polaridade.', medir: 'Queda ~0,7V (TP5 → TP7)' },
      { id: 'f4', t: 'TP7', d: 'Linha de 24V depois do D3, alimentando a fonte.', medir: '~23,3V' },
      { id: 'f5', t: 'D5 · C18 · L1 · D4', d: 'Conversor DC-DC step-down: chaveamento, filtro, indutor e diodo.', medir: 'L1 sem aquecimento excessivo; C18 sem estufamento' },
      { id: 'f6', t: 'TP8 / U4 pino 16', d: 'Saída regulada que alimenta toda a lógica.', medir: '+5,0V estável' },
    ],
  },
  {
    id: 'tx',
    titulo: 'Comunicação Serial RS-232 — TX (U4 = ST232C)',
    cor: '#22c55e',
    blocos: [
      { id: 't1', t: 'Processador', d: 'Gera os dados em TTL (0–5V).', medir: '—' },
      { id: 't2', t: 'TP1', d: 'TX nível TTL.', medir: '+5V em repouso, pulsos a 0V' },
      { id: 't3', t: 'R18 (1 kΩ)', d: "Código '102'.", medir: '1 kΩ desligado' },
      { id: 't4', t: 'U4 pino 11 T1IN', d: 'Entrada TTL do transmissor.', medir: '+5V em repouso' },
      { id: 't5', t: 'U4 pino 14 T1OUT', d: 'Saída RS-232 do transmissor.', medir: '-5V a -9V em repouso' },
      { id: 't6', t: 'R25 (10 Ω)', d: "Código '100'. Proteção em série.", medir: 'Mesma tensão do pino 14' },
      { id: 't7', t: 'C17', d: 'Capacitor da linha TX.', medir: 'Continuidade até o borne' },
      { id: 't8', t: 'Fio Verde (TX)', d: 'Pino 2 do borne → validador.', medir: '-5V a -9V em repouso' },
    ],
  },
  {
    id: 'rx',
    titulo: 'Comunicação Serial RS-232 — RX (U4 = ST232C)',
    cor: '#e5e7eb',
    blocos: [
      { id: 'r1', t: 'Fio Branco (RX)', d: 'Pino 1 do borne ← validador.', medir: 'Nível RS-232 do validador' },
      { id: 'r2', t: 'C15', d: 'Capacitor da linha RX.', medir: 'Sem curto para GND' },
      { id: 'r3', t: 'R19 (47 Ω)', d: "Código '470'. Proteção em série.", medir: '47 Ω desligado' },
      { id: 'r4', t: 'U4 pino 13 R1IN', d: 'Entrada RS-232 do receptor.', medir: 'Sinal do validador' },
      { id: 'r5', t: 'U4 pino 12 R1OUT', d: 'Saída TTL do receptor.', medir: '+5V em repouso' },
      { id: 'r6', t: 'R21 (1 kΩ)', d: "Código '102'.", medir: '1 kΩ desligado' },
      { id: 'r7', t: 'TP2', d: 'RX nível TTL.', medir: '+5V em repouso, pulsos a 0V' },
      { id: 'r8', t: 'Processador', d: 'Recebe os comandos do validador.', medir: '—' },
    ],
  },
  {
    id: 'backlight',
    titulo: 'Driver de Backlight (Q3, D2, R28, R36)',
    cor: '#60a5fa',
    blocos: [
      { id: 'b1', t: 'Processador', d: 'Comando liga/desliga do backlight.', medir: '—' },
      { id: 'b2', t: 'R36 · R28 (4,7 kΩ)', d: "Código '472'. Polarização da base.", medir: '4,7 kΩ cada' },
      { id: 'b3', t: 'Q3 (SOT-23)', d: 'Transistor chaveador.', medir: 'Tensão na base/coletor' },
      { id: 'b4', t: 'D2 (SOD-123)', d: 'Diodo da saída do driver.', medir: 'Condução normal no teste de diodo' },
      { id: 'b5', t: 'J2 pino 15 (LCD)', d: 'Anodo do backlight azul do LCD 16x2.', medir: 'Tensão presente com backlight aceso' },
      { id: 'b6', t: 'Conector 12 pinos → LEDs D1–D6', d: 'Iluminação das teclas na BD4039 (R19–R21 / R8, R9, R18).', medir: 'Tensão sobre os resistores dos LEDs' },
    ],
  },
  {
    id: 'teclas',
    titulo: 'Varredura de Teclas',
    cor: '#facc15',
    blocos: [
      { id: 'k1', t: 'Matriz 16 teclas', d: 'Trilhas interdigitadas + manta de silicone.', medir: 'Continuidade ao pressionar' },
      { id: 'k2', t: 'U1 (TQFP-32)', d: 'Controlador local da placa de teclas.', medir: '+5V de alimentação' },
      { id: 'k3', t: 'R1 · R16 · R13 · R7', d: '4 trilhas de comunicação.', medir: 'Valores iguais entre si' },
      { id: 'k4', t: 'Conector 12 pinos', d: 'BD4039 → BD4038.', medir: 'Terminais limpos, continuidade' },
      { id: 'k5', t: 'TP4 · TP6', d: 'Pontos de teste na placa principal.', medir: '+5V em repouso' },
      { id: 'k6', t: 'Processador', d: 'Recebe a tecla e envia ao validador.', medir: '—' },
    ],
  },
];

// Mensagens do LCD observadas em operação normal no ônibus (vídeo de 20/10/2026,
// teclado montado sobre o OM-7000). Servem de referência de funcionamento.
export const LCD_MESSAGES = [
  {
    linhas: ['TRECHO:', ''],
    quando: 'Tela de espera: o validador pede o número do trecho.',
    significa: 'Confirmado em campo: o LCD exibe texto vindo do validador. Teclado alimentado e caminho RX (fio branco → U4 → TP2 → processador) funcionando.',
    tipo: 'ok',
  },
  {
    linhas: ['TRECHO:8', ''],
    quando: 'Cada tecla numérica aparece logo após o "TRECHO:".',
    significa: 'Tecla registrada: pastilha, U1, conector de 12 pinos e processador ok. Se um número não aparece, teste aquela tecla no Testador de Teclas.',
    tipo: 'ok',
  },
  {
    linhas: ['De: M.PEREIR████', 'Para: TRES RIO██'],
    quando: 'Depois de confirmar um trecho, o validador devolve a linha que está selecionada nele (ex.: Miguel Pereira × Três Rios, Arcozelo × Japeri). Trocou a linha no validador, muda aqui também.',
    significa: 'Comunicação nos dois sentidos ok (TX e RX do U4). Os blocos (█) no fim das linhas são normais: indicam digitação em espera (campo aguardando entrada). Não é defeito do LCD.',
    tipo: 'info',
  },
  {
    linhas: ['NAO ENCONTRADO', ''],
    quando: 'O trecho digitado não existe na tabela da linha selecionada no validador.',
    significa: 'Resposta normal do validador. É uma questão de dados/cadastro, não defeito do teclado.',
    tipo: 'info',
  },
];

// Telas do validador (OM-7000) quando o trecho chega pelo DK620. Fotos de
// 07/10/2026; valores servem só de exemplo de formato.
export const VALIDATOR_SCREENS = [
  { linhas: ['Trecho 9:', 'VENDA A  7,50 041', 'VT-CONVE 7,50 046', 'EXPRESSO 7,50 005'] },
  { linhas: ['Trecho 18:', 'VENDA A  14,45 001'] },
];

export const VALIDATOR_LEGEND = [
  ['Trecho N:', 'O número digitado no DK620. Se aparece aqui, o envio (TX) do teclado funcionou.'],
  ['VENDA A / VT-CONVE / EXPRESSO', 'Tipos de tarifa do trecho, com o valor em R$. Alguns trechos têm só uma tarifa.'],
  ['Número de 3 dígitos', 'Provavelmente contador por tarifa (a confirmar).'],
  ['Prefixo / Data', 'Número do carro e relógio do validador (rodapé da tela).'],
];

// Sintomas → testes na ordem em que devem ser feitos.
export const SYMPTOMS = [
  {
    id: 'naoliga',
    titulo: 'Não liga',
    resumo: 'LCD apagado, sem backlight e sem resposta.',
    subsistema: 'fonte',
    passos: [
      { t: 'Fonte de bancada em 24V com limite de 300 mA. Meça entre Fio Vermelho e Fio Cinza/Preto no borne.', esperado: '~24V', se: 'Sem tensão: problema no chicote/fonte externa.' },
      { t: 'Inspecione os 8 pontos de solda do borne traseiro.', esperado: 'Soldas brilhantes, sem crosta', se: 'Crosta/oxidação: limpe com álcool isopropílico e ressolde.' },
      { t: 'Meça TP5.', esperado: '~24V', se: '0V em TP5 com 24V no borne: trilha/solda do borne aberta.' },
      { t: 'Meça TP7 (após D3).', esperado: '~23,3V', se: 'TP5 normal e TP7 em 0V: D3 aberto.' },
      { t: 'Meça TP8 e Pino 16 do U4.', esperado: '+5,0V', se: 'TP7 ok e TP8 em 0V/baixo: fonte step-down (D5, C18, L1, D4). Corrente no limite da fonte indica curto na linha de 5V.' },
    ],
  },
  {
    id: 'serial',
    titulo: 'Sem comunicação TX/RX',
    resumo: 'Liga, mas o validador não recebe as teclas ou não envia mensagens.',
    subsistema: 'tx',
    passos: [
      { t: 'Teste de ponta a ponta no ônibus: digite um trecho no DK620 e confirme. Olhe a tela do validador e depois o LCD do teclado.', esperado: 'Validador mostra "Trecho N:" com as tarifas (TX ok) e o teclado mostra "De:/Para:" da linha selecionada (RX ok)', se: 'Validador não muda: falha no envio (U4 pino 14, R25, C17, fio verde). Validador muda mas "De:/Para:" não chega: falha na recepção (fio branco, C15, R19, U4 pinos 13/12, TP2).' },
      { t: 'Inspecione U4 (ST232C) — especialmente entre os pinos 13 (RX) e 14 (TX) — e o borne.', esperado: 'Sem oxidação', se: 'Oxidação: limpeza química com álcool isopropílico 99,8% (caso REP-001).' },
      { t: 'Ponta preta no Pino 15 do U4. Meça o Pino 16.', esperado: '+5V', se: 'Sem 5V: voltar ao diagnóstico “Não liga”.' },
      { t: 'Meça Pino 2 (V+) e Pino 6 (V−) do U4.', esperado: '+8,5V a +10V / −8,5V a −10V', se: 'Fora da faixa: bomba de carga do U4 (capacitores externos) ou U4 defeituoso.' },
      { t: 'Meça Pino 14 (T1OUT) em repouso.', esperado: '−5V a −9V', se: 'Pino 14 em 0V: U4 com falha ou curto na linha TX.' },
      { t: 'Meça depois do R25.', esperado: 'Igual ao Pino 14', se: 'Pino 14 normal e 0V depois do R25: R25 aberto.' },
      { t: 'Meça TP1 e TP2.', esperado: '+5V em repouso', se: 'TP1 em 0V: processador/R18. TP2 em 0V: Pino 12 do U4/R21.' },
      { t: 'Confirme com o Simulador de Validador (aba Serial).', esperado: 'Bytes chegam ao pressionar teclas', se: 'Nada chega: teste outro baud rate e a ligação TX/RX cruzada.' },
    ],
  },
  {
    id: 'teclas',
    titulo: 'Teclas inoperantes',
    resumo: 'Uma, várias ou todas as teclas não respondem.',
    subsistema: 'teclas',
    passos: [
      { t: 'Use o Testador de Teclas para mapear quais falham.', esperado: 'Todas com contato', se: 'Só algumas: trilha interdigitada suja ou manta gasta.' },
      { t: 'Limpe trilhas e pastilhas da manta com álcool isopropílico.', esperado: 'Continuidade ao pressionar', se: 'Persistindo: pastilha da manta gasta — substitua a manta.' },
      { t: 'Inspecione o conector de 12 pinos (os dois lados).', esperado: 'Terminais limpos', se: 'Sujeira/oxidação: limpe (caso REP-001).' },
      { t: 'Meça +5V no U1 da BD4039.', esperado: '+5V', se: 'Sem 5V: conector/cabo entre as placas.' },
      { t: 'Meça R1, R16, R13 e R7 e a continuidade até o conector.', esperado: 'Valores iguais', se: 'Diferente/aberto: substitua o resistor.' },
      { t: 'Meça TP4 e TP6 na placa principal.', esperado: '+5V em repouso', se: 'Sem variação ao pressionar com U1 alimentado: suspeita no U1.' },
    ],
  },
  {
    id: 'agua',
    titulo: 'Uma tecla não funciona (água/umidade)',
    resumo: 'Uma tecla específica não responde; as outras e o LCD estão normais.',
    subsistema: 'teclas',
    passos: [
      { t: 'No ônibus, digite um trecho usando várias teclas e observe se cada número aparece após "TRECHO:".', esperado: 'Todos os números aparecem', se: 'Só um número falha: suspeita localizada naquela tecla.' },
      { t: 'Desmonte e procure água ou umidade sob a membrana, na manta de silicone e na trilha da tecla.', esperado: 'Seco e limpo', se: 'Água/umidade (caso da tecla 9): seque, limpe com álcool isopropílico e deixe secar bem antes de montar.' },
      { t: 'Inspecione a trilha interdigitada e a pastilha da tecla com lupa.', esperado: 'Cobre brilhante, sem manchas', se: 'Oxidação ou resíduo: limpe; trilha corroída exige reparo da trilha.' },
      { t: 'Meça a continuidade da trilha com a manta pressionada (Testador de Teclas).', esperado: 'Continuidade ao pressionar', se: 'Sem continuidade depois de limpo: pastilha da manta gasta.' },
      { t: 'Verifique a vedação (anel de borracha) e as juntas da caixa antes de reinstalar.', esperado: 'Vedação inteira e assentada', se: 'Vedação solta ou deformada: recoloque ou troque para evitar reincidência.' },
    ],
  },
  {
    id: 'backlight',
    titulo: 'Sem iluminação (Backlight)',
    resumo: 'Texto aparece, mas LCD e/ou teclas ficam apagados.',
    subsistema: 'backlight',
    passos: [
      { t: 'Meça R28 e R36 desligado.', esperado: '4,7 kΩ cada', se: 'Aberto/alterado: substitua.' },
      { t: 'Teste D2 em escala de diodo.', esperado: 'Condução em um sentido só', se: 'Aberto ou em curto: substitua D2.' },
      { t: 'Ligado: meça base e coletor do Q3.', esperado: 'Chaveia com o comando do processador', se: 'Base com comando e coletor sem chavear: Q3 defeituoso.' },
      { t: 'Meça o Pino 15 de J2.', esperado: 'Tensão presente com backlight aceso', se: 'Tensão ok e LCD apagado: backlight do módulo LCD.' },
      { t: 'Só as teclas apagadas: meça os LEDs D1–D6 e R19–R21 / R8, R9, R18.', esperado: 'LEDs acendem no teste de diodo', se: 'Todos apagados: conector de 12 pinos. Um só: LED ou resistor dele.' },
    ],
  },
  {
    id: 'lcd',
    titulo: 'LCD acende sem texto',
    resumo: 'Backlight aceso, mas sem caracteres ou só blocos.',
    subsistema: 'fonte',
    passos: [
      { t: 'Primeiro confirme onde está testando: o texto do LCD (ex.: "TRECHO:") é enviado pelo validador. Na bancada, sem validador, a tela vazia pode ser normal.', esperado: 'No ônibus (ou com outro teclado bom na mesma bancada) aparece "TRECHO:"', se: 'Teclado bom também fica sem texto na bancada: não é defeito. Teste no ônibus.' },
      { t: 'No ônibus, sem texto: confira o fio branco (RX) e a cadeia C15 → R19 → U4 pino 13 → pino 12 → R21 → TP2.', esperado: 'TP2 em +5V com pulsos ao chegar dados', se: 'Sem pulsos em TP2 com dados no fio branco: U4 (receptor) ou R19/R21.' },
      { t: 'Meça TP8.', esperado: '+5,0V estável', se: 'Baixo/oscilando: fonte step-down (C18, L1, D4, D5).' },
      { t: 'Retire o LCD (4 parafusos) e inspecione o soquete J2 de 16 pinos.', esperado: 'Pinos limpos e firmes', se: 'Oxidação/mau contato: limpe e reencaixe.' },
      { t: 'Verifique o ajuste de contraste do LCD, se houver trimpot.', esperado: 'Caracteres visíveis', se: 'Linha inteira de blocos cheios: contraste ou LCD não inicializado. (Poucos blocos no fim de "De:/Para:" são normais: digitação em espera.)' },
      { t: 'Meça TP3 (debug).', esperado: '+5V em repouso', se: 'Anormal: suspeita no processador (código ainda a levantar).' },
      { t: 'Troque por um LCD 16x2 sabidamente bom.', esperado: 'Texto aparece', se: 'Continua sem texto: processador/oscilador.' },
    ],
  },
];
