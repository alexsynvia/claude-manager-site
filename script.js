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
  for (const btn of document.querySelectorAll('.copy-cmd')) {
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

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Intro: ">_" no centro, o ">" gira e vira o V, "IZOR" é digitado e a tela
// abre pro site. Clique pula direto.
function initIntro(onDone) {
  const intro = document.getElementById('intro');
  if (!intro || REDUCED_MOTION) {
    if (intro) intro.remove();
    onDone();
    return;
  }
  document.body.classList.add('intro-lock');
  const v = intro.querySelector('.intro-v');
  const rest = document.getElementById('intro-rest');

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    document.body.classList.remove('intro-lock');
    intro.classList.add('out');
    setTimeout(() => intro.remove(), 700);
    onDone();
  };
  intro.addEventListener('click', finish);

  const WORD = 'IZOR';
  let i = 0;
  const typeNext = () => {
    if (finished) return;
    i += 1;
    rest.textContent = WORD.slice(0, i);
    if (i < WORD.length) setTimeout(typeNext, 180);
    else setTimeout(finish, 1000);
  };
  setTimeout(() => v.classList.add('flip'), 900);
  setTimeout(typeNext, 1700);
}

function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) {
    for (const el of els) el.classList.add('in');
    return;
  }
  const obs = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      }
    },
    { threshold: 0.1 },
  );
  for (const el of els) obs.observe(el);
}

// Temas portados do app (src/main/themes.js); a rotação automática para no
// primeiro clique num swatch.
const THEMES = {
  mono: 'monocromo escuro',
  aco: 'azul-aço',
  ambar: 'âmbar crt',
  magenta: 'magenta synth',
  ciano: 'ciano gelo',
  giz: 'monocromo claro',
  magma: 'magma reator',
  matrix: 'matrix code',
  pipboy: 'pip-boy 3000',
};

function initThemes() {
  const widget = document.querySelector('.widget');
  const name = document.getElementById('picker-name');
  const swatches = [...document.querySelectorAll('.swatch')];
  const order = Object.keys(THEMES);

  const apply = (theme) => {
    widget.dataset.theme = theme;
    name.textContent = THEMES[theme];
    for (const s of swatches) s.classList.toggle('active', s.dataset.theme === theme);
  };
  apply('mono');

  let idx = 0;
  let rotate = null;
  if (!REDUCED_MOTION) {
    rotate = setInterval(() => {
      idx = (idx + 1) % order.length;
      apply(order[idx]);
    }, 4000);
  }

  for (const s of swatches) {
    s.addEventListener('click', () => {
      clearInterval(rotate);
      apply(s.dataset.theme);
    });
  }
}

const TASKS = [
  'refatorando auth',
  'escrevendo testes',
  'corrigindo lint',
  'migrando schema',
  'revisando pr #42',
  'atualizando deps',
];

function initWidgetLife() {
  const runEl = document.getElementById('w-time-run');
  const waitEl = document.getElementById('w-time-wait');
  const taskEl = document.getElementById('w-task');
  const barEl = document.getElementById('w-bar');
  const usageEl = document.getElementById('w-usage');

  const fmtTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const fmtTokens = (t) => `${(t / 1000).toFixed(1).replace('.', ',')}k`;

  let runSec = 4 * 60 + 12;
  let waitSec = 40;
  let tokens = 2500;
  setInterval(() => {
    runSec += 1;
    waitSec += 1;
    runEl.textContent = fmtTime(runSec);
    waitEl.textContent = fmtTime(waitSec);
    if (tokens < 9200) {
      tokens += 8 + Math.floor(Math.random() * 10);
      barEl.style.width = `${(tokens / 10000) * 100}%`;
      usageEl.textContent = `${fmtTokens(tokens)}/10k`;
    }
  }, 1000);

  if (REDUCED_MOTION) return;

  let taskIdx = 0;
  const type = (text, i) => {
    taskEl.textContent = text.slice(0, i);
    if (i <= text.length) setTimeout(() => type(text, i + 1), 45);
    else taskEl.classList.remove('typing');
  };
  setInterval(() => {
    taskIdx = (taskIdx + 1) % TASKS.length;
    taskEl.classList.add('typing');
    type(TASKS[taskIdx], 0);
  }, 7000);
}

loadRelease();
initCopy();
initLinuxModal();
initIntro(initReveal);
initThemes();
initWidgetLife();
