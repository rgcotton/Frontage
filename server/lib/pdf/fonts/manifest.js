import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function load(filename) {
  return readFileSync(join(__dirname, filename)).toString('base64');
}

// Each entry: { family, style, weight, data (base64) }
export const FONT_FACES = [
  { family: 'Inter', style: 'normal', weight: 400, data: load('inter-400.woff2') },
  { family: 'Inter', style: 'normal', weight: 600, data: load('inter-600.woff2') },
  { family: 'Inter', style: 'normal', weight: 700, data: load('inter-700.woff2') },
  { family: 'Libre Franklin', style: 'normal', weight: 600, data: load('libre-franklin-600.woff2') },
  { family: 'Libre Franklin', style: 'normal', weight: 800, data: load('libre-franklin-800.woff2') },
  { family: 'Source Serif 4', style: 'normal', weight: 400, data: load('source-serif-4-400.woff2') },
  { family: 'Source Serif 4', style: 'normal', weight: 700, data: load('source-serif-4-700.woff2') },
  { family: 'Space Grotesk', style: 'normal', weight: 500, data: load('space-grotesk-500.woff2') },
  { family: 'Space Grotesk', style: 'normal', weight: 700, data: load('space-grotesk-700.woff2') },
];

export function buildFontFaceCss() {
  return FONT_FACES.map(({ family, style, weight, data }) =>
    `@font-face { font-family: '${family}'; font-style: ${style}; font-weight: ${weight}; src: url('data:font/woff2;base64,${data}') format('woff2'); font-display: block; }`
  ).join('\n');
}
