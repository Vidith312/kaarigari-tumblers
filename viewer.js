import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
   PRODUCT ARTWORK (front decal)
   ============================================================ */
/* ---------- embroidery helpers (Utsav mandala) ---------- */

/* Fill a shape, lay satin stitches across it, then ink the outline.
   Everything stays inside the caller's current transform, so leaves can be
   rotated into place cheaply. */
function stitched(ctx, build, colors, box, spacing) {
  ctx.beginPath();
  build(ctx);
  ctx.fillStyle = colors.mid;
  ctx.fill();

  ctx.save();
  ctx.beginPath();
  build(ctx);
  ctx.clip();
  ctx.lineCap = 'butt';
  ctx.lineWidth = spacing * 0.92;
  let row = 0;
  for (let p = box.min; p <= box.max; p += spacing) {
    ctx.beginPath();
    if (box.vertical) {
      ctx.moveTo(p, box.a);
      ctx.lineTo(p, box.b);
    } else {
      ctx.moveTo(box.a, p);
      ctx.lineTo(box.b, p);
    }
    ctx.strokeStyle = row % 2 ? colors.light : colors.dark;
    ctx.stroke();
    row++;
  }
  ctx.restore();

  ctx.beginPath();
  build(ctx);
  ctx.strokeStyle = colors.ink;
  ctx.lineWidth = 2.2;
  ctx.stroke();
}

/* fan of rounded leaflets — the maple-ish motif in the reference */
function fanPath(len, lobes, spread, width) {
  return function (ctx) {
    for (let i = 0; i < lobes; i++) {
      const t = lobes > 1 ? i / (lobes - 1) - 0.5 : 0;
      const a = t * spread;
      const l = len * (0.76 + 0.24 * Math.cos(t * Math.PI * 1.05));
      const cy = -l * 0.55;
      ctx.ellipse(Math.sin(a) * -cy, Math.cos(a) * cy, width * l, l * 0.55, a, 0, Math.PI * 2);
    }
  };
}

/* slender leafy sprig */
function fernPath(len, pairs, width) {
  return function (ctx) {
    for (let i = 0; i < pairs; i++) {
      const t = (i + 0.55) / pairs;
      const y = -len * (0.10 + t * 0.84);
      const x = Math.sin(t * 1.5) * len * 0.045;
      const s = (1 - t * 0.62) * width * len;
      const a = 0.72 - t * 0.2;
      for (let k = -1; k <= 1; k += 2) {
        ctx.ellipse(x + k * s * 1.15, y, s * 1.5, s * 0.55, k * a, 0, Math.PI * 2);
      }
    }
  };
}

function strokeSprigStem(ctx, len, color) {
  ctx.beginPath();
  ctx.moveTo(0, 4);
  ctx.quadraticCurveTo(Math.sin(0.75) * len * 0.03, -len * 0.5, Math.sin(1.4) * len * 0.045, -len * 0.92);
  ctx.strokeStyle = color;
  ctx.lineWidth = 4;
  ctx.stroke();
}

