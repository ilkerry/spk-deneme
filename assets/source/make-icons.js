/**
 * LisansQuiz ikon üretici. İkonlar SVG olarak çizilip PNG'ye çevrilir.
 * Kullanım (proje kökünden): node assets/source/make-icons.js assets/images
 * Gereken: playwright (npx playwright) ve Nunito yazı tipi (node_modules).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const FONT = '/home/user/spk-deneme/node_modules/@expo-google-fonts/nunito/900Black/Nunito_900Black.ttf';
const fontData = fs.readFileSync(FONT).toString('base64');
const OUT = process.argv[2];

// Kart sanatı: 1024x1024 tuval üzerinde, (cx,cy) merkezli, scale ölçekli
function art({ scale = 1, mono = false } = {}) {
  const ink = mono ? '#fff' : '#2B2350';
  const front = mono ? '#fff' : '#FFFFFF';
  const back = mono ? 'rgba(255,255,255,0.55)' : '#FFE1C2';
  const check = mono ? '#fff' : '#22C39A';
  return `
  <g transform="translate(512 512) scale(${scale}) translate(-512 -512)">
    <!-- arka kart -->
    <g transform="rotate(-12 512 540)">
      <rect x="292" y="250" width="440" height="560" rx="64" fill="${back}" ${mono ? '' : 'stroke="#E0700B" stroke-width="10"'}/>
    </g>
    <!-- ön kart -->
    <g transform="rotate(7 512 520)">
      ${mono ? '' : '<rect x="300" y="250" width="440" height="560" rx="64" fill="#C9600A" opacity="0.35" transform="translate(0 22)"/>'}
      <rect x="300" y="236" width="440" height="560" rx="64" fill="${front}"/>
      ${mono ? '<rect x="300" y="236" width="440" height="560" rx="64" fill="none"/>' : ''}
      <text x="520" y="590" text-anchor="middle" font-family="NunitoBlack" font-size="250" fill="${mono ? '#000' : ink}" ${mono ? 'style="mix-blend-mode:destination-out"' : ''}>LQ</text>
      <rect x="370" y="650" width="190" height="26" rx="13" fill="${mono ? '#000' : '#FFD9B0'}"/>
      <rect x="575" y="650" width="95" height="26" rx="13" fill="${mono ? '#000' : '#FFD9B0'}"/>
    </g>
    <!-- onay rozeti -->
    <circle cx="745" cy="770" r="118" fill="${check}" ${mono ? '' : 'stroke="#fff" stroke-width="22"'}/>
    <path d="M690 772 l38 38 l78 -84" fill="none" stroke="${mono ? '#000' : '#fff'}" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  </g>`;
}

// Tek renkli (Android temalı ikon): dolu siluet, harfler ve ✓ oyuk
function monoArt(scale) {
  return `
  <mask id="cut" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#fff"/>
    <g transform="rotate(7 512 520)">
      <text x="520" y="590" text-anchor="middle" font-family="NunitoBlack" font-size="250" fill="#000">LQ</text>
      <rect x="370" y="650" width="190" height="26" rx="13" fill="#000"/>
      <rect x="575" y="650" width="95" height="26" rx="13" fill="#000"/>
    </g>
    <circle cx="745" cy="770" r="140" fill="#000"/>
  </mask>
  <mask id="cutCheck" maskUnits="userSpaceOnUse" x="0" y="0" width="1024" height="1024">
    <rect width="1024" height="1024" fill="#fff"/>
    <path d="M690 772 l38 38 l78 -84" fill="none" stroke="#000" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  </mask>
  <g transform="translate(512 512) scale(${scale}) translate(-512 -512)" fill="#fff">
    <g mask="url(#cut)">
      <g transform="rotate(-12 512 540)"><rect x="292" y="250" width="440" height="560" rx="64" opacity="0.5"/></g>
      <g transform="rotate(7 512 520)"><rect x="300" y="236" width="440" height="560" rx="64"/></g>
    </g>
    <circle cx="745" cy="770" r="118" mask="url(#cutCheck)"/>
  </g>`;
}

function svg({ bg = true, scale = 1, mono = false, size = 1024 }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  <defs>
    <style>@font-face{font-family:NunitoBlack;src:url(data:font/ttf;base64,${fontData});}</style>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#FFB25C"/><stop offset="1" stop-color="#F27A0C"/>
    </linearGradient>
    <radialGradient id="shine" cx="0.25" cy="0.15" r="0.7">
      <stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${bg ? '<rect width="1024" height="1024" fill="url(#g)"/><rect width="1024" height="1024" fill="url(#shine)"/>' : ''}
  ${mono ? monoArt(scale) : art({ scale })}
</svg>`;
}

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage();
  const render = async (name, opts, px) => {
    await p.setViewportSize({ width: px, height: px });
    await p.setContent(`<html><body style="margin:0;background:transparent">${svg({ ...opts, size: px })}</body></html>`);
    await p.evaluate(() => document.fonts.ready);
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${OUT}/${name}`, omitBackground: !opts.bg, clip: { x: 0, y: 0, width: px, height: px } });
    console.log('✓', name, px);
  };
  await render('icon.png', { bg: true, scale: 0.92 }, 1024);                     // iOS + genel
  await render('android-icon-foreground.png', { bg: false, scale: 0.62 }, 1024); // güvenli alan %66
  await render('android-icon-monochrome.png', { bg: false, scale: 0.62, mono: true }, 1024);
  await render('splash-icon.png', { bg: false, scale: 0.9 }, 1024);
  await render('favicon.png', { bg: true, scale: 0.95 }, 48);
  // Android arka plan: düz turuncu
  await p.setViewportSize({ width: 1024, height: 1024 });
  await p.setContent('<html><body style="margin:0"><div style="width:1024px;height:1024px;background:linear-gradient(135deg,#FFB25C,#F27A0C)"></div></body></html>');
  await p.screenshot({ path: `${OUT}/android-icon-background.png` });
  console.log('✓ android-icon-background.png');
  await b.close();
})();
