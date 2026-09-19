import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PALETTE = ["#ea580c", "#0f172a", "#0369a1", "#15803d", "#7c3aed", "#b91c1c", "#0891b2", "#a16207"];

function colorFor(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return PALETTE[hash % PALETTE.length];
}

function wrapLines(text: string, maxCharsPerLine: number) {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxCharsPerLine && current) {
      lines.push(current.trim());
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }
  if (current) lines.push(current);
  return lines.slice(0, 3);
}

export function buildPlaceholderSvg(label: string, width = 800, height = 800, showText = true) {
  const bg = colorFor(label);

  let textNodes = "";
  if (showText) {
    const lines = wrapLines(label, 18);
    const lineHeight = width * 0.06;
    const startY = height / 2 - ((lines.length - 1) * lineHeight) / 2;
    textNodes = lines
      .map(
        (line, i) =>
          `<text x="50%" y="${startY + i * lineHeight}" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial, Helvetica, sans-serif" font-size="${width * 0.055}" font-weight="700">${escapeXml(line)}</text>`
      )
      .join("");
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <rect width="100%" height="100%" fill="${bg}" />
  <rect width="100%" height="100%" fill="black" opacity="0.08" />
  ${textNodes}
</svg>`;
}

function escapeXml(text: string) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildBannerArtSvg(colorA: string, colorB: string, variant: number, width = 1600, height = 600) {
  // Three hand-tuned layouts so each banner looks distinct rather than a
  // recolored copy of the others.
  const layouts = [
    `<circle cx="${width - 150}" cy="${height - 100}" r="260" fill="white" opacity="0.07" />
     <circle cx="${width - 250}" cy="${height - 120}" r="150" fill="white" opacity="0.09" />
     <circle cx="140" cy="90" r="110" fill="white" opacity="0.05" />
     <g stroke="white" stroke-opacity="0.09" stroke-width="16">
       <line x1="${width * 0.55}" y1="${height + 100}" x2="${width + 100}" y2="-100" />
       <line x1="${width * 0.6}" y1="${height + 100}" x2="${width + 200}" y2="-100" />
       <line x1="${width * 0.65}" y1="${height + 100}" x2="${width + 300}" y2="-100" />
     </g>`,
    `<circle cx="150" cy="${height - 120}" r="240" fill="white" opacity="0.07" />
     <circle cx="${width - 180}" cy="120" r="170" fill="white" opacity="0.06" />
     <g stroke="white" stroke-opacity="0.08" stroke-width="16">
       <line x1="-100" y1="${height * 0.2}" x2="${width * 0.5}" y2="-150" />
       <line x1="-100" y1="${height * 0.3}" x2="${width * 0.55}" y2="-100" />
       <line x1="-100" y1="${height * 0.4}" x2="${width * 0.6}" y2="-50" />
     </g>`,
    `<circle cx="${width - 200}" cy="${height * 0.5}" r="220" fill="white" opacity="0.06" />
     <circle cx="${width - 380}" cy="${height * 0.35}" r="120" fill="white" opacity="0.08" />
     <circle cx="220" cy="${height - 80}" r="150" fill="white" opacity="0.05" />`,
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${colorA}" />
      <stop offset="100%" stop-color="${colorB}" />
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" />
  ${layouts[variant % layouts.length]}
</svg>`;
}

export async function writeBannerArt(colorA: string, colorB: string, variant: number, filename: string) {
  const dir = path.join(process.cwd(), "public", "uploads", "banners");
  await mkdir(dir, { recursive: true });
  const svg = buildBannerArtSvg(colorA, colorB, variant);
  const filePath = path.join(dir, `${filename}.svg`);
  await writeFile(filePath, svg, "utf-8");
  return `/uploads/banners/${filename}.svg`;
}

export async function writePlaceholderImage(
  label: string,
  subfolder: string,
  filename: string,
  width?: number,
  height?: number,
  showText = true
) {
  const dir = path.join(process.cwd(), "public", "uploads", subfolder);
  await mkdir(dir, { recursive: true });
  const svg = buildPlaceholderSvg(label, width, height, showText);
  const filePath = path.join(dir, `${filename}.svg`);
  await writeFile(filePath, svg, "utf-8");
  return `/uploads/${subfolder}/${filename}.svg`;
}
