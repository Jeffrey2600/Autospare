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
