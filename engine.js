(function (root) {
  'use strict';
  const SIZE = 8;
  const SPECIALS = [null, 'row', 'col', 'bomb', 'rainbow'];
  const clone = value => JSON.parse(JSON.stringify(value));
  const validIndex = (g, i) => Number.isInteger(i) && i >= 0 && i < g.n * g.n;
  const adjacent = (g, a, b) => validIndex(g, a) && validIndex(g, b) && Math.abs(a % g.n - b % g.n) + Math.abs(Math.floor(a / g.n) - Math.floor(b / g.n)) === 1;
  function random(g) {
    g.rng = (g.rng + 0x6D2B79F5) >>> 0;
    let t = Math.imul(g.rng ^ (g.rng >>> 15), 1 | g.rng);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  const tile = (g, color) => ({ color: color === undefined ? Math.floor(random(g) * g.colorCount) : color, special: null });
  function neighbors(g, i) {
    const r = Math.floor(i / g.n), c = i % g.n, out = [];
    if (r) out.push(i - g.n);
    if (r < g.n - 1) out.push(i + g.n);
    if (c) out.push(i - 1);
    if (c < g.n - 1) out.push(i + 1);
    return out;
  }
  function area(g, i, radius) {
    const r = Math.floor(i / g.n), c = i % g.n, out = [];
    for (let y = Math.max(0, r - radius); y <= Math.min(g.n - 1, r + radius); y++) {
      for (let x = Math.max(0, c - radius); x <= Math.min(g.n - 1, c + radius); x++) out.push(y * g.n + x);
    }
    return out;
  }
  function line(g, i, axis, width = 0) {
    const r = Math.floor(i / g.n), c = i % g.n, out = [];
    for (let j = 0; j < g.n * g.n; j++) {
      if (axis === 'row' ? Math.abs(Math.floor(j / g.n) - r) <= width : Math.abs(j % g.n - c) <= width) out.push(j);
    }
    return out;
  }
  function findMatches(g) {
    const runs = [];
    for (const axis of ['row', 'col']) {
      for (let outer = 0; outer < g.n; outer++) {
        let run = [], color = -1;
        const flush = () => { if (run.length >= 3) runs.push({ cells: run, axis, length: run.length }); };
        for (let inner = 0; inner <= g.n; inner++) {
          const i = axis === 'row' ? outer * g.n + inner : inner * g.n + outer;
          const cell = inner < g.n ? g.board[i] : null;
          const next = cell && cell.special !== 'rainbow' ? cell.color : -1;
          if (next >= 0 && next === color) run.push(i);
          else { flush(); run = next >= 0 ? [i] : []; color = next; }
        }
      }
    }
    const groups = [];
    for (const run of runs) {
      const connected = groups.filter(gp => run.cells.some(i => gp.cells.has(i)));
      const group = { cells: new Set(run.cells), axes: new Set([run.axis]), max: run.length, axis: run.axis };
      for (const gp of connected) {
        gp.cells.forEach(i => group.cells.add(i)); gp.axes.forEach(a => group.axes.add(a));
        if (gp.max > group.max) { group.max = gp.max; group.axis = gp.axis; }
        groups.splice(groups.indexOf(gp), 1);
      }
      groups.push(group);
    }
    return groups.map(gp => ({ cells: [...gp.cells].sort((a, b) => a - b), special: gp.max >= 5 ? 'rainbow' : gp.axes.size > 1 && gp.cells.size >= 5 ? 'bomb' : gp.max === 4 ? gp.axis : null }));
  }
  function possibleMoves(g) {
    const result = [];
    for (let a = 0; a < g.board.length; a++) {
      if (!g.board[a]) continue;
      for (const b of [a + 1, a + g.n]) {
        if (!adjacent(g, a, b) || !g.board[b]) continue;
        if (g.board[a].special || g.board[b].special) { result.push([a, b]); continue; }
        [g.board[a], g.board[b]] = [g.board[b], g.board[a]];
        const match = findMatches(g).some(m => m.cells.includes(a) || m.cells.includes(b));
        [g.board[a], g.board[b]] = [g.board[b], g.board[a]];
        if (match) result.push([a, b]);
      }
    }
    return result;
  }
  function fillFresh(g) {
    for (let attempt = 0; attempt < 100; attempt++) {
      g.board = Array(g.n * g.n).fill(null);
      for (let i = 0; i < g.board.length; i++) {
        if (g.crates[i]) continue;
        const forbidden = new Set();
        if (i % g.n >= 2 && g.board[i - 1] && g.board[i - 2] && g.board[i - 1].color === g.board[i - 2].color) forbidden.add(g.board[i - 1].color);
        if (i >= g.n * 2 && g.board[i - g.n] && g.board[i - 2 * g.n] && g.board[i - g.n].color === g.board[i - 2 * g.n].color) forbidden.add(g.board[i - g.n].color);
        const choices = Array.from({ length: g.colorCount }, (_, c) => c).filter(c => !forbidden.has(c));
        g.board[i] = tile(g, choices[Math.floor(random(g) * choices.length)]);
      }
      if (possibleMoves(g).length) return;
    }
    throw new Error('Unable to create a playable board for this level');
  }
  function createGame(level, seed = Date.now()) {
    if (!level || !Number.isInteger(level.id) || !Array.isArray(level.targets)) throw new Error('Invalid level definition');
    if (!Number.isInteger(level.moves) || level.moves <= 0) throw new Error('Level moves must be positive');
    if (!Number.isInteger(level.colors) || level.colors < 4 || level.colors > 6) throw new Error('Invalid level colors');
    const g = { n: SIZE, levelId: level.id, rng: seed >>> 0, colorCount: level.colors, board: [], ice: Array(64).fill(0), crates: Array(64).fill(0), moves: level.moves, score: 0, counts: [0, 0, 0, 0, 0, 0], iceCleared: 0, cratesCleared: 0, turns: 0, status: 'playing', targets: clone(level.targets) };
    for (const [type, cells] of [['ice', level.ice || []], ['crates', level.crates || []]]) {
      for (const i of cells) {
        if (!validIndex(g, i)) throw new Error('Invalid obstacle position');
        g[type][i] = 1;
      }
    }
    if (g.ice.some((v, i) => v && g.crates[i])) throw new Error('Obstacles cannot overlap');
    fillFresh(g);
    return g;
  }
  function targetValue(g, target) {
    return target.type === 'color' ? g.counts[target.color] : target.type === 'ice' ? g.iceCleared : g.cratesCleared;
  }
  function won(g) { return g.targets.every(t => targetValue(g, t) >= t.amount); }
  function frame(g, kind, extra = {}) { return { kind, board: clone(g.board), ice: [...g.ice], crates: [...g.crates], score: g.score, counts: [...g.counts], iceCleared: g.iceCleared, cratesCleared: g.cratesCleared, ...extra }; }
  function drop(g) {
    const drops = [];
    for (let col = 0; col < g.n; col++) {
      let bottom = g.n - 1;
      while (bottom >= 0) {
        if (g.crates[bottom * g.n + col]) { bottom--; continue; }
        let top = bottom;
        while (top > 0 && !g.crates[(top - 1) * g.n + col]) top--;
        const cells = [];
        for (let y = bottom; y >= top; y--) { const cell = g.board[y * g.n + col]; if (cell) cells.push({ cell, from: y * g.n + col }); }
        for (let y = bottom; y >= top; y--) {
          const source = cells[bottom - y], to = y * g.n + col;
          g.board[to] = source ? source.cell : tile(g);
          drops.push({ to, from: source ? source.from : (top - 1 - (bottom - y - cells.length)) * g.n + col });
        }
        bottom = top - 1;
      }
    }
    return drops;
  }
  function mostCommonColor(g) {
    const counts = Array(6).fill(0); g.board.forEach(c => { if (c && c.special !== 'rainbow') counts[c.color]++; });
    return counts.indexOf(Math.max(...counts));
  }
  function clearWave(g, seedHits, created, adjacencyHits, suppressed = new Set()) {
    const hits = new Set(seedHits), queue = [...hits];
    for (let k = 0; k < queue.length; k++) {
      const i = queue[k], cell = g.board[i];
      if (!cell || !cell.special || created.has(i) || suppressed.has(i)) continue;
      const extra = cell.special === 'row' || cell.special === 'col' ? line(g, i, cell.special) : cell.special === 'bomb' ? area(g, i, 1) : g.board.flatMap((c, j) => c && c.color === mostCommonColor(g) ? [j] : []);
      for (const j of extra) if (!hits.has(j)) { hits.add(j); queue.push(j); }
    }
    const crateHits = new Set([...hits].filter(i => g.crates[i]));
    for (const i of adjacencyHits) for (const j of neighbors(g, i)) if (g.crates[j]) crateHits.add(j);
    const removed = [];
    for (const i of hits) {
      if (g.ice[i]) { g.ice[i]--; g.iceCleared++; g.score += 50; }
      if (created.has(i)) continue;
      const cell = g.board[i];
      if (cell) { g.counts[cell.color]++; g.score += 60; g.board[i] = null; removed.push(i); }
    }
    for (const i of crateHits) { g.crates[i]--; g.cratesCleared++; g.score += 100; }
    for (const [i, special] of created) if (g.board[i]) g.board[i].special = special;
    return { hits: [...new Set([...removed, ...crateHits])].sort((a, b) => a - b), created: [...created.keys()] };
  }
  function shuffleBoard(g) {
    const slots = g.board.flatMap((c, i) => c ? [i] : []), cells = slots.map(i => g.board[i]);
    for (let attempt = 0; attempt < 150; attempt++) {
      for (let i = cells.length - 1; i > 0; i--) { const j = Math.floor(random(g) * (i + 1)); [cells[i], cells[j]] = [cells[j], cells[i]]; }
      slots.forEach((i, j) => { g.board[i] = cells[j]; });
      if (!findMatches(g).length && possibleMoves(g).length) return;
    }
    fillFresh(g);
  }
  function settle(g, frames, preferred = []) {
    for (let wave = 0; ; wave++) {
      if (wave > 100) throw new Error('Cascade exceeded safety limit');
      const groups = findMatches(g);
      if (!groups.length) break;
      const seeds = new Set(groups.flatMap(m => m.cells)), created = new Map();
      for (const m of groups) {
        if (!m.special) continue;
        const pos = preferred.find(i => m.cells.includes(i) && !g.board[i].special) ?? m.cells.find(i => !g.board[i].special);
        if (pos !== undefined) created.set(pos, m.special);
      }
      const details = clearWave(g, seeds, created, seeds);
      g.score += wave * details.hits.length * 15;
      frames.push(frame(g, 'clear', { ...details, combo: wave + 1 }));
      const drops = drop(g); frames.push(frame(g, 'fall', { drops }));
      preferred = [];
    }
    g.status = won(g) ? 'won' : g.moves <= 0 ? 'lost' : 'playing';
    if (g.status === 'playing' && !possibleMoves(g).length) { shuffleBoard(g); frames.push(frame(g, 'shuffle')); }
    return g;
  }
  const rejected = (state, reason) => ({ accepted: false, state, frames: [], reason });
  function swap(state, a, b) {
    if (state.status !== 'playing' || state.moves <= 0) return rejected(state, 'finished');
    if (!adjacent(state, a, b) || !state.board[a] || !state.board[b]) return rejected(state, 'invalid');
    const g = clone(state), frames = [];
    [g.board[a], g.board[b]] = [g.board[b], g.board[a]];
    const ca = g.board[a], cb = g.board[b], special = ca.special || cb.special;
    if (!special && !findMatches(g).length) return rejected(state, 'no-match');
    g.moves--; g.turns++;
    if (special) {
      const seeds = new Set([a, b]), suppressed = new Set();
      const add = list => list.forEach(i => seeds.add(i));
      if (ca.special === 'rainbow' || cb.special === 'rainbow') {
        const rainbowAt = ca.special === 'rainbow' ? a : b, otherAt = rainbowAt === a ? b : a, other = g.board[otherAt];
        suppressed.add(rainbowAt);
        if (other.special === 'rainbow') { add(g.board.map((_, i) => i)); suppressed.add(otherAt); }
        else {
          g.board.forEach((c, i) => { if (c && c.color === other.color) { seeds.add(i); if (other.special) c.special = other.special; } });
        }
      } else if (ca.special && cb.special) {
        suppressed.add(a); suppressed.add(b);
        if (ca.special === 'bomb' && cb.special === 'bomb') add(area(g, b, 2));
        else if (ca.special === 'bomb' || cb.special === 'bomb') { add(line(g, b, 'row', 1)); add(line(g, b, 'col', 1)); }
        else { add(line(g, b, 'row')); add(line(g, b, 'col')); }
      } else {
        // Only the exchanged special is activated; the other tile is collected with it.
        const at = ca.special ? a : b;
        add(g.board[at].special === 'bomb' ? area(g, at, 1) : line(g, at, g.board[at].special));
      }
      const details = clearWave(g, seeds, new Map(), new Set(), suppressed);
      frames.push(frame(g, 'clear', { ...details, combo: 1 })); const drops = drop(g); frames.push(frame(g, 'fall', { drops }));
    }
    settle(g, frames, [b, a]);
    return { accepted: true, state: g, frames };
  }
  function boost(state, type, index) {
    if (state.status === 'won' || !['brush', 'shuffle', 'moves'].includes(type)) return rejected(state, 'invalid');
    if (state.status === 'lost' && type !== 'moves') return rejected(state, 'finished');
    if (type === 'brush' && !validIndex(state, index)) return rejected(state, 'invalid');
    const g = clone(state), frames = [];
    if (type === 'moves') { g.moves += 5; g.status = 'playing'; }
    if (type === 'shuffle') { shuffleBoard(g); frames.push(frame(g, 'shuffle')); }
    if (type === 'brush') {
      const details = clearWave(g, new Set([index]), new Map(), new Set());
      frames.push(frame(g, 'clear', { ...details, combo: 1 })); const drops = drop(g); frames.push(frame(g, 'fall', { drops })); settle(g, frames);
    }
    return { accepted: true, state: g, frames };
  }
  function newProfile() {
    return { schema: 2, culture: 0, upgrades: Array.from({ length: 6 }, () => [false, false, false]), completed: {}, tasks: [0, 0, 0, 0, 0, 0], boosters: { brush: 3, shuffle: 3, moves: 3 }, active: null, settings: { sound: false, reduced: false }, tutorialSeen: false };
  }
  function unlockedChapter(p) {
    for (let ch = 0; ch < 5; ch++) if (p.tasks[ch] !== 3 || !Array.from({ length: 6 }, (_, j) => ch * 6 + j + 1).every(id => p.completed[id] !== undefined)) return ch;
    return 5;
  }
  function levelUnlocked(p, id) {
    if (!Number.isInteger(id) || id < 1 || id > 36 || Math.floor((id - 1) / 6) > unlockedChapter(p)) return false;
    return id === 1 || p.completed[id] !== undefined || p.completed[id - 1] !== undefined;
  }
  function awardWin(p, game) {
    if (game.status !== 'won' || !levelUnlocked(p, game.levelId)) return p;
    const next = clone(p), id = game.levelId;
    if (next.completed[id] === undefined) {
      next.culture += 100;
      if (id % 3 === 0) next.boosters[['brush', 'shuffle', 'moves'][(id / 3 - 1) % 3]]++;
    }
    next.completed[id] = Math.max(next.completed[id] || 0, game.score);
    return next;
  }
  function spendBooster(p, key) {
    if (!Object.hasOwn(p.boosters, key) || p.boosters[key] <= 0) return null;
    const next = clone(p); next.boosters[key]--; return next;
  }
  function buildTask(p, chapter, choice) {
    if (!Number.isInteger(chapter) || chapter < 0 || chapter > unlockedChapter(p) || p.tasks[chapter] >= 3 || p.culture < 200) return null;
    if (choice === undefined) choice = p.upgrades[chapter].indexOf(false);
    if (!Number.isInteger(choice) || choice < 0 || choice > 2 || p.upgrades[chapter][choice]) return null;
    const next = clone(p); next.culture -= 200; next.upgrades[chapter][choice] = true; next.tasks[chapter]++;
    if (next.tasks[chapter] === 3) for (const key of Object.keys(next.boosters)) next.boosters[key]++;
    return next;
  }
  function readSave(raw) {
    if (raw === null || raw === undefined) return newProfile();
    const p = JSON.parse(raw), int = (v, max = Number.MAX_SAFE_INTEGER) => Number.isInteger(v) && v >= 0 && v <= max;
    const bad = () => { throw new Error('Invalid save data: progress was not loaded'); };
    if (!p || ![1, 2].includes(p.schema) || !p.completed || typeof p.completed !== 'object' || Array.isArray(p.completed) || !Array.isArray(p.tasks) || p.tasks.length !== 6 || !p.tasks.every(v => int(v, 3))) bad();
    const ids = Object.keys(p.completed);
    if (!ids.every(id => /^[1-9]\d?$/.test(id) && Number(id) <= 36 && int(p.completed[id]))) bad();
    const balance = ids.length - p.tasks.reduce((a, b) => a + b, 0) * 2;
    if (p.schema === 1) {
      if (!int(p.stars, 36) || p.stars !== balance) bad();
      p.culture = p.stars * 100;
      p.upgrades = p.tasks.map(count => [0, 1, 2].map(i => i < count));
      p.schema = 2; delete p.stars;
    }
    if (!int(p.culture, 3600) || p.culture !== balance * 100) bad();
    if (!Array.isArray(p.upgrades) || p.upgrades.length !== 6 || !p.upgrades.every((row, ch) => Array.isArray(row) && row.length === 3 && row.every(v => typeof v === 'boolean') && row.filter(Boolean).length === p.tasks[ch])) bad();
    if (!p.boosters || !['brush', 'shuffle', 'moves'].every(k => int(p.boosters[k], 100))) bad();
    if (!p.settings || typeof p.settings.sound !== 'boolean' || typeof p.settings.reduced !== 'boolean' || typeof p.tutorialSeen !== 'boolean') bad();
    for (let ch = 1; ch < 6; ch++) if ((p.tasks[ch] || ids.some(id => Math.floor((Number(id) - 1) / 6) === ch)) && (p.tasks[ch - 1] !== 3 || !Array.from({ length: 6 }, (_, j) => ch * 6 - j).every(id => p.completed[id] !== undefined))) bad();
    for (const id of ids.map(Number)) if (id > 1 && p.completed[id - 1] === undefined) bad();
    if (p.active !== null) {
      const g = p.active;
      if (!g || g.n !== 8 || !levelUnlocked(p, g.levelId) || !int(g.rng, 4294967295) || !int(g.moves, 999) || !int(g.score) || !int(g.turns) || !['playing', 'won', 'lost'].includes(g.status) || !int(g.colorCount, 6) || g.colorCount < 4) bad();
      if (!Array.isArray(g.board) || g.board.length !== 64 || !Array.isArray(g.ice) || g.ice.length !== 64 || !Array.isArray(g.crates) || g.crates.length !== 64) bad();
      if (!g.board.every((c, i) => int(g.crates[i], 2) && int(g.ice[i], 2) && (g.crates[i] ? c === null && !g.ice[i] : c && int(c.color, g.colorCount - 1) && SPECIALS.includes(c.special)))) bad();
      if (!Array.isArray(g.counts) || g.counts.length !== 6 || !g.counts.every(v => int(v)) || !int(g.iceCleared) || !int(g.cratesCleared)) bad();
      if (!Array.isArray(g.targets) || !g.targets.length || !g.targets.every(t => t && ['color', 'ice', 'crates'].includes(t.type) && int(t.amount, 1000) && t.amount > 0 && (t.type !== 'color' || int(t.color, g.colorCount - 1)))) bad();
      if (findMatches(g).length || g.status === 'playing' && (g.moves <= 0 || won(g) || !possibleMoves(g).length) || g.status === 'won' && !won(g) || g.status === 'lost' && (g.moves !== 0 || won(g))) bad();
    }
    return p;
  }
  const api = { createGame, findMatches, possibleMoves, swap, boost, targetValue, newProfile, unlockedChapter, levelUnlocked, awardWin, spendBooster, buildTask, readSave };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.CultureGame = api;
})(typeof globalThis !== 'undefined' ? globalThis : window);
