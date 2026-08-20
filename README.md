# vizor-site

Landing page do [Vizor](https://github.com/teixeiramatheus9/vizor) —
monitor de sessões do Claude Code nos seus terminais.

Página estática (HTML/CSS/JS puro, sem build), recriação pixel-perfect do
design handoff "Landing Page — Vizor" (tema Monocromo: só cinzas
sobre preto; o âmbar `#D29922` é a única cor e marca apenas "espera você").

- Versão e links de download vêm da API de releases do GitHub em runtime;
  sem API, ficam os placeholders do design e o link `/releases/latest`.
- Fontes: IBM Plex Mono e Jersey 25 (Google Fonts).

## Desenvolvimento

Abre o `index.html` no navegador. É isso.

## Deploy

Hospedado na Vercel — importar o repositório como projeto estático
(sem build command, output na raiz).
