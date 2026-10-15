# DK620 Bancada

Sistema interativo de diagnóstico e manutenção do teclado de seccionamento **Prodata DK620 (P0050004)** — placas BD4038 REV00 e BD4039 REV01.

- Mapa interativo das placas com hotspots, fotos e status por componente
- Testador de teclas (16 teclas) com guia de contato, caminho do sinal e LEDs
- Fluxo de sinal e assistente de diagnóstico por sintoma
- Simulador de validador via Web Serial API (Chrome/Edge desktop)
- Registros de reparo com comparação automática contra a referência de um teclado bom
- Persistência em `localStorage` com exportação/importação JSON

```bash
npm install
npm run dev     # desenvolvimento
npm run build   # gera dist/ (deploy estático na Vercel)
```
