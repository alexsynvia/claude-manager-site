# claude-manager-site

Landing page do [Claude Manager](https://github.com/teixeiramatheus9/claude-manager) —
o gerente flutuante das sessões do Claude Code.

Página estática (HTML/CSS/JS puro, sem build) servida pelo GitHub Pages.

- Detecta o SO do visitante e destaca o download certo (AppImage no Linux, dmg no macOS).
- Busca a versão mais recente via API de releases do GitHub em runtime; se a API
  falhar (repo privado, rate limit, offline), os links caem no `/releases/latest`.
- Usa a identidade visual do app: IBM Plex Mono, paleta e os 7 temas do renderer.

## Desenvolvimento

Abre o `index.html` no navegador. É isso.
