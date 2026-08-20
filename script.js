const OWNER = 'teixeiramatheus9';
const REPO = 'vizor';
const CURL_CMD = 'curl -fsSL https://get.vizor.dev | sh';

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
      exe: { name: `Vizor-Setup-${version}.exe` },
      dmg: { name: `Vizor-${version}-arm64.dmg`, suffix: ' · apple silicon' },
      appimage: { name: `Vizor-${version}.AppImage`, suffix: ' · x64 / arm64' },
      deb: { name: `vizor_${version}_amd64.deb`, suffix: ' · ubuntu / debian / mint' },
      rpm: { name: `vizor-${version}.x86_64.rpm`, suffix: ' · fedora / opensuse' },
    };
    for (const asset of rel.assets || []) {
      const n = asset.name;
      const key = n.endsWith('.exe')
        ? 'exe'
        : n.endsWith('.dmg')
          ? 'dmg'
          : n.endsWith('.AppImage')
            ? 'appimage'
            : n.endsWith('.deb')
              ? 'deb'
              : n.endsWith('.rpm')
                ? 'rpm'
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

function initLinuxModal() {
  const modal = document.getElementById('modal-linux');
  document.getElementById('more-linux').addEventListener('click', () => {
    modal.classList.remove('hidden');
  });
  const close = () => modal.classList.add('hidden');
  document.getElementById('modal-close').addEventListener('click', close);
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
}

loadRelease();
initCopy();
initLinuxModal();
