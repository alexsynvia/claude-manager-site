const OWNER = 'teixeiramatheus9';
const REPO = 'claude-manager';
const CURL_CMD = 'curl -fsSL https://get.claude-manager.dev | sh';

// Versão e links reais vêm da release mais recente; sem API, ficam os
// placeholders do design e o link /releases/latest.
async function loadRelease() {
  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rel = await res.json();
    const version = (rel.tag_name || '').replace(/^v/, '');
    if (!version) return;

    for (const el of document.querySelectorAll('.js-version')) el.textContent = version;

    const files = {
      exe: { name: `claude-manager-setup-${version}-x64.exe` },
      dmg: { name: `claude-manager-${version}.dmg`, suffix: ' · universal (intel + apple silicon)' },
      appimage: { name: `claude-manager-${version}.AppImage`, suffix: ' · x64 / arm64' },
    };
    for (const asset of rel.assets || []) {
      const n = asset.name;
      const key = n.endsWith('.exe')
        ? 'exe'
        : n.endsWith('.dmg')
          ? 'dmg'
          : n.endsWith('.AppImage')
            ? 'appimage'
            : null;
      if (key && !files[key].url) {
        files[key].url = asset.browser_download_url;
        files[key].name = n;
      }
    }
    for (const [key, f] of Object.entries(files)) {
      document.getElementById(`file-${key}`).textContent = f.name + (f.suffix || '');
      if (f.url) document.getElementById(`dl-${key}`).href = f.url;
    }
  } catch {
    /* placeholders permanecem */
  }
}

function initCopy() {
  const btn = document.getElementById('copy-btn');
  let t;
  btn.addEventListener('click', () => {
    if (navigator.clipboard) navigator.clipboard.writeText(CURL_CMD);
    btn.textContent = 'copiado ✓';
    clearTimeout(t);
    t = setTimeout(() => {
      btn.textContent = 'copiar';
    }, 1800);
  });
}

loadRelease();
initCopy();