function drawMandala(ctx) {
  const R = 468;
  const TAU = Math.PI * 2;

  const gold = { light: '#F4CB62', mid: '#DCA126', dark: '#B47A16', ink: '#7E4612' };
  const amber = { light: '#E8A94B', mid: '#C97B2C', dark: '#A0541E', ink: '#6B2E14' };
  const rust = { light: '#C4682F', mid: '#A64F28', dark: '#83391A', ink: '#5E2711' };
  const wheel = [gold, rust, amber, rust];

  ctx.save();
  ctx.translate(512, 512);

  /* outer lacquered ring */
  ctx.beginPath();
  ctx.arc(0, 0, R, 0, TAU);
  ctx.strokeStyle = '#7A3417';
  ctx.lineWidth = 26;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, R - 8, 0, TAU);
  ctx.strokeStyle = 'rgba(226, 168, 96, .40)';
  ctx.lineWidth = 3;
  ctx.stroke();

  /* gold pinstripes hugging the rim */
  ctx.beginPath();
  ctx.arc(0, 0, R - 30, 0, TAU);
  ctx.strokeStyle = gold.mid;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, R - 39, 0, TAU);
  ctx.strokeStyle = rust.ink;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  /* bead chain hugging the rim */
  for (let i = 0; i < 96; i++) {
    const a = (i / 96) * TAU;
    ctx.save();
    ctx.rotate(a);
    ctx.beginPath();
    ctx.ellipse(0, -(R - 19), 3.8, 6.2, 0, 0, TAU);
    ctx.fillStyle = i % 2 ? gold.light : amber.mid;
    ctx.fill();
    ctx.restore();
  }

  /* outer wreath — broad palmate leaves alternating with gold sprigs */
  const rBase = R - 172;
  const rTip = R - 40;
  const leaves = 10;

  for (let i = 0; i < leaves; i++) {
    const a = ((i + 0.5) / leaves) * TAU - Math.PI / 2;
    ctx.save();
    ctx.rotate(a + Math.PI / 2);
    ctx.translate(0, -(rBase - 8));
    const len = rTip - rBase + 14;
    strokeSprigStem(ctx, len, gold.dark);
    stitched(ctx, fernPath(len, 5, 0.13), gold, { vertical: false, a: -len - 12, b: 10, min: -len * 0.36, max: len * 0.36 }, 5);
    ctx.restore();
  }

  for (let i = 0; i < leaves; i++) {
    const a = (i / leaves) * TAU - Math.PI / 2;
    ctx.save();
    ctx.rotate(a + Math.PI / 2);
    ctx.translate(0, -rBase);
    const len = rTip - rBase;
    stitched(ctx, fanPath(len, 7, 1.5, 0.205), wheel[i % wheel.length], { vertical: true, a: -len - 20, b: 14, min: -len * 0.85, max: len * 0.85 }, 6);
    ctx.restore();
  }

  /* chain between the two bands */
  ctx.beginPath();
  ctx.arc(0, 0, R - 180, 0, TAU);
  ctx.strokeStyle = gold.mid;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, R - 188, 0, TAU);
  ctx.strokeStyle = rust.ink;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  /* inner band — rust sawtooth with gold sprigs behind */
  const teeth = 18;
  for (let i = 0; i < teeth; i++) {
    const a = ((i + 0.5) / teeth) * TAU - Math.PI / 2;
    ctx.save();
    ctx.rotate(a + Math.PI / 2);
    ctx.translate(0, -(R - 292));
    const len = 96;
    stitched(ctx, fernPath(len, 3, 0.15), amber, { vertical: false, a: -len - 10, b: 10, min: -len * 0.42, max: len * 0.42 }, 5);
    ctx.restore();
  }

  for (let i = 0; i < teeth; i++) {
    const a = (i / teeth) * TAU - Math.PI / 2;
    const halfW = (Math.PI * 2 * (R - 188)) / teeth / 2.05;
    ctx.save();
    ctx.rotate(a + Math.PI / 2);
    ctx.translate(0, -(R - 188));
    stitched(ctx, function (c) {
      c.moveTo(-halfW, 0);
      c.lineTo(halfW, 0);
      c.lineTo(0, 86);
      c.closePath();
    }, rust, { vertical: true, a: -4, b: 84, min: -42, max: 42 }, 5.5);
    ctx.restore();
  }

  /* inner gold rings, then the bare steel centre */
  ctx.beginPath();
  ctx.arc(0, 0, R - 268, 0, TAU);
  ctx.strokeStyle = gold.mid;
  ctx.lineWidth = 7;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, R - 275, 0, TAU);
  ctx.strokeStyle = rust.ink;
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(0, 0, R - 281, 0, TAU);
  ctx.strokeStyle = gold.light;
  ctx.lineWidth = 1.8;
  ctx.stroke();

  ctx.restore();
}

/* ---------- Chill, यार lockup ---------- */

function fitFont(ctx, text, family, weight, targetWidth) {
  const base = 400;
  ctx.font = weight + ' ' + base + 'px ' + family;
  const measured = ctx.measureText(text).width || 1;
  const size = Math.min(640, (base * targetWidth) / measured);
  ctx.font = weight + ' ' + size + 'px ' + family;
  return size;
}

function drawChyaar(ctx) {
  const cream = '#F5F0E4';
  const latin = '"KG Groove", "Modak", "KG Fat", cursive';
  const hindi = '"KG Round", "Baloo 2", "Nirmala UI", sans-serif';

  ctx.fillStyle = cream;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';

  const sizeA = fitFont(ctx, 'Chill,', latin, 400, 770);
  const boxA = ctx.measureText('Chill,');
  const sizeB = fitFont(ctx, 'यार', hindi, 800, 640);
  const boxB = ctx.measureText('यार');

  const ascA = boxA.actualBoundingBoxAscent || sizeA * 0.72;
  const descA = Math.max(0, boxA.actualBoundingBoxDescent || 0);
  const ascB = boxB.actualBoundingBoxAscent || sizeB * 0.72;
  const descB = Math.max(0, boxB.actualBoundingBoxDescent || 0);

  const gap = 46;
  const total = ascA + descA + gap + ascB + descB;
  const top = (1024 - total) / 2 + 12;
  const baseA = top + ascA;
  const baseB = baseA + descA + gap + ascB;

  ctx.font = '400 ' + sizeA + 'px ' + latin;
  ctx.fillText('Chill,', 512, baseA);
  ctx.font = '800 ' + sizeB + 'px ' + hindi;
  ctx.fillText('यार', 512, baseB);
}

