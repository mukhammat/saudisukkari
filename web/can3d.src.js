// 3D-банка Sukkari Drinks: вращается и меняет вкус при прокрутке.
// Сборка: npm run build:3d  →  public/js/can3d.js (грузится лениво, только на странице напитков).
// Банка нарисована с нуля, этикетка свою (бренд Sukkari Drinks), без оформления Kinza.
import {
  WebGLRenderer, Scene, PerspectiveCamera, Group, Mesh, CylinderGeometry, LatheGeometry,
  BoxGeometry, MeshStandardMaterial, CanvasTexture, SRGBColorSpace, RepeatWrapping,
  Vector2, DirectionalLight, PMREMGenerator, NeutralToneMapping, DoubleSide,
} from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

const FLAVORS = [
  { label: 'COLA',        tag: 'ORIGINAL TASTE', c1: '#B3202F', c2: '#3A0A12', ink: '#FFFFFF', accent: '#FF7A6B', tint: '179,32,47',  dk: '179,32,47'  },
  { label: 'DIET COLA',   tag: 'ZERO SUGAR',     c1: '#4A5163', c2: '#10131A', ink: '#FFFFFF', accent: '#C8D0DC', tint: '74,81,99',   dk: '52,58,74'   },
  { label: 'LEMON',       tag: 'CITRUS FIZZ',    c1: '#F4D81C', c2: '#8DBE2B', ink: '#2C3A00', accent: '#FFF7B0', tint: '244,216,28', dk: '128,110,0'  },
  { label: 'LEMON ZERO',  tag: 'ZERO SUGAR',     c1: '#86C743', c2: '#1F6B3A', ink: '#FFFFFF', accent: '#E4F7B8', tint: '134,199,67', dk: '42,120,60'  },
  { label: 'ORANGE',      tag: 'JUICY FIZZ',     c1: '#FFA033', c2: '#E8501C', ink: '#FFFFFF', accent: '#FFE2B8', tint: '255,160,51', dk: '214,92,16'  },
  { label: 'POMEGRANATE', tag: 'FRUITY FIZZ',    c1: '#C8185E', c2: '#5B0A33', ink: '#FFFFFF', accent: '#FFB3D1', tint: '200,24,94',  dk: '176,20,82'  },
  { label: '+2 MORE',     tag: 'FLAVORS',        c1: '#E63946', c2: '#F4A261', ink: '#FFFFFF', accent: '#FFFFFF', tint: '230,57,70',  dk: '214,40,57'  },
];
const N = FLAVORS.length;
const HOLD = 0.6; // доля шага, на которую банка замирает на вкусе

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const smooth = (t) => t * t * (3 - 2 * t);
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lerp = (a, b, t) => a + (b - a) * t;
const mixHex = (a, b, t) => {
  const A = hex(a), B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',')})`;
};
const mixRgb = (a, b, t) => {
  const A = a.split(',').map(Number), B = b.split(',').map(Number);
  return A.map((v, i) => Math.round(lerp(v, B[i], t))).join(',');
};

// ---------- этикетка (canvas → текстура) ----------
const TW = 1024, TH = 512;

function fitText(ctx, text, maxW, size, weight = 800) {
  let s = size;
  for (; s > 20; s -= 2) {
    ctx.font = `${weight} ${s}px "Golos Text", system-ui, Arial, sans-serif`;
    if (ctx.measureText(text).width <= maxW) break;
  }
  return s;
}
function spaced(ctx, v) { if ('letterSpacing' in ctx) ctx.letterSpacing = v + 'px'; }

function drawFront(ctx, cx, f, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = f.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  spaced(ctx, 4);
  ctx.font = '700 24px "Golos Text", system-ui, Arial, sans-serif';
  ctx.fillText('SUKKARI DRINKS', cx, TH * 0.19);
  spaced(ctx, 0);
  const size = fitText(ctx, f.label, 290, 100);
  ctx.fillText(f.label, cx, TH * 0.47);
  spaced(ctx, 5);
  ctx.font = '600 28px "Golos Text", system-ui, Arial, sans-serif';
  ctx.globalAlpha = alpha * 0.9;
  ctx.fillText(f.tag, cx, TH * 0.47 + size * 0.62 + 10);
  ctx.globalAlpha = alpha * 0.8;
  ctx.font = '600 26px "Golos Text", system-ui, Arial, sans-serif';
  ctx.fillText('320 ML', cx, TH * 0.9);
  ctx.restore();
}

function drawBack(ctx, cx, f, alpha) {
  if (alpha <= 0.01) return;
  ctx.save();
  ctx.globalAlpha = alpha * 0.9;
  ctx.fillStyle = f.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  spaced(ctx, 5);
  ctx.font = '800 54px "Golos Text", system-ui, Arial, sans-serif';
  ctx.fillText('SAUDI', cx, TH * 0.4);
  ctx.fillText('BEVERAGES', cx, TH * 0.4 + 62);
  ctx.restore();
}

function paintLabel(ctx, i0, i1, mix) {
  const a = FLAVORS[i0], b = FLAVORS[i1];
  const g = ctx.createLinearGradient(0, 0, 0, TH);
  g.addColorStop(0, mixHex(a.c1, b.c1, mix));
  g.addColorStop(1, mixHex(a.c2, b.c2, mix));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, TW, TH);

  // волна по кругу (2 полных периода — шов не виден)
  const wave = (y0, th, alpha, color) => {
    ctx.beginPath();
    for (let x = 0; x <= TW; x += 8) ctx.lineTo(x, y0 + Math.sin((x / TW) * Math.PI * 4) * 22);
    for (let x = TW; x >= 0; x -= 8) ctx.lineTo(x, y0 + th + Math.sin((x / TW) * Math.PI * 4) * 22);
    ctx.closePath();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fill();
    ctx.globalAlpha = 1;
  };
  const accent = mixHex(a.accent, b.accent, mix);
  wave(TH * 0.72, 34, 0.30, '#fff');
  wave(TH * 0.72 + 46, 12, 0.85, accent);

  // пузырьки
  ctx.fillStyle = '#fff';
  for (let k = 0; k < 46; k++) {
    const x = (k * 197.3) % TW, y = (k * 83.7) % (TH * 0.7), r = 2 + ((k * 7) % 5);
    ctx.globalAlpha = 0.10 + ((k * 13) % 10) / 80;
    ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  // надписи: спереди (центр = 512) и сзади (шов = 0/1024)
  drawFront(ctx, TW / 2, a, 1 - mix);
  drawFront(ctx, TW / 2, b, mix);
  [0, TW].forEach((cx) => { drawBack(ctx, cx, a, 1 - mix); drawBack(ctx, cx, b, mix); });
}

// ---------- банка ----------
function buildCan(renderer) {
  const labelCanvas = document.createElement('canvas');
  labelCanvas.width = TW; labelCanvas.height = TH;
  const ctx = labelCanvas.getContext('2d');
  const tex = new CanvasTexture(labelCanvas);
  tex.colorSpace = SRGBColorSpace;
  tex.wrapS = RepeatWrapping;
  tex.offset.x = 0.5; // центр этикетки смотрит на камеру
  tex.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());

  const body = new Mesh(
    new CylinderGeometry(1, 1, 3.0, 72, 1, true),
    new MeshStandardMaterial({ map: tex, metalness: 0.5, roughness: 0.34 })
  );
  const silver = new MeshStandardMaterial({ color: 0xe3e8ee, metalness: 1, roughness: 0.22, side: DoubleSide });

  const P = (x, y) => new Vector2(x, y);
  const top = new Mesh(new LatheGeometry([
    P(1.0, 1.5), P(0.985, 1.6), P(0.93, 1.68), P(0.87, 1.73), P(0.85, 1.78), P(0.85, 1.84),
    P(0.81, 1.875), P(0.77, 1.84), P(0.77, 1.78), P(0.0, 1.78),
  ], 72), silver);
  const bottom = new Mesh(new LatheGeometry([
    P(1.0, -1.5), P(0.97, -1.6), P(0.9, -1.67), P(0.84, -1.7), P(0.72, -1.62), P(0.0, -1.52),
  ], 72), silver);
  const tab = new Mesh(new BoxGeometry(0.5, 0.025, 0.22), silver);
  tab.position.set(0.05, 1.8, 0.04);

  const can = new Group();
  can.add(body, top, bottom, tab);
  return { can, tex, ctx };
}

// ---------- запуск ----------
export function init(canvas, opts) {
  let renderer;
  try {
    renderer = new WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) { return null; }
  if (!renderer.getContext()) return null;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const rim = new DirectionalLight(0xffffff, 1.4);
  rim.position.set(-4, 3, -3);
  scene.add(rim);

  const camera = new PerspectiveCamera(28, 1, 0.1, 50);
  const { can, tex, ctx } = buildCan(renderer);
  const pivot = new Group();
  pivot.add(can);
  scene.add(pivot);

  const host = canvas.parentElement;
  function resize() {
    const w = Math.max(1, host.clientWidth), h = Math.max(1, host.clientHeight);
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    // на узких экранах отодвигаем камеру, чтобы банка помещалась целиком
    camera.position.set(0, 0.15, 10.3 / Math.min(1, camera.aspect * 1.3));
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(host);
  resize();

  // слабая реакция на мышь/наклон
  let px = 0, py = 0, tx = 0, ty = 0;
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / innerWidth - 0.5) * 2;
    ty = (e.clientY / innerHeight - 0.5) * 2;
  }, { passive: true });

  let lastKey = '', lastIdx = -1, visible = true, raf = 0;
  const t0 = performance.now();

  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    const t = (now - t0) / 1000;
    const p = clamp(opts.getProgress());
    const s = p * (N - 1 + HOLD);
    let i0, mix;
    if (s >= N - 1) { i0 = N - 1; mix = 0; }
    else { i0 = Math.floor(s); mix = smooth(clamp((s - i0 - HOLD) / (1 - HOLD))); }
    const i1 = Math.min(i0 + 1, N - 1);

    // этикетка перерисовывается только при смене состояния
    const key = i0 + ':' + Math.round(mix * 40);
    if (key !== lastKey) {
      lastKey = key;
      paintLabel(ctx, i0, i1, mix);
      tex.needsUpdate = true;
      opts.onColor && opts.onColor(
        mixRgb(FLAVORS[i0].tint, FLAVORS[i1].tint, mix),
        mixRgb(FLAVORS[i0].dk, FLAVORS[i1].dk, mix)
      );
    }
    const idx = mix >= 0.5 ? i1 : i0;
    if (idx !== lastIdx) { lastIdx = idx; opts.onFlavor && opts.onFlavor(idx); }

    // полный оборот на каждый переход: смена цвета происходит, когда банка повёрнута спиной
    px += (tx - px) * 0.06; py += (ty - py) * 0.06;
    pivot.rotation.y = (i0 + mix) * Math.PI * 2 + Math.sin(t * 0.8) * 0.1 + px * 0.25;
    pivot.rotation.x = 0.1 + py * 0.08;
    pivot.rotation.z = -0.16;
    pivot.position.y = Math.sin(t * 1.2) * 0.06;
    pivot.scale.setScalar(1 + 0.07 * Math.sin(Math.PI * mix));

    renderer.render(scene, camera);
    raf = requestAnimationFrame(frame);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };

  new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(host);
  document.addEventListener('visibilitychange', kick);
  canvas.addEventListener('webglcontextlost', (e) => e.preventDefault());

  // шрифт нужен для надписей на этикетке
  const fontReady = (document.fonts && document.fonts.load)
    ? Promise.race([document.fonts.load('800 40px "Golos Text"'), new Promise((r) => setTimeout(r, 1500))])
    : Promise.resolve();
  return fontReady.then(() => { lastKey = ''; kick(); return { ok: true }; });
}
