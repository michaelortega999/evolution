import { build } from 'esbuild';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

// A separate document preserves the original promo's CSS without affecting the app.
const output = resolve('public/evolution-promo');
await mkdir(output, { recursive: true });
await build({
  entryPoints: ['src/promo/main.tsx'], bundle: true, minify: true,
  outfile: `${output}/promo-v2.js`, format: 'esm', platform: 'browser',
  jsx: 'automatic', alias: { '@': resolve('src') },
  define: { 'process.env.NODE_ENV': '"production"' },
});
await writeFile(`${output}/index.html`, `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Evolution OS — Your digital home</title>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&family=Michroma&display=swap">
<link rel="stylesheet" href="./promo.css"></head>
<body><div id="root"></div><script type="module" src="./promo-v2.js?v=release-1"></script></body></html>`);
