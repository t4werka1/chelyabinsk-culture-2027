(function (root) {
  'use strict';
  const icons = {
    star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
    play: '<path d="m9 5 11 7-11 7Z"/>', arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>', back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
    map: '<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2Zm6-2v16m6-14v16"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 2v6m10-6v6M3 11h18m-13 5h2m4 0h2"/>',
    sound: '<path d="m11 4-6 5H2v6h3l6 5Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
    mute: '<path d="m11 4-6 5H2v6h3l6 5Zm5 5 6 6m0-6-6 6"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.6 2.6 0 1 1 4 2.2c-1.3.8-1.5 1.5-1.5 2.3m0 3h.01"/>',
    settings: '<path d="m9 3-1 3-3 1-2 3 2 3-1 3 3 2 3-1 3 2 3-2 1-3 3-1 1-4-3-2-1-3-4-1-2 2Z"/><circle cx="12" cy="11" r="3"/>',
    check: '<path d="m5 12 4 4L20 5"/>', lock: '<rect x="5" y="10" width="14" height="11" rx="3"/><path d="M8 10V7a4 4 0 0 1 8 0v3m-4 5v2"/>',
    close: '<path d="m6 6 12 12M6 18 18 6"/>', brush: '<path d="m10 12 8-10 4 4-10 8M4 13c5-2 8 2 5 6-1 2-5 2-7 2 2-2 0-5 2-8Z"/>',
    shuffle: '<path d="M3 5h3c5 0 7 14 12 14h3m-4-4 4 4-4 4M3 19h3c2 0 4-4 6-8m2-4c1-1 2-2 4-2h3m-4-4 4 4-4 4"/>',
    plus: '<path d="M12 4v16M4 12h16"/>', sparkle: '<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5Z"/>',
    leaf: '<path d="M20 3C8 1 2 7 5 15s17 3 15-12ZM5 19 16 8"/>', flag: '<path d="M5 22V3c5-4 9 4 15 0v11c-6 4-10-4-15 0"/>',
    ice: '<path d="m12 2 8 5v10l-8 5-8-5V7Zm0 0v20M4 7l16 10M20 7 4 17"/>', crate: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="m5 5 14 14M5 19 19 5"/>',
    trophy: '<path d="M7 3h10v7a5 5 0 0 1-10 0ZM7 5H3v4a4 4 0 0 0 5 4m9-8h4v4a4 4 0 0 1-5 4m-4 2v6m-5 0h10"/>',
    restart: '<path d="M3 11a9 9 0 1 1 2 7M3 4v7h7"/>', external: '<path d="M14 3h7v7m0-7L10 14m-1-9H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-4"/>'
  };
  function icon(name, className = '') { return `<svg class="icon ${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.sparkle}</svg>`; }
  const shapes = [
    'M18 8h28l10 14-6 31-18 6L10 46 8 22Z', 'M32 5 54 18 57 43 32 59 8 43 10 18Z',
    'M32 5 57 30 51 47 32 59 13 47 7 30Z', 'M21 6h22l16 22-8 25-19 7L13 53 5 28Z',
    'M18 7h28l13 25-13 25H18L5 32Z', 'M32 5C42 11 58 24 57 37S45 58 32 59 6 49 7 36 22 12 32 5Z'
  ];
  const glyphs = [
    '<path d="M19 21h26v7a4 4 0 0 0 0 8v7H19v-7a4 4 0 0 0 0-8Zm9 3v3m0 5v2m0 5v2"/>',
    '<path d="M29 39V20l16-3v19m-16-11 16-3"/><ellipse cx="24" cy="41" rx="5" ry="4"/><ellipse cx="40" cy="38" rx="5" ry="4"/>',
    '<path d="M17 20c8 4 13 4 21 0v13c-2 13-17 13-21 0Zm9 12c2 3 5 3 7 0m-11-5h1m9 0h1M40 26l7 2-2 14c-1 5-6 8-10 6"/>',
    '<path d="m32 17 4 10 11 1-8 7 2 11-9-6-9 6 2-11-8-7 11-1Z"/>',
    '<path d="M45 18C28 15 16 22 20 36s26 12 25-18ZM19 46l18-20m-12 9 10 1"/>',
    '<path d="M45 38c-5-1-6 4-5 7-9 9-27-1-25-14 1-13 17-20 28-13 10 7 10 18 2 20Z"/><circle cx="25" cy="26" r="1.5"/><circle cx="35" cy="23" r="1.5"/><circle cx="43" cy="29" r="1.5"/>'
  ];
  function piece(color, special = null) {
    if (special === 'rainbow') return `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="27" fill="url(#rainbow-tile)" stroke="#fff9" stroke-width="1.5"/><path d="m32 14 5 12 13 6-13 5-5 13-6-13-12-5 12-6Z" fill="white"/><circle cx="23" cy="18" r="3" fill="#fff8"/></svg>`;
    const specialMark = special === 'row' ? '<path d="M12 31h40m-6-6 7 6-7 6m-28 0-7-6 7-6"/>' : special === 'col' ? '<path d="M32 11v42m-6-6 6 7 6-7m0-29-6-7-6 7"/>' : special === 'bomb' ? '<circle cx="30" cy="35" r="12"/><path d="M35 23q0-11 10-9m-1-5v7m-4-4h8"/>' : glyphs[color];
    return `<svg viewBox="0 0 64 64" aria-hidden="true"><path d="${shapes[color]}" fill="url(#tile-${color})" stroke="#fff9" stroke-width="1.2"/><path d="${shapes[color]}" fill="none" stroke="#0002" stroke-width="2" transform="translate(0 2) scale(1 .96)"/><path d="M12 25 18 12 32 7 46 13 52 24 32 19Z" fill="#ffffff28"/><path d="M18 15 30 10 44 14" stroke="#fff8" stroke-width="2.2" fill="none" stroke-linecap="round"/><g fill="none" stroke="${special ? '#fff' : '#35205f'}" stroke-width="${special ? 3 : 2.1}" stroke-linecap="round" stroke-linejoin="round" opacity=".9">${specialMark}</g></svg>`;
  }
  function definitions() {
    const colors = [['#ffb4a8', '#ef6382'], ['#a2f0ff', '#3daedb'], ['#ddd0ff', '#9472e8'], ['#ffe7ab', '#ecad47'], ['#b5f5cf', '#4eb796'], ['#fbd0ef', '#cc73ce']];
    return `<svg class="svg-defs" aria-hidden="true"><defs>${colors.map((c, i) => `<linearGradient id="tile-${i}" x2=".5" y2="1"><stop stop-color="${c[0]}"/><stop offset="1" stop-color="${c[1]}"/></linearGradient>`).join('')}<linearGradient id="rainbow-tile" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#57e0ef"/><stop offset=".35" stop-color="#8e79f9"/><stop offset=".7" stop-color="#ec7fcf"/><stop offset="1" stop-color="#ffbc8f"/></linearGradient></defs></svg>`;
  }
  root.CultureArt = { icon, piece, definitions };
})(window);
