const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function generate() {
  const publicDir = path.join(__dirname, '..', 'public');
  const iconsDir = path.join(publicDir, 'icons');
  const screenshotsDir = path.join(publicDir, 'screenshots');

  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });
  if (!fs.existsSync(screenshotsDir)) fs.mkdirSync(screenshotsDir, { recursive: true });

  const baseLogoPath = path.join(publicDir, 'logo.png');

  const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

  for (const size of sizes) {
    await sharp(baseLogoPath)
      .resize(size, size, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 1 } })
      .png()
      .toFile(path.join(iconsDir, `icon-${size}x${size}.png`));
    console.log(`Generated icon-${size}x${size}.png`);
  }

  // Generate standard root icon-192.png and icon-512.png
  await sharp(baseLogoPath).resize(192, 192).png().toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(baseLogoPath).resize(512, 512).png().toFile(path.join(publicDir, 'icon-512.png'));

  // Generate Maskable Icons with 10% padding safe zone
  for (const size of [192, 512]) {
    const innerSize = Math.round(size * 0.8);
    const padding = Math.round((size - innerSize) / 2);

    const resizedLogo = await sharp(baseLogoPath)
      .resize(innerSize, innerSize, { fit: 'contain', background: { r: 5, g: 5, b: 5, alpha: 0 } })
      .toBuffer();

    await sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: { r: 10, g: 10, b: 10, alpha: 1 },
      },
    })
      .composite([{ input: resizedLogo, top: padding, left: padding }])
      .png()
      .toFile(path.join(iconsDir, `icon-maskable-${size}.png`));

    console.log(`Generated icon-maskable-${size}.png`);
  }

  // Generate Desktop Screenshot (1280x720, Wide)
  const desktopSvg = `
  <svg width="1280" height="720" viewBox="0 0 1280 720" xmlns="http://www.w3.org/2000/svg">
    <rect width="1280" height="720" fill="#0a0a0a"/>
    <!-- Topbar -->
    <rect x="0" y="0" width="1280" height="60" fill="#141414" stroke="#262626" stroke-width="1"/>
    <text x="40" y="38" fill="#4ade80" font-family="sans-serif" font-size="22" font-weight="bold">🌿 Pohonlink</text>
    <text x="180" y="37" fill="#888888" font-family="sans-serif" font-size="14">/ dashboard</text>
    
    <!-- Sidebar -->
    <rect x="0" y="60" width="240" height="660" fill="#111111" stroke="#262626" stroke-width="1"/>
    <text x="30" y="110" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="600">▦ Dashboard</text>
    <text x="30" y="150" fill="#4ade80" font-family="sans-serif" font-size="14" font-weight="600">🔗 Links &amp; Embeds</text>
    <text x="30" y="190" fill="#888888" font-family="sans-serif" font-size="14">🛍️ Toko Produk</text>
    <text x="30" y="230" fill="#888888" font-family="sans-serif" font-size="14">🎨 Tampilan &amp; Tema</text>
    <text x="30" y="270" fill="#888888" font-family="sans-serif" font-size="14">📈 Analitik Lengkap</text>
    <text x="30" y="310" fill="#888888" font-family="sans-serif" font-size="14">⚙️ Pengaturan Sub-Settings</text>

    <!-- Main Content Area -->
    <rect x="270" y="90" width="600" height="120" rx="12" fill="#161616" stroke="#2a2a2a" stroke-width="1"/>
    <text x="300" y="130" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="bold">Halo, Kreator Indonesia 👋</text>
    <text x="300" y="160" fill="#4ade80" font-family="sans-serif" font-size="14">pohonlink.id/@username</text>
    <text x="300" y="185" fill="#888888" font-family="sans-serif" font-size="12">1,420 views • 680 klik • 47.8% CTR</text>

    <!-- Link List Cards -->
    <rect x="270" y="230" width="600" height="70" rx="10" fill="#161616" stroke="#4ade80" stroke-width="1"/>
    <text x="300" y="265" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="600">⭐ Instagram &amp; Komunitas VIP</text>
    <text x="300" y="285" fill="#888888" font-family="sans-serif" font-size="12">instagram.com/kreator • 342 klik</text>

    <rect x="270" y="315" width="600" height="70" rx="10" fill="#161616" stroke="#2a2a2a" stroke-width="1"/>
    <text x="300" y="350" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="600">🛍️ E-Book Masterclass Coding</text>
    <text x="300" y="370" fill="#888888" font-family="sans-serif" font-size="12">Rp 99.000 • 189 klik</text>

    <rect x="270" y="400" width="600" height="70" rx="10" fill="#161616" stroke="#2a2a2a" stroke-width="1"/>
    <text x="300" y="435" fill="#ffffff" font-family="sans-serif" font-size="15" font-weight="600">📅 Konsultasi 1-on-1 Calendly</text>
    <text x="300" y="455" fill="#888888" font-family="sans-serif" font-size="12">calendly.com/kreator • 104 klik</text>

    <!-- Live Preview Mockup Frame -->
    <rect x="910" y="90" width="330" height="580" rx="36" fill="#000000" stroke="#333333" stroke-width="4"/>
    <circle cx="1075" cy="180" r="36" fill="#1e1e1e" stroke="#4ade80" stroke-width="2"/>
    <text x="1075" y="190" text-anchor="middle" font-size="30">🌿</text>
    <text x="1075" y="240" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">@kreator</text>
    <text x="1075" y="262" text-anchor="middle" fill="#888888" font-family="sans-serif" font-size="12">Digital Creator &amp; Tech Enthusiast</text>

    <rect x="940" y="290" width="270" height="46" rx="10" fill="#1c1c1c" stroke="#4ade80" stroke-width="1"/>
    <text x="1075" y="318" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="600">Instagram VIP</text>

    <rect x="940" y="348" width="270" height="46" rx="10" fill="#1c1c1c" stroke="#333333" stroke-width="1"/>
    <text x="1075" y="376" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="600">E-Book Masterclass</text>

    <rect x="940" y="406" width="270" height="46" rx="10" fill="#1c1c1c" stroke="#333333" stroke-width="1"/>
    <text x="1075" y="434" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="13" font-weight="600">Konsultasi Calendly</text>
  </svg>
  `;

  await sharp(Buffer.from(desktopSvg))
    .png()
    .toFile(path.join(screenshotsDir, 'desktop.png'));
  console.log('Generated screenshots/desktop.png');

  // Generate Mobile Screenshot (750x1334, Narrow)
  const mobileSvg = `
  <svg width="750" height="1334" viewBox="0 0 750 1334" xmlns="http://www.w3.org/2000/svg">
    <rect width="750" height="1334" fill="#080808"/>
    <!-- Top Notch -->
    <rect x="250" y="16" width="250" height="30" rx="15" fill="#1a1a1a"/>
    
    <!-- Profile Avatar & Details -->
    <circle cx="375" cy="180" r="70" fill="#161616" stroke="#4ade80" stroke-width="3"/>
    <text x="375" y="200" text-anchor="middle" font-size="60">🌿</text>
    <text x="375" y="295" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="28" font-weight="bold">DGame Official</text>
    <text x="375" y="335" text-anchor="middle" fill="#4ade80" font-family="sans-serif" font-size="20" font-weight="600">@dgame</text>
    <text x="375" y="375" text-anchor="middle" fill="#999999" font-family="sans-serif" font-size="18">Kreator Konten &amp; Software Developer</text>

    <!-- Social Row -->
    <circle cx="285" cy="435" r="22" fill="#1a1a1a" stroke="#333333" stroke-width="1"/>
    <text x="285" y="443" text-anchor="middle" font-size="18">📸</text>
    <circle cx="345" cy="435" r="22" fill="#1a1a1a" stroke="#333333" stroke-width="1"/>
    <text x="345" y="443" text-anchor="middle" font-size="18">💬</text>
    <circle cx="405" cy="435" r="22" fill="#1a1a1a" stroke="#333333" stroke-width="1"/>
    <text x="405" y="443" text-anchor="middle" font-size="18">▶️</text>
    <circle cx="465" cy="435" r="22" fill="#1a1a1a" stroke="#333333" stroke-width="1"/>
    <text x="465" y="443" text-anchor="middle" font-size="18">🌐</text>

    <!-- Buttons -->
    <rect x="75" y="490" width="600" height="90" rx="16" fill="#141414" stroke="#4ade80" stroke-width="2"/>
    <text x="375" y="546" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="700">⭐ Gabung Komunitas VIP</text>

    <rect x="75" y="605" width="600" height="90" rx="16" fill="#141414" stroke="#262626" stroke-width="1"/>
    <text x="375" y="661" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="700">🛍️ Toko Produk Digital</text>

    <rect x="75" y="720" width="600" height="90" rx="16" fill="#141414" stroke="#262626" stroke-width="1"/>
    <text x="375" y="776" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="700">📅 Booking Sesi Konsultasi</text>

    <rect x="75" y="835" width="600" height="90" rx="16" fill="#141414" stroke="#262626" stroke-width="1"/>
    <text x="375" y="891" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="700">📩 Simpan Kontak ke HP (vCard)</text>

    <!-- Footer -->
    <text x="375" y="1250" text-anchor="middle" fill="#555555" font-family="sans-serif" font-size="16">🌿 Dibuat dengan Pohonlink</text>
  </svg>
  `;

  await sharp(Buffer.from(mobileSvg))
    .png()
    .toFile(path.join(screenshotsDir, 'mobile.png'));
  console.log('Generated screenshots/mobile.png');

  console.log('All PWA assets generated successfully!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
