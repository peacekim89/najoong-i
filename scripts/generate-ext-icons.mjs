import { createCanvas } from "canvas";
import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, "../chrome-extension/icons");
mkdirSync(outDir, { recursive: true });

function makeIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");
  const c = size / 2;
  const r = size * 0.46;

  // 배경 — 연핑크 그라디언트
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, "#fdf2f8");
  bg.addColorStop(1, "#fce7f3");
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  // 꽃잎 5장
  const petalCount = 5;
  const petalR = r * 0.38;
  const petalDist = r * 0.42;
  for (let i = 0; i < petalCount; i++) {
    const angle = (i / petalCount) * Math.PI * 2 - Math.PI / 2;
    const px = c + Math.cos(angle) * petalDist;
    const py = c + Math.sin(angle) * petalDist;
    const grad = ctx.createRadialGradient(px, py, 0, px, py, petalR);
    grad.addColorStop(0, "#f9a8d4");
    grad.addColorStop(1, "#f472b6");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(px, py, petalR, petalR * 0.65, angle, 0, Math.PI * 2);
    ctx.fill();
  }

  // 꽃 중앙
  const centerGrad = ctx.createRadialGradient(c, c, 0, c, c, r * 0.28);
  centerGrad.addColorStop(0, "#fef9c3");
  centerGrad.addColorStop(1, "#fde047");
  ctx.fillStyle = centerGrad;
  ctx.beginPath();
  ctx.arc(c, c, r * 0.28, 0, Math.PI * 2);
  ctx.fill();

  // 중앙 점
  ctx.fillStyle = "#f59e0b";
  ctx.beginPath();
  ctx.arc(c, c, r * 0.10, 0, Math.PI * 2);
  ctx.fill();

  return canvas.toBuffer("image/png");
}

for (const size of [16, 48, 128]) {
  const buf = makeIcon(size);
  writeFileSync(join(outDir, `icon${size}.png`), buf);
  console.log(`✓ icon${size}.png 생성`);
}
console.log("완료!");
