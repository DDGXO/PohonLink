/* eslint-disable */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Crisp SVG of the iconic Pohonlink Herb/Seedling (🌿)
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0d140e" />
      <stop offset="100%" stop-color="#040604" />
    </linearGradient>
    <linearGradient id="stemGrad" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#15803d" />
      <stop offset="40%" stop-color="#22c55e" />
      <stop offset="100%" stop-color="#4ade80" />
    </linearGradient>
    <linearGradient id="leafGrad1" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#16a34a" />
      <stop offset="100%" stop-color="#4ade80" />
    </linearGradient>
    <linearGradient id="leafGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#86efac" />
      <stop offset="100%" stop-color="#22c55e" />
    </linearGradient>
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background rounded icon container -->
  <rect x="16" y="16" width="480" height="480" rx="108" fill="url(#bgGrad)" stroke="#4ade80" stroke-width="6" stroke-opacity="0.28" />

  <!-- Ambient light glow -->
  <circle cx="256" cy="256" r="160" fill="#4ade80" opacity="0.10" />

  <!-- The Herb / Branch (🌿) -->
  <g id="sprout">
    <!-- Main stem with natural gentle curve -->
    <path d="M 175 375 Q 240 330 330 160" fill="none" stroke="url(#stemGrad)" stroke-width="22" stroke-linecap="round" />

    <!-- Terminal apex leaf -->
    <path d="M 330 160 C 352 110 396 100 406 128 C 416 156 378 184 330 160 Z" fill="url(#leafGrad2)" />

    <!-- Pair 1: Top leaves -->
    <path d="M 292 208 C 236 178 214 218 228 248 C 252 268 284 238 292 208 Z" fill="url(#leafGrad1)" />
    <path d="M 276 230 C 334 194 374 216 364 250 C 350 274 306 260 276 230 Z" fill="url(#leafGrad2)" />

    <!-- Pair 2: Middle leaves -->
    <path d="M 242 274 C 180 252 164 300 188 330 C 218 344 238 308 242 274 Z" fill="url(#leafGrad1)" />
    <path d="M 218 302 C 280 278 316 308 306 342 C 292 366 248 336 218 302 Z" fill="url(#leafGrad2)" />

    <!-- Base Sprout Leaf -->
    <path d="M 188 348 C 136 338 132 376 152 396 C 176 406 192 378 188 348 Z" fill="url(#leafGrad1)" />
  </g>
</svg>`;

// Transparent variant for favicons and flexible usage
const svgTransparent = svgContent.replace(
  /<rect x="16" y="16" width="480" height="480" rx="108"[^>]*\/>/,
  ''
);

async function generate() {
  const svgBuffer = Buffer.from(svgContent);
  const svgTransBuffer = Buffer.from(svgTransparent);

  // 1. Save SVG
  fs.writeFileSync(path.join(publicDir, 'logo.svg'), svgContent);
  fs.writeFileSync(path.join(publicDir, 'logo-transparent.svg'), svgTransparent);

  // 2. Main logo.png (512x512)
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'logo.png'));

  // 3. Apple Touch Icon (180x180)
  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 4. Icons for manifest / PWA
  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  // 5. Favicon PNG (32x32)
  await sharp(svgBuffer)
    .resize(32, 32)
    .png()
    .toFile(path.join(publicDir, 'favicon-32x32.png'));

  // 6. Favicon ICO (standard 48x48)
  await sharp(svgBuffer)
    .resize(48, 48)
    .toFormat('png')
    .toFile(path.join(publicDir, 'favicon.ico'));

  console.log('Successfully generated: logo.png, logo.svg, favicon.ico, apple-touch-icon.png, icon-192.png, icon-512.png');
}

generate().catch(err => {
  console.error('Generation failed:', err);
  process.exit(1);
});
