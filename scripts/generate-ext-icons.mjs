// 아이콘 PNG 생성 스크립트
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

  // 배경
  ctx.fillStyle = "#0f172a";
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.2);
  ctx.fill();

  // 원
  ctx.fillStyle = "#0ea5e9";
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size * 0.32, 0, Math.PI * 2);
  ctx.fill();

  // 체크
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = size * 0.1;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(size * 0.32, size * 0.5);
  ctx.lineTo(size * 0.46, size * 0.64);
  ctx.lineTo(size * 0.68, size * 0.38);
  ctx.stroke();

  return canvas.toBuffer("image/png");
}

for (const size of [16, 48, 128]) {
  const buf = makeIcon(size);
  writeFileSync(join(outDir, `icon${size}.png`), buf);
  console.log(`✓ icon${size}.png 생성`);
}
console.log("완료!");