function drawHeart(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 20, s / 20);
  ctx.beginPath();
  ctx.moveTo(0, 7);
  ctx.bezierCurveTo(-15, -6, -10, -19, 0, -10);
  ctx.bezierCurveTo(10, -19, 15, -6, 0, 7);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = '#7A2E3B';
  ctx.lineWidth = 2.2;
  ctx.stroke();
  ctx.restore();
}

function drawCherry(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 20, s / 20);
  ctx.strokeStyle = '#5F7A3A';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -2);
  ctx.quadraticCurveTo(0, -26, 12, -30);
  ctx.moveTo(7, -2);
  ctx.quadraticCurveTo(10, -22, 16, -26);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-7, 2, 11, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(10, 0, 9, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.6)';
  ctx.beginPath();
  ctx.arc(-10, -2, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function drawFlower(ctx, x, y, s, petal, center) {
  ctx.save();
  ctx.translate(x, y);
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * s * 0.62, Math.sin(a) * s * 0.62, s * 0.42, s * 0.42, 0, 0, Math.PI * 2);
    ctx.fillStyle = petal;
    ctx.fill();
    ctx.strokeStyle = '#7A2E3B';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.34, 0, Math.PI * 2);
  ctx.fillStyle = center;
  ctx.fill();
  ctx.restore();
}

function drawSparkle(ctx, x, y, s, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.quadraticCurveTo(s * 0.18, -s * 0.18, s, 0);
  ctx.quadraticCurveTo(s * 0.18, s * 0.18, 0, s);
  ctx.quadraticCurveTo(-s * 0.18, s * 0.18, -s, 0);
  ctx.quadraticCurveTo(-s * 0.18, -s * 0.18, 0, -s);
  ctx.fill();
  ctx.restore();
}

