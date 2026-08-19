const OWNER = 'teixeiramatheus9';
const REPO = 'claude-manager';
const RELEASES_LATEST = `https://github.com/${OWNER}/${REPO}/releases/latest`;

// --- OS detection ---
function detectOS() {
  const ua = navigator.userAgent;
  if (/Mac/i.test(ua)) return 'mac';
  if (/Linux|X11/i.test(ua) && !/Android/i.test(ua)) return 'linux';
  return 'other';
}

function assetExt(name) {
  if (name.endsWith('.AppImage')) return 'AppImage';
  if (name.endsWith('.deb')) return 'deb';
  if (name.endsWith('.rpm')) return 'rpm';
  if (name.endsWith('.dmg')) return 'dmg';
  return null;
}

const CTA_BY_OS = {
  linux: { ext: 'AppImage', label: 'Baixar para Linux (.AppImage)' },
  mac: { ext: 'dmg', label: 'Baixar para macOS (.dmg)' },
  other: { ext: null, label: 'Baixar o Claude Manager' },
};

async function loadRelease() {
  const os = detectOS();
  const cta = document.getElementById('dl-cta');
  const ctaLabel = document.getElementById('dl-cta-label');
  ctaLabel.textContent = CTA_BY_OS[os].label;

  try {
    const res = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/releases/latest`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const rel = await res.json();

    document.getElementById('dl-version').textContent = rel.tag_name;

    const byExt = {};
    for (const asset of rel.assets || []) {
      const ext = assetExt(asset.name);
      if (ext && !byExt[ext]) byExt[ext] = asset.browser_download_url;
    }

    const wanted = CTA_BY_OS[os].ext;
    if (wanted && byExt[wanted]) cta.href = byExt[wanted];

    for (const link of document.querySelectorAll('.dl-links a[data-ext]')) {
      const url = byExt[link.dataset.ext];
      if (url) link.href = url;
    }
  } catch {
    // Repo private, rate-limited or offline: static /releases/latest links stay.
  }
}

// --- theme cycling (same themes as the app) ---
const THEMES = ['padrão', 'ambar', 'magenta', 'ciano', 'mono', 'magma', 'matrix'];

function applyTheme(name) {
  if (name === 'padrão') delete document.body.dataset.theme;
  else document.body.dataset.theme = name;
  document.getElementById('theme-btn').textContent = `[tema: ${name}]`;
}

function initTheme() {
  let current = localStorage.getItem('theme');
  if (!THEMES.includes(current)) current = 'padrão';
  applyTheme(current);
  document.getElementById('theme-btn').addEventListener('click', () => {
    current = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];
    localStorage.setItem('theme', current);
    applyTheme(current);
  });
}

// --- hero demo: manager toast cycle ---
const DEMO_MESSAGES = [
  {
    mark: '✓',
    warn: false,
    project: 'api-pagamentos',
    text: 'Pronto, chefe! Os testes passaram e o refactor tá no ar.',
  },
  {
    mark: '?',
    warn: true,
    project: 'landing-page',
    text: 'Opa, o chat tá esperando você: qual banco a gente usa aqui?',
  },
  {
    mark: '✓',
    warn: false,
    project: 'scraper-notas',
    text: 'Fechado! Deploy feito e os testes tão verdes. Pode conferir.',
  },
  {
    mark: '!',
    warn: true,
    project: 'api-pagamentos',
    text: 'Chefe, preciso da sua permissão pra rodar as migrations.',
  },
];

function initDemo() {
  const toast = document.getElementById('demo-toast');
  const mark = document.getElementById('demo-mark');
  const project = document.getElementById('demo-project');
  const text = document.getElementById('demo-text');
  const badge = document.getElementById('demo-badge');
  let i = 0;

  setInterval(() => {
    toast.classList.add('gone');
    setTimeout(() => {
      i = (i + 1) % DEMO_MESSAGES.length;
      const m = DEMO_MESSAGES[i];
      mark.textContent = m.mark;
      mark.classList.toggle('warn', m.warn);
      badge.classList.toggle('waiting', m.warn);
      project.textContent = m.project;
      text.textContent = m.text;
      toast.classList.remove('gone');
      // restart the slide-in animation
      toast.style.animation = 'none';
      void toast.offsetWidth;
      toast.style.animation = '';
    }, 900);
  }, 6000);
}

loadRelease();
initTheme();
initDemo();