function drawBow(ctx, x, y, s, fill, stroke) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s / 40, s / 40);
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;

  ctx.beginPath();
  ctx.ellipse(-20, -4, 17, 11, -0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(20, -4, 17, 11, 0.38, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-6, 2);
  ctx.quadraticCurveTo(-14, 22, -8, 30);
  ctx.lineTo(-2, 24);
  ctx.quadraticCurveTo(-4, 10, 2, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(6, 2);
  ctx.quadraticCurveTo(14, 22, 8, 30);
  ctx.lineTo(2, 24);
  ctx.quadraticCurveTo(4, 10, -2, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(0, 0, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawPooja(ctx) {
  const px = 302;
  const py = 42;
  const pw = 420;
  const ph = 940;

  /* pink patterned panel */
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 36);
  ctx.fillStyle = '#F0B2C2';
  ctx.fill();
  ctx.clip();

  ctx.strokeStyle = 'rgba(255, 240, 245, .78)';
  ctx.fillStyle = 'rgba(255, 240, 245, .62)';
  const pcx = px + pw / 2;
  const pcy = py + ph / 2;
  for (let r = 70; r < 480; r += 58) {
    ctx.beginPath();
    ctx.arc(pcx, pcy, r, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.stroke();
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2 + r * 0.01;
      ctx.beginPath();
      ctx.arc(pcx + Math.cos(a) * r, pcy + Math.sin(a) * r, 4.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (let i = 0; i < 18; i++) {
    const a = (i / 18) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(pcx + Math.cos(a) * 300, pcy + Math.sin(a) * 300, 16, 38, a, 0, Math.PI * 2);
    ctx.lineWidth = 5;
    ctx.stroke();
  }
  ctx.restore();

  ctx.beginPath();
  ctx.roundRect(px, py, pw, ph, 36);
  ctx.strokeStyle = '#A63E57';
  ctx.lineWidth = 7;
  ctx.stroke();

  ctx.beginPath();
  ctx.roundRect(px + 16, py + 16, pw - 32, ph - 32, 26);
  ctx.setLineDash([2, 9]);
  ctx.strokeStyle = '#D98AA0';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.setLineDash([]);

  /* ornaments live on the steel either side of the panel */
  drawBow(ctx, 258, 236, 108, '#FBE3E8', '#A63E57');
  drawCherry(ctx, 768, 248, 56, '#C93B5A');
  drawSparkle(ctx, 782, 352, 24, '#7A2E3B');
  drawFlower(ctx, 268, 478, 48, '#FFF4E4', '#F2C14E');
  drawFlower(ctx, 762, 520, 46, '#FFF4E4', '#F2C14E');
  drawHeart(ctx, 266, 628, 48, '#E4546E');
  drawSparkle(ctx, 262, 704, 21, '#7A2E3B');
  drawHeart(ctx, 758, 734, 43, '#E4546E');
  drawFlower(ctx, 268, 796, 40, '#FFF4E4', '#F2C14E');
  drawSparkle(ctx, 784, 804, 21, '#7A2E3B');
  drawHeart(ctx, 686, 916, 42, '#E4546E');

  /* vertical “Poo की” lockup, reading downwards */
  ctx.save();
  ctx.translate(512, 512);
  ctx.rotate(Math.PI / 2);
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  ctx.lineJoin = 'round';

  const fontPoo = '700 340px "Rozha One", "Playfair Display", Georgia, serif';
  const fontKi = '700 300px "Kalam", "Nirmala UI", "Noto Sans Devanagari", sans-serif';

  ctx.font = fontPoo;
  const wPoo = ctx.measureText('Poo').width;
  ctx.font = fontKi;
  const wKi = ctx.measureText('की').width;

  const total = wPoo + 16 + wKi;
  let x = -total / 2;

  ctx.font = fontPoo;
  ctx.strokeStyle = '#7A2E3B';
  ctx.lineWidth = 26;
  ctx.strokeText('Poo', x, 0);
  ctx.fillStyle = '#F6C453';
  ctx.fillText('Poo', x, 0);

  x += wPoo + 16;

  ctx.font = fontKi;
  ctx.lineWidth = 22;
  ctx.strokeText('की', x, 0);
  ctx.fillText('की', x, 0);

  ctx.restore();

  /* disco ball */
  ctx.save();
  ctx.translate(206, 862);
  ctx.beginPath();
  ctx.arc(0, 0, 46, 0, Math.PI * 2);
  ctx.fillStyle = '#E9C9A0';
  ctx.fill();
  ctx.strokeStyle = '#7A2E3B';
  ctx.lineWidth = 4;
  ctx.stroke();
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(-43, i * 17);
    ctx.lineTo(43, i * 17);
    ctx.strokeStyle = 'rgba(122,46,59,.45)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.restore();
}

/* speckle the ink so the print reads as pigment on powder coat, not vector */
function addPrintGrain(ctx) {
  const tile = document.createElement('canvas');
  tile.width = 128;
  tile.height = 128;
  const g = tile.getContext('2d');
  const img = g.createImageData(128, 128);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = Math.random() < 0.5 ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = Math.random() * 24;
  }
  g.putImageData(img, 0, 0);

  ctx.save();
  ctx.globalCompositeOperation = 'source-atop';
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = ctx.createPattern(tile, 'repeat');
  ctx.fillRect(0, 0, 1024, 1024);
  ctx.restore();
}

function makeArtwork(p, renderer) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 1024;
  const ctx = c.getContext('2d');
  ctx.clearRect(0, 0, c.width, c.height);

  if (p.artwork === 'mandala') drawMandala(ctx);
  else if (p.artwork === 'chyaar') drawChyaar(ctx);
  else if (p.artwork === 'pooja') drawPooja(ctx);

  if (p.artwork !== 'blank') addPrintGrain(ctx);

  const texture = new THREE.CanvasTexture(c);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
  texture.needsUpdate = true;
  return texture;
}

/* ============================================================
   WARM STUDIO ENVIRONMENT
   ============================================================ */
function makeEnvironment(renderer) {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 512;
  const ctx = c.getContext('2d');

  const sky = ctx.createLinearGradient(0, 0, 0, 512);
  sky.addColorStop(0, '#FFF8EC');
  sky.addColorStop(0.42, '#F5E3CC');
  sky.addColorStop(0.53, '#DCC0A0');
  sky.addColorStop(1, '#6B4E36');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 1024, 512);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.fillRect(90, 54, 150, 190);
  ctx.fillRect(430, 30, 105, 150);
  ctx.fillRect(760, 66, 165, 210);
  ctx.fillStyle = 'rgba(255, 236, 208, 0.5)';
  ctx.fillRect(950, 120, 40, 150);

  /* tall softboxes — they read as long vertical highlights on the steel */
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.fillRect(238, 86, 62, 322);
  ctx.fillStyle = 'rgba(255, 244, 226, 0.55)';
  ctx.fillRect(566, 96, 34, 300);

  const lamp = ctx.createRadialGradient(880, 280, 10, 880, 280, 170);
  lamp.addColorStop(0, 'rgba(255, 198, 140, 0.9)');
  lamp.addColorStop(1, 'rgba(255, 198, 140, 0)');
  ctx.fillStyle = lamp;
  ctx.beginPath();
  ctx.arc(880, 280, 170, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(c);
  texture.mapping = THREE.EquirectangularReflectionMapping;
  texture.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  const envMap = pmrem.fromEquirectangular(texture).texture;
  texture.dispose();
  pmrem.dispose();
  return envMap;
}

function makeShadowTexture() {
  const c = document.createElement('canvas');
  c.width = 512;
  c.height = 512;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(256, 256, 18, 256, 256, 224);
  g.addColorStop(0, 'rgba(64, 40, 22, 0.58)');
  g.addColorStop(0.45, 'rgba(64, 40, 22, 0.26)');
  g.addColorStop(1, 'rgba(64, 40, 22, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return new THREE.CanvasTexture(c);
}

/* fine powder-coat grain: breaks up the perfectly smooth shader highlight
   so the steel reads as a real painted tumbler rather than plastic */
function makeCoatTexture() {
  const size = 256;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const img = ctx.createImageData(size, size);
  const data = img.data;
  for (let i = 0; i < data.length; i += 4) {
    const v = 118 + Math.random() * 28;
    data[i] = v;
    data[i + 1] = v;
    data[i + 2] = v;
    data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const texture = new THREE.CanvasTexture(c);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(9, 7);
  return texture;
}

/* ============================================================
   REUSABLE 3D VIEWER
   ============================================================ */
export function createTumblerViewer(options) {
  const opts = Object.assign({
    canvas: null,
    container: null,
    personality: null,
    cameraZ: 8.8,
    cameraY: 0.45,
    targetY: 0.1,
    autoRotate: true,
    autoRotateSpeed: 0.55,
    interactive: true,
    mobileInteractive: false,
    floating: true,
    motes: true,
    spinOnSelect: true
  }, options || {});

  const { canvas, container, personality } = opts;
  if (!canvas || !container || !personality) return null;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
  } catch (error) {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;

  const scene = new THREE.Scene();
  scene.environment = makeEnvironment(renderer);

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(0.25, opts.cameraY, opts.cameraZ);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, opts.targetY, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.rotateSpeed = 0.75;
  controls.autoRotate = opts.autoRotate && !reducedMotion;
  controls.autoRotateSpeed = opts.autoRotateSpeed;
  controls.minPolarAngle = 0.95;
  controls.maxPolarAngle = 1.62;

  const mobileQuery = window.matchMedia('(max-width: 820px)');
  function applyControlsMode() {
    const mobile = mobileQuery.matches;
    controls.enabled = opts.interactive && (mobile ? opts.mobileInteractive : true);
    canvas.style.touchAction = controls.enabled ? 'none' : 'pan-y';
    canvas.style.cursor = controls.enabled ? 'grab' : 'default';
  }
  applyControlsMode();
  if (mobileQuery.addEventListener) {
    mobileQuery.addEventListener('change', applyControlsMode);
  }

  let idleTimer = null;
  controls.addEventListener('start', function () {
    if (reducedMotion) return;
    controls.autoRotate = false;
    window.clearTimeout(idleTimer);
  });
  controls.addEventListener('end', function () {
    if (reducedMotion) return;
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(function () {
      controls.autoRotate = true;
    }, 4200);
  });

  /* ---- lighting ---- */
  scene.add(new THREE.AmbientLight(0xFFEAD4, 0.36));

  const key = new THREE.DirectionalLight(0xFFF1DC, 2.15);
  key.position.set(4, 6, 4);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xFFD5B0, 0.8);
  fill.position.set(-5, 2, 3);
  scene.add(fill);

  const rim = new THREE.DirectionalLight(0xFFF4E2, 1.75);
  rim.position.set(-2.5, 4, -5);
  scene.add(rim);

  const bounce = new THREE.DirectionalLight(0xFFE2C2, 0.3);
  bounce.position.set(0, -4, 3);
  scene.add(bounce);

  /* a whisper of cool light keeps black and steel from going olive */
  const cool = new THREE.DirectionalLight(0xD3E4F4, 0.22);
  cool.position.set(-3, 1.5, 4);
  scene.add(cool);

  /* ---- materials ---- */
  const bodyColor = new THREE.Color(personality.colorHex);
  const lidColor = bodyColor.clone().offsetHSL(0, 0, 0.035);
  const strawColor = bodyColor.clone().offsetHSL(0, 0, 0.06);

  const coatTex = makeCoatTexture();

  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor.clone(),
    roughness: personality.roughness,
    metalness: personality.metalness,
    envMapIntensity: 0.95,
    bumpMap: coatTex,
    bumpScale: 0.014
  });

  const rimMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(personality.rimColorHex),
    metalness: 0.94,
    roughness: 0.27,
    envMapIntensity: 1.1
  });

  const lidMat = new THREE.MeshStandardMaterial({
    color: lidColor,
    metalness: personality.metalness * 0.6,
    roughness: Math.min(0.9, personality.roughness + 0.08),
    envMapIntensity: 0.75,
    bumpMap: coatTex,
    bumpScale: 0.016
  });

  const strawMat = new THREE.MeshStandardMaterial({
    color: strawColor,
    metalness: 0.08,
    roughness: 0.42,
    envMapIntensity: 0.7
  });

  const handleMat = new THREE.MeshStandardMaterial({
    color: bodyColor.clone(),
    metalness: personality.metalness * 0.8,
    roughness: Math.min(0.95, personality.roughness + 0.04),
    envMapIntensity: 0.9,
    bumpMap: coatTex,
    bumpScale: 0.012
  });

  const gasketMat = new THREE.MeshStandardMaterial({
    color: 0x1C1612,
    metalness: 0.05,
    roughness: 0.92
  });

  /* ---- geometry: 40oz handled tumbler ---- */
  const group = new THREE.Group();
  group.position.y = -0.05;
  scene.add(group);

  /* silhouette traced from the product photography: a slim base cylinder,
     a soft shoulder around the grip line, then a straight upper barrel. */
  const bodyProfile = [
    new THREE.Vector2(0.02, -2.60),
    new THREE.Vector2(0.82, -2.60),
    new THREE.Vector2(0.858, -2.555),
    new THREE.Vector2(0.872, -2.49),
    new THREE.Vector2(0.878, -2.30),
    new THREE.Vector2(0.878, -1.55),
    new THREE.Vector2(0.88, -1.10),
    new THREE.Vector2(0.886, -0.96),
    new THREE.Vector2(0.906, -0.85),
    new THREE.Vector2(0.936, -0.74),
    new THREE.Vector2(0.966, -0.64),
    new THREE.Vector2(0.988, -0.55),
    new THREE.Vector2(0.998, -0.46),
    new THREE.Vector2(1.0, -0.30),
    new THREE.Vector2(1.0, 2.42),
    new THREE.Vector2(0.998, 2.58),
    new THREE.Vector2(0.992, 2.66),
    new THREE.Vector2(0.978, 2.72),
    new THREE.Vector2(0.952, 2.74)
  ];

  const body = new THREE.Mesh(new THREE.LatheGeometry(bodyProfile, 112), bodyMat);
  group.add(body);

  const base = new THREE.Mesh(new THREE.CircleGeometry(0.825, 72), bodyMat);
  base.rotation.x = -Math.PI / 2;
  base.position.y = -2.602;
  group.add(base);

  const baseRingGeo = new THREE.TorusGeometry(0.826, 0.011, 10, 80);
  baseRingGeo.rotateX(Math.PI / 2);
  const baseRing = new THREE.Mesh(baseRingGeo, gasketMat);
  baseRing.position.y = -2.586;
  group.add(baseRing);

  const seamGeo = new THREE.TorusGeometry(0.958, 0.009, 12, 144);
  seamGeo.rotateX(Math.PI / 2);
  const seam = new THREE.Mesh(seamGeo, gasketMat);
  seam.position.y = 2.745;
  group.add(seam);

  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(1.005, 0.985, 0.30, 112),
    lidMat
  );
  lid.position.y = 2.90;
  group.add(lid);

  const lidTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.935, 1.005, 0.07, 112),
    lidMat
  );
  lidTop.position.y = 3.085;
  group.add(lidTop);

  const strawSeal = new THREE.Mesh(
    new THREE.CylinderGeometry(0.088, 0.088, 0.032, 28),
    gasketMat
  );
  strawSeal.position.y = 3.12;
  group.add(strawSeal);

  const straw = new THREE.Mesh(
    new THREE.CylinderGeometry(0.052, 0.052, 1.0, 28),
    strawMat
  );
  straw.position.y = 3.63;
  group.add(straw);

  function traceRoundedRect(path, x, y, w, h, r) {
    path.moveTo(x + r, y);
    path.lineTo(x + w - r, y);
    path.quadraticCurveTo(x + w, y, x + w, y + r);
    path.lineTo(x + w, y + h - r);
    path.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    path.lineTo(x + r, y + h);
    path.quadraticCurveTo(x, y + h, x, y + h - r);
    path.lineTo(x, y + r);
    path.quadraticCurveTo(x, y, x + r, y);
  }

  /* big, tall handle identical in proportion to the photography */
  const handleShape = new THREE.Shape();
  traceRoundedRect(handleShape, -0.16, -1.44, 1.09, 2.88, 0.47);
  const handleHole = new THREE.Path();
  traceRoundedRect(handleHole, 0.12, -0.99, 0.58, 1.98, 0.28);
  handleShape.holes.push(handleHole);

  const handleGeo = new THREE.ExtrudeGeometry(handleShape, {
    depth: 0.40,
    bevelEnabled: true,
    bevelSegments: 5,
    steps: 1,
    bevelSize: 0.035,
    bevelThickness: 0.035,
    curveSegments: 40
  });
  handleGeo.translate(0, 0, -0.20);

  const handle = new THREE.Mesh(handleGeo, handleMat);
  handle.position.set(1.0, 0.83, 0);
  group.add(handle);

  /* dark wavy silicone grip on the outer wall of the opening */
  const gripShape = new THREE.Shape();
  gripShape.moveTo(0.555, -0.97);
  gripShape.lineTo(0.735, -0.97);
  gripShape.lineTo(0.735, 0.97);
  gripShape.lineTo(0.585, 0.97);
  gripShape.bezierCurveTo(0.705, 0.72, 0.515, 0.50, 0.625, 0.26);
  gripShape.bezierCurveTo(0.730, 0.02, 0.505, -0.22, 0.615, -0.46);
  gripShape.bezierCurveTo(0.720, -0.70, 0.535, -0.82, 0.555, -0.97);
  gripShape.closePath();

  const gripGeo = new THREE.ExtrudeGeometry(gripShape, {
    depth: 0.35,
    bevelEnabled: true,
    bevelSegments: 3,
    steps: 1,
    bevelSize: 0.014,
    bevelThickness: 0.014,
    curveSegments: 28
  });
  gripGeo.translate(0, 0, -0.20);

  const gripMat = new THREE.MeshStandardMaterial({
    color: 0x141110,
    roughness: 0.72,
    metalness: 0.05,
    envMapIntensity: 0.45
  });
  const grip = new THREE.Mesh(gripGeo, gripMat);
  grip.position.set(1.0, 0.83, 0);
  group.add(grip);

  /* decal placement measured off the reference photos */
  const decalSpec = personality.artwork === 'pooja'
    ? { height: 3.0, y: 0.60 }
    : personality.artwork === 'mandala'
      ? { height: 2.42, y: 0.86 }
      : { height: 2.24, y: 0.84 };

  const decalTheta = Math.PI * 0.86;
  const decalGeo = new THREE.CylinderGeometry(
    1.014, 1.011, decalSpec.height, 128, 1, true,
    -decalTheta / 2, decalTheta
  );
  const decalMat = new THREE.MeshStandardMaterial({
    map: makeArtwork(personality, renderer),
    transparent: true,
    roughness: 0.68,
    metalness: 0.04,
    depthWrite: false,
    polygonOffset: true,
    polygonOffsetFactor: -2,
    envMapIntensity: 0.5,
    bumpMap: coatTex,
    bumpScale: 0.01
  });
  const decal = new THREE.Mesh(decalGeo, decalMat);
  decal.position.y = decalSpec.y;
  decal.visible = personality.artwork !== 'blank';
  group.add(decal);

  /* ---- contact shadow ---- */
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(5.6, 5.6),
    new THREE.MeshBasicMaterial({
      map: makeShadowTexture(),
      transparent: true,
      depthWrite: false,
      opacity: 0.9
    })
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -2.625;
  group.add(shadow);

  /* ---- dust motes ---- */
  let motes = null;
  if (opts.motes) {
    const motesCount = 34;
    const positions = new Float32Array(motesCount * 3);
    for (let i = 0; i < motesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 4.6;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5.4;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2.6;
    }
    const moteGeo = new THREE.BufferGeometry();
    moteGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    motes = new THREE.Points(
      moteGeo,
      new THREE.PointsMaterial({
        color: 0xF7DCB4,
        size: 0.045,
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
        sizeAttenuation: true
      })
    );
    scene.add(motes);
  }

  /* ---- state ---- */
  const targetColor = new THREE.Color(personality.colorHex);
  const targetRim = new THREE.Color(personality.rimColorHex);
  const targetLid = new THREE.Color(personality.colorHex).offsetHSL(0, 0, 0.035);
  const targetStraw = new THREE.Color(personality.colorHex).offsetHSL(0, 0, 0.06);
  let targetRoughness = personality.roughness;
  let targetMetalness = personality.metalness;
  let spinVelocity = 0;
  let visible = true;
  let ready = false;
  let disposed = false;
  let raf = 0;
  let currentId = personality.id;
  let currentPersonality = personality;

  function applyArtwork(p) {
    const old = decalMat.map;
    decalMat.map = makeArtwork(p, renderer);
    decalMat.needsUpdate = true;
    decal.visible = p.artwork !== 'blank';
    if (old) old.dispose();
  }

  /* make sure decal-only faces load, then redraw the artwork once.
     The second argument matters: without the actual Devanagari text the
     browser only fetches the Latin subset and यार falls back to a system face. */
  function loadDecalFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    const jobs = [
      document.fonts.load('400 100px "KG Groove"', 'Chill, यार'),
      document.fonts.load('400 100px "KG Fat"', 'Chill,'),
      document.fonts.load('800 100px "KG Round"', 'यार'),
      document.fonts.load('400 100px "Kalam"', 'Poo की'),
      document.fonts.load('700 100px "Kalam"', 'Poo की'),
      document.fonts.load('400 100px "Rozha One"', 'Poo')
    ];
    return Promise.all(jobs.map(function (job) {
      return job.catch(function () {});
    }));
  }
  loadDecalFonts().then(function () {
    if (!disposed && decal.visible) applyArtwork(currentPersonality);
  });

  function setPersonality(p) {
    if (!p || p.id === currentId) return;
    currentId = p.id;
    currentPersonality = p;
    targetColor.set(p.colorHex);
    targetRim.set(p.rimColorHex);
    targetLid.set(p.colorHex).offsetHSL(0, 0, 0.035);
    targetStraw.set(p.colorHex).offsetHSL(0, 0, 0.06);
    targetRoughness = p.roughness;
    targetMetalness = p.metalness;

    applyArtwork(p);

    if (opts.spinOnSelect && !reducedMotion) spinVelocity = 0.22;
  }

  /* ---- sizing ---- */
  function resize() {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  let resizeObserver = null;
  if ('ResizeObserver' in window) {
    resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
  } else {
    window.addEventListener('resize', resize);
  }
  resize();

  let intersectionObserver = null;
  if ('IntersectionObserver' in window) {
    intersectionObserver = new IntersectionObserver(function (entries) {
      if (entries[0]) visible = entries[0].isIntersecting;
    }, { threshold: 0.01 });
    intersectionObserver.observe(container);
  }

  function handleContextLost(event) {
    event.preventDefault();
    container.classList.add('is-fallback');
    container.classList.remove('is-ready');
  }
  canvas.addEventListener('webglcontextlost', handleContextLost);

  /* ---- keyboard spin (accessibility) ---- */
  canvas.tabIndex = 0;
  function handleKey(event) {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    group.rotation.y += event.key === 'ArrowLeft' ? -0.18 : 0.18;
    if (reducedMotion) return;
    controls.autoRotate = false;
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(function () { controls.autoRotate = true; }, 4200);
  }
  canvas.addEventListener('keydown', handleKey);

  /* ---- typefaces for the artwork ---- */
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (disposed) return;
      applyArtwork(currentPersonality);
    });
  }

  /* ---- render loop ---- */
  const clock = new THREE.Clock();

  function animate() {
    if (disposed) return;
    raf = requestAnimationFrame(animate);

    const t = clock.getElapsedTime();

    bodyMat.color.lerp(targetColor, 0.085);
    handleMat.color.lerp(targetColor, 0.085);
    rimMat.color.lerp(targetRim, 0.085);
    lidMat.color.lerp(targetLid, 0.085);
    strawMat.color.lerp(targetStraw, 0.085);
    bodyMat.roughness += (targetRoughness - bodyMat.roughness) * 0.07;
    bodyMat.metalness += (targetMetalness - bodyMat.metalness) * 0.07;

    if (spinVelocity > 0.0008) {
      group.rotation.y += spinVelocity;
      spinVelocity *= 0.93;
    }

    if (!reducedMotion && opts.floating) {
      const float = Math.sin(t * 1.15) * 0.035;
      group.position.y = -0.05 + float;
      shadow.material.opacity = 0.9 - (float + 0.035) * 2.2;
      shadow.scale.setScalar(1 + float * 0.1);
    }

    if (motes && !reducedMotion) {
      motes.rotation.y = t * 0.016;
      motes.position.y = Math.sin(t * 0.3) * 0.06;
    }

    controls.update();

    if (visible && !document.hidden) {
      renderer.render(scene, camera);
      if (!ready) {
        ready = true;
        container.classList.add('is-ready');
      }
    }
  }
  animate();

  function dispose() {
    disposed = true;
    cancelAnimationFrame(raf);
    window.clearTimeout(idleTimer);
    if (resizeObserver) resizeObserver.disconnect();
    if (intersectionObserver) intersectionObserver.disconnect();
    if (mobileQuery.removeEventListener) mobileQuery.removeEventListener('change', applyControlsMode);
    canvas.removeEventListener('webglcontextlost', handleContextLost);
    canvas.removeEventListener('keydown', handleKey);
    controls.dispose();
    scene.traverse(function (obj) {
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (obj.material.map) obj.material.map.dispose();
        obj.material.dispose();
      }
    });
    if (scene.environment) scene.environment.dispose();
    coatTex.dispose();
    renderer.dispose();
  }

  return {
    setPersonality: setPersonality,
    resize: resize,
    dispose: dispose
  };
}
