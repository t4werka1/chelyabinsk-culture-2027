(function () {
  'use strict';
  const E = window.CultureGame, D = window.CultureContent, A = window.CultureArt;
  const KEY = 'culture2027.save.v1';
  const app = document.getElementById('app'), modal = document.getElementById('modal');
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const I = A.icon;
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  let profile, storageWarning = '', saveBlocked = false;
  try { profile = E.readSave(localStorage.getItem(KEY)); }
  catch (error) {
    profile = E.newProfile(); saveBlocked = true;
    storageWarning = error.message.startsWith('Invalid save') || error instanceof SyntaxError ? 'Сохранение повреждено. Исходные данные сохранены; сейчас игра работает без записи прогресса.' : 'Браузер не разрешил доступ к сохранению. Прогресс доступен только в этой сессии.';
    console.error('Could not load game progress:', error);
  }
  let screen = profile.active && profile.active.status === 'playing' ? 'game' : 'world';
  let chapter = profile.active ? Math.floor((profile.active.levelId - 1) / 6) : E.unlockedChapter(profile);
  let selected = null, armed = null, busy = false, keyboardIndex = 0, hintTimer, toastTimer, audio, pointerStart, ignoreClickUntil = 0;
  let originalScene = false;
  const reduced = () => profile.settings.reduced || matchMedia('(prefers-reduced-motion: reduce)').matches;
  function persist() {
    if (saveBlocked) return;
    try { localStorage.setItem(KEY, JSON.stringify(profile)); }
    catch (error) { saveBlocked = true; storageWarning = 'Не удалось записать прогресс. Игра продолжается в этой сессии.'; console.error('Could not save game progress:', error); updateWarning(); }
  }
  function updateWarning() {
    const el = document.getElementById('storage-warning');
    el.hidden = !storageWarning;
    el.innerHTML = esc(storageWarning) + ' <button data-action="settings">Настройки</button>';
  }
  function toast(message) {
    const el = document.getElementById('toast'); clearTimeout(toastTimer); el.textContent = message; el.classList.add('visible');
    toastTimer = setTimeout(() => el.classList.remove('visible'), 3500);
  }
  function announce(message) { document.getElementById('live-status').textContent = message; }
  function sound(kind = 'tap') {
    if (!profile.settings.sound) return;
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio) return;
    if (!audio) audio = new Audio();
    if (audio.state === 'suspended') audio.resume().catch(reportError);
    const now = audio.currentTime;
    const notes = kind === 'win' ? [523, 659, 784, 1047] : kind === 'build' ? [392, 523, 784] : kind === 'match' ? [440, 587] : [400];
    notes.forEach((freq, j) => {
      const oscillator = audio.createOscillator(), gain = audio.createGain(), time = now + j * .08;
      oscillator.type = 'sine'; oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(.055, time + .01); gain.gain.exponentialRampToValueAtTime(.001, time + .17);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(time); oscillator.stop(time + .18);
    });
  }
  function reportError(error) {
    console.error(error);
    showDialog('Не удалось выполнить действие', `<p>Игра остановила это действие. Можно вернуться на карту и повторить попытку.</p><pre class="modal-error">${esc(error.message)}</pre><div class="modal-actions"><button class="secondary-button" data-action="close">Закрыть</button><button class="primary-button" data-action="go-world">На карту</button></div>`);
  }
  function showDialog(title, body, extra = '') {
    if (modal.open) modal.close();
    document.getElementById('dialog-content').innerHTML = `<div class="modal-inner ${extra}"><button class="modal-close" data-action="close" aria-label="Закрыть">${I('close')}</button><h2 id="dialog-title">${title}</h2>${body}</div>`;
    modal.showModal();
  }
  function closeDialog() { if (modal.open) modal.close(); }
  if (!('closedBy' in HTMLDialogElement.prototype)) modal.addEventListener('click', e => {
    if (e.target !== modal) return;
    const r = modal.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeDialog();
  });
  function header() {
    document.body.classList.toggle('playing', screen === 'game');
    document.getElementById('culture-balance').textContent = profile.culture.toLocaleString('ru');
    document.querySelector('.wallet-label').textContent = 'культура';
    document.getElementById('wallet-icon').innerHTML = I('sparkle');
    const snd = document.getElementById('sound-button'); snd.innerHTML = I(profile.settings.sound ? 'sound' : 'mute');
    snd.setAttribute('aria-label', profile.settings.sound ? 'Выключить звук' : 'Включить звук'); snd.setAttribute('aria-pressed', String(profile.settings.sound));
    document.getElementById('settings-button').innerHTML = I('settings');
    document.querySelectorAll('.nav-button').forEach(b => { b.classList.toggle('active', b.dataset.screen === (screen === 'game' ? 'levels' : screen)); b.setAttribute('aria-current', b.classList.contains('active') ? 'page' : 'false'); });
    document.body.classList.toggle('reduced', profile.settings.reduced);
  }
  function nextLevel() {
    const max = (E.unlockedChapter(profile) + 1) * 6;
    for (let id = 1; id <= max; id++) if (profile.completed[id] === undefined) return id;
    return null;
  }
  const complete = () => profile.tasks.every(t => t === 3) && Object.keys(profile.completed).length === 36;
  function world() {
    const ch = D.chapters[chapter], stage = profile.tasks[chapter], next = nextLevel();
    const locked = chapter > E.unlockedChapter(profile), own = profile.upgrades[chapter];
    const resume = profile.active && profile.active.status === 'playing';
    const cta = resume ? `Продолжить · ${profile.active.levelId}` : next ? `Играть · уровень ${next}` : complete() ? 'Повторить любимый уровень' : 'Выбрать улучшение';
    const wins = Object.keys(profile.completed).length;
    app.innerHTML = `<section class="world-heading"><div><div class="eyebrow"><span class="tiny-dot"></span>ТВОЯ КУЛЬТУРНАЯ СТОЛИЦА</div><h1>Маленький ход.<br><span class="gradient-text">Большие перемены.</span></h1></div><div class="world-invitation"><p>Собирай комбинации. Получай очки культуры.<br>Создавай места, в которых хочется быть.</p><button class="primary-button play-cta" data-action="main-play">${I('play')}${cta}${next || resume && profile.completed[profile.active.levelId] === undefined ? `<span class="cta-reward">+100 ${I('sparkle')}</span>` : ''}</button><small>${wins}/36 уровней · ${profile.tasks.reduce((a,b)=>a+b,0)}/18 улучшений</small></div></section>
      <section class="world-layout"><div class="venue-panel"><div class="venue-top"><div><div class="eyebrow">ГЛАВА 0${chapter+1} <span> / 06</span></div><h2>${ch.city}</h2></div><div class="scene-switch" role="group" aria-label="Сравнение площадки"><button data-action="scene-view" data-view="original" aria-pressed="${originalScene}">До</button><button data-action="scene-view" data-view="current" aria-pressed="${!originalScene}">Моя площадка</button></div></div><div class="world-scene">${A.scene(ch.scene, originalScene ? [false,false,false] : own)}<div class="scene-event-tag">${I('calendar')} ${ch.events[0].title}</div><div class="scene-caption"><div>${I('map')}<strong>${ch.short}</strong></div><span>${originalScene ? 'До улучшений' : stage === 3 ? 'Готово к празднику' : `${stage} из 3 улучшений`}</span></div></div><div class="venue-bottom"><span>${I('sparkle')}Твоя версия культурного 2027</span><span class="stage-dots">${own.map(v=>`<i class="${v?'lit':''}"></i>`).join('')}</span></div></div>
      <aside class="upgrade-panel" id="preparation"><div class="upgrade-heading"><div class="eyebrow">${locked?'ВПЕРЕДИ НОВАЯ ИСТОРИЯ':'МАСТЕРСКАЯ ПЕРЕМЕН'}</div><h2>${ch.title}</h2><p>${locked?'Пройди предыдущую главу, чтобы покупать улучшения здесь.':'Выбери, с чего начать. Два новых уровня — одно улучшение.'}</p></div><div class="task-list">${ch.tasks.map((task,i)=>{
        const done=own[i], afford=profile.culture>=200 && !locked;
        return `<article class="task-card ${done?'done':''}"><div class="upgrade-symbol symbol-${i}">${I(done?'check':['flag','brush','sparkle'][i])}</div><div class="upgrade-copy"><h3>${task.title}</h3><p>${task.text}</p><div class="upgrade-actions"><button class="preview-button" data-action="upgrade-preview" data-id="${chapter}" data-choice="${i}">${done?'Посмотреть':'Примерить'} ${I('external')}</button><button class="task-button" data-action="build" data-id="${chapter}" data-choice="${i}" ${done||!afford?'disabled':''}><span>${done?I('check')+'Куплено':I('sparkle')+'200'}</span></button></div>${!done&&!locked&&!afford?`<small class="missing-culture">Ещё ${Math.ceil((200-profile.culture)/100)} ${profile.culture===100?'победа':'победы'} до покупки</small>`:''}</div></article>`;
      }).join('')}</div></aside></section>
      ${complete()?`<div class="completion-banner">${I('trophy')}<div><strong>Южный Урал готов встречать гостей</strong><p>36 уровней. 18 перемен. Шесть площадок, которые ты создал.</p></div></div>`:''}
      <section class="journey" aria-label="Маршрут подготовки"><div class="section-line"><h2>Шесть мест. Одна большая история.</h2><span>Выбери площадку</span></div><div class="chapter-route">${D.chapters.map((c,i)=>{
        const done=profile.tasks[i]===3,closed=i>E.unlockedChapter(profile);
        return `<button class="chapter-node ${i===chapter?'current':''} ${done?'complete':''}" data-action="chapter" data-id="${i}" aria-label="${c.city}: ${c.short}${closed?', пока закрыто':''}" aria-current="${i===chapter?'step':'false'}"><span class="node-circle">${done?I('check'):closed?I('lock'):String(i+1).padStart(2,'0')}</span><strong>${c.city}</strong><small>${c.short}</small></button>`;
      }).join('')}</div></section><p class="scene-disclaimer">Игровые интерпретации площадок. Вдохновлены событиями предварительной программы 2027 года.</p>`;
  }
  function upgradePreview(ch, choice) {
    const own = [...profile.upgrades[ch]], already = own[choice]; own[choice] = true;
    const task = D.chapters[ch].tasks[choice], canBuy = !already && profile.culture >= 200 && ch <= E.unlockedChapter(profile);
    showDialog(task.title, `<div class="upgrade-preview-scene">${A.scene(D.chapters[ch].scene, own, false, choice)}<span>${already?'Уже на твоей площадке':'Предпросмотр улучшения'}</span></div><p>${task.result}</p><div class="purchase-note">${already?'Это улучшение уже куплено.':ch>E.unlockedChapter(profile)?'Сначала заверши предыдущую главу.':canBuy?'Стоимость: 200 очков культуры.':`Нужно ещё ${200-profile.culture} очков культуры. Две новые победы дают 200 очков.`}</div><div class="modal-actions"><button class="secondary-button" data-action="close">Вернуться</button>${!already?`<button class="primary-button" data-action="build" data-id="${ch}" data-choice="${choice}" ${!canBuy?'disabled':''}>${I('sparkle')}Купить за 200</button>`:''}</div>`, 'upgrade-preview');
  }
  function levels() {
    app.innerHTML = `<div class="page-heading"><div><div class="eyebrow"><span class="tiny-dot"></span>36 ШАГОВ К БОЛЬШОМУ ГОДУ</div><h1>Уровни вдохновения</h1></div><p>За каждый новый уровень — 100 очков культуры. За две победы — улучшение твоей площадки.</p></div>${D.chapters.map((ch, i) => `<section class="levels-chapter"><div class="levels-chapter-head"><div><div class="eyebrow">ГЛАВА ${String(i + 1).padStart(2, '0')} · ${ch.city}</div><h2>${ch.title}</h2><small>${i > E.unlockedChapter(profile) ? 'Откроется после 6 уровней и 3 заданий предыдущей главы' : `${profile.tasks[i]} из 3 заданий подготовлено`}</small></div>${I(i > E.unlockedChapter(profile) ? 'lock' : 'flag')}</div><div class="level-grid">${D.levels.slice(i * 6, i * 6 + 6).map(l => {
      const passed = profile.completed[l.id] !== undefined, unlocked = E.levelUnlocked(profile, l.id);
      return `<button class="level-card ${passed ? 'passed' : unlocked ? 'available' : ''}" data-action="level-preview" data-id="${l.id}" ${!unlocked ? 'disabled' : ''} aria-label="Уровень ${l.id}: ${l.title}${passed ? ', пройден' : ''}"><span class="level-status">${I(passed ? 'star' : unlocked ? 'play' : 'lock')}</span><strong>${String(l.id).padStart(2, '0')}</strong><span>${l.title}</span><small>${passed ? `Рекорд: ${profile.completed[l.id].toLocaleString('ru')}` : `${l.moves} ходов`}</small></button>`;
    }).join('')}</div></section>`).join('')}`;
  }
  function events() {
    app.innerHTML = `<div class="page-heading"><div><div class="eyebrow"><span class="tiny-dot"></span>ВДОХНОВЛЕНО ЮЖНЫМ УРАЛОМ</div><h1>За каждой игрой — культура</h1></div><p>Узнай больше о событиях, которые вдохновили наши игровые истории.</p></div><p class="source-note">Названия взяты из предварительной программы 2027 года. Сроки и площадки могут уточняться. Подготовка пространств и последовательность глав — игровой сюжет.</p><div class="events-grid">${D.chapters.flatMap((ch, i) => ch.events.map((e, j) => `<article class="event-card"><div class="event-art">${A.scene(ch.scene, profile.upgrades[i], true)}</div><div class="event-body"><div class="event-tag">${e.tag} · ${ch.city}</div><h2>${e.title}</h2><p>${e.text}</p><a href="${e.url}" target="_blank" rel="noopener noreferrer">К программе события ${I('external')}</a></div><button class="event-venue" data-action="event-venue" data-id="${i}">К площадке события ${I('arrow')}</button></article>`)).join('')}</div>`;
  }
  const goalIcon = t => t.type === 'color' ? A.piece(t.color) : I(t.type === 'ice' ? 'ice' : 'crate');
  const goalName = t => t.type === 'color' ? D.pieces[t.color].name : t.type === 'ice' ? 'Ледяное покрытие' : 'Ящики';
  function goalsHTML(g) {
    return g.targets.map(t => { const value = Math.min(t.amount, E.targetValue(g, t)); return `<div class="goal ${value >= t.amount ? 'goal-complete' : ''}"><div class="goal-icon">${goalIcon(t)}</div><div class="goal-copy"><div class="goal-name">${goalName(t)}</div><div class="goal-count">${value} <small>/ ${t.amount}</small></div></div><progress value="${value}" max="${t.amount}" aria-label="${goalName(t)}"></progress>${value >= t.amount ? `<span class="goal-check">${I('check')}</span>` : ''}</div>`; }).join('');
  }
  function game() {
    const g = profile.active;
    if (!g) { screen = 'world'; world(); return; }
    const l = D.levels[g.levelId - 1], ch = D.chapters[l.chapter];
    app.innerHTML = `<div class="game-topline"><button class="back-button" data-action="go-world">${I('back')}К подготовке города</button><div class="eyebrow">СОБИРАЙ КОМБИНАЦИИ. СОЗДАВАЙ ПЕРЕМЕНЫ.</div></div><div class="game-layout"><aside class="level-intro"><div class="eyebrow">УРОВЕНЬ ${String(l.id).padStart(2, '0')} / 36</div><h1>${l.title}</h1><div class="level-location">${ch.city} · глава ${l.chapter + 1}</div><section class="goals-panel" aria-label="Цели уровня"><div class="panel-caption">ЦЕЛИ УРОВНЯ</div><div id="goals">${goalsHTML(g)}</div></section><div class="game-mini-scene">${A.scene(ch.scene, profile.upgrades[l.chapter], true)}<div class="game-mini-caption">${I('star')}+100 культуры за новую победу</div></div></aside><section class="board-section" aria-label="Игровое поле"><div class="board-header"><div class="moves-box">${I('sparkle')}<div><div class="moves-label">ХОДОВ ОСТАЛОСЬ</div><div id="moves-number">${g.moves}</div></div></div><div class="score-box"><strong id="score-number">${g.score.toLocaleString('ru')}</strong><span>ВДОХНОВЕНИЕ</span></div></div><div class="board-shell"><div id="board-fx" aria-hidden="true"></div><div id="board" class="board" role="group" aria-label="Поле 8 на 8" data-busy="false"></div></div><div class="level-progress-track"><div id="level-progress" style="transform:scaleX(${g.targets.reduce((v,t)=>v+Math.min(1,E.targetValue(g,t)/t.amount),0)/g.targets.length})"></div></div><div class="board-caption"><span>${I('help')}Меняй соседние фишки местами</span><span id="combo-label"></span></div><div class="game-bottom-actions"><button data-action="help">${I('help')}Правила</button><button data-action="restart-prompt">${I('restart')}Начать заново</button>${g.status !== 'playing' ? `<button data-action="result">${I('trophy')}Результат</button>` : ''}</div></section><aside class="boosters-panel"><div class="panel-caption">ДОБАВЬ НЕМНОГО МАГИИ</div>${[['brush', 'Кисть', 'Убрать одну фишку'], ['shuffle', 'Перестановка', 'Обновить поле'], ['moves', 'Вдохновение', '+5 ходов']].map(([key, name, hint]) => `<button class="booster ${armed === key ? 'selected' : ''}" data-action="boost" data-key="${key}" aria-label="${name}, ${hint}, осталось ${profile.boosters[key]}" ${profile.boosters[key] === 0 || g.status === 'won' || g.status === 'lost' && key !== 'moves' ? 'disabled' : ''}><span class="booster-mark">${I(key === 'moves' ? 'plus' : key)}</span><span><strong>${name}</strong><small>${hint}</small></span><span class="booster-count">${profile.boosters[key]}</span></button>`).join('')}<div class="booster-description">${armed ? 'Выбери клетку на поле. Кисть уберёт фишку или один слой препятствия.' : 'Усилители не расходуют ход. Новые бонусы ждут на каждом третьем уровне и за подготовку главы.'}</div>${armed ? '<button class="cancel-booster" data-action="cancel-boost">Отменить кисть</button>' : ''}</aside></div>`;
    renderBoard(g); scheduleHint();
  }
  function renderBoard(g) {
    const board = document.getElementById('board'); if (!board) return;
    board.classList.toggle('armed', !!armed); board.dataset.busy = String(busy);
    board.innerHTML = g.board.map((cell, i) => {
      const crate = g.crates[i] > 0, special = cell && cell.special;
      const name = crate ? `Ящик, слоёв: ${g.crates[i]}` : cell ? special === 'rainbow' ? 'Радужная палитра' : special === 'bomb' ? 'Фейерверк' : special === 'row' || special === 'col' ? 'Прожектор' : D.pieces[cell.color].name : 'Пустая клетка';
      return `<button class="cell ${g.ice[i] ? 'iced' : ''} ${crate ? 'crate' : ''} ${selected === i ? 'selected' : ''}" data-color="${cell?.color ?? 0}" data-special="${special || ''}" data-cell="${i}" tabindex="${i === keyboardIndex ? '0' : '-1'}" aria-label="${name}${g.ice[i] ? ', подо льдом' : ''}, строка ${Math.floor(i / g.n) + 1}, столбец ${i % g.n + 1}" aria-pressed="${selected === i}" ${busy ? 'disabled' : ''}>${crate ? '<span class="crate-plank" aria-hidden="true"></span>' : cell ? A.piece(cell.color, special) : ''}</button>`;
    }).join('');
  }
  function render() {
    clearTimeout(hintTimer); header();
    if (screen === 'game') game(); else if (screen === 'levels') levels(); else if (screen === 'events') events(); else world();
    updateWarning();
  }
  function scheduleHint() {
    clearTimeout(hintTimer);
    if (screen !== 'game' || busy || armed || profile.active.status !== 'playing') return;
    hintTimer = setTimeout(() => {
      if (screen !== 'game' || busy || armed || selected !== null || modal.open) { scheduleHint(); return; }
      const pair = E.possibleMoves(profile.active)[0];
      if (pair) pair.forEach(i => document.querySelector(`[data-cell="${i}"]`)?.classList.add('hint'));
    }, 6000);
  }
  function navigate(target) {
    if (busy) return; closeDialog(); screen = target; armed = null; selected = null; render(); window.scrollTo({ top: 0, behavior: 'instant' });
  }
  function help(tutorial = false) {
    showDialog(tutorial ? 'Твой первый красивый ход' : 'Маленькие ходы. Большие перемены.', `<div class="help-pieces">${[0, 0, 0, 1, 2].map(c => A.piece(c)).join('')}</div><p>Меняй соседние фишки местами и собирай от трёх одинаковых в ряд. Выполни все цели, пока не закончились ходы.</p><div class="help-list"><div class="help-item">${A.piece(1, 'row')}<div><strong>4 в линию — прожектор.</strong><br>Очищает строку или столбец.</div></div><div class="help-item">${A.piece(2, 'bomb')}<div><strong>Т или L — фейерверк.</strong><br>Очищает область 3 × 3. Соединяй спецфишки!</div></div><div class="help-item">${A.piece(0, 'rainbow')}<div><strong>5 в линию — палитра.</strong><br>Убирает все фишки выбранного цвета.</div></div></div><p>За каждый новый пройденный уровень — 100 очков культуры. Любое улучшение площадки стоит 200. Выбирай покупки в любом порядке; повторный уровень улучшает рекорд без новой награды. Играй кликами, свайпом или стрелками и Enter. Повторная попытка бесплатна.</p><div class="modal-actions"><button class="primary-button" data-action="tutorial-close">${tutorial ? 'Понятно, играем' : 'Вернуться к игре'}</button></div>`);
  }
  function begin(id, confirmed = false) {
    if (!E.levelUnlocked(profile, id)) return;
    if (!confirmed && profile.active && profile.active.status === 'playing' && profile.active.levelId !== id) {
      showDialog('Открыть другой уровень?', '<p>Текущая попытка будет заменена новой. Уже заработанные очки культуры и подготовленные пространства сохранятся.</p><div class="modal-actions"><button class="secondary-button" data-action="close">Остаться</button><button class="primary-button" data-action="start-confirmed" data-id="' + id + '">Начать новый</button></div>'); return;
    }
    closeDialog();
    profile.active = E.createGame(D.levels[id - 1], (Date.now() ^ Math.floor(Math.random() * 4294967295)) >>> 0);
    persist(); chapter = Math.floor((id - 1) / 6); screen = 'game'; selected = null; armed = null; keyboardIndex = 0; render();
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (!profile.tutorialSeen) help(true);
  }
  function preview(id) {
    const level = D.levels[id - 1]; if (!E.levelUnlocked(profile, id)) return;
    showDialog(`Уровень ${id}: ${level.title}`, `<p>${D.chapters[level.chapter].city}. На этот этап у тебя ${level.moves} ходов.</p><div class="intro-targets">${level.targets.map(t => `<div>${goalIcon(t)}<strong>${t.amount}</strong></div>`).join('')}</div><p>${profile.completed[id] !== undefined ? 'Улучши рекорд. 100 очков культуры за этот уровень уже получены.' : 'Выполни все цели и получи 100 очков культуры.'}</p><div class="modal-actions"><button class="primary-button" data-action="start" data-id="${id}">${I('play')}Начать уровень</button></div>`);
  }
  async function perform(action) {
    if (busy || !profile.active) return;
    const focusWasBoard = document.activeElement?.hasAttribute('data-cell');
    const previous = profile.active;
    if (action.type === 'boost' && !profile.boosters[action.key]) { toast('Этот усилитель закончился'); return; }
    const result = action.type === 'swap' ? E.swap(previous, action.a, action.b) : E.boost(previous, action.key, action.index);
    if (!result.accepted) {
      if (!reduced() && action.type === 'swap') for (const index of [action.a, action.b]) document.querySelector(`[data-cell="${index}"]`)?.animate([{transform:'translateX(0)'},{transform:'translateX(-4px)'},{transform:'translateX(4px)'},{transform:'translateX(0)'}],{duration:190});
      selected = null; renderBoard(previous); toast(result.reason === 'no-match' ? 'Собери минимум три одинаковых в линию' : 'Выбери соседнюю доступную фишку'); scheduleHint(); return; }
    let next = action.type === 'boost' ? E.spendBooster(profile, action.key) : profile;
    if (!next) return;
    const firstWin = result.state.status === 'won' && next.completed[result.state.levelId] === undefined;
    next.active = result.state;
    if (result.state.status === 'won') next = E.awardWin(next, result.state);
    profile = next; persist(); armed = null; selected = null; clearTimeout(hintTimer); busy = true;
    const board = document.getElementById('board'); if (board) { board.dataset.busy = 'true'; board.classList.remove('armed'); }
    document.querySelectorAll('#board button').forEach(b => { b.disabled = true; });
    try {
      if (action.type === 'swap' && !reduced()) {
        const a = document.querySelector(`[data-cell="${action.a}"] svg`), b = document.querySelector(`[data-cell="${action.b}"] svg`);
        if (a && b) {
          const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
          await Promise.all([a.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${rb.x - ra.x}px,${rb.y - ra.y}px)` }], { duration: 110 }).finished, b.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${ra.x - rb.x}px,${ra.y - rb.y}px)` }], { duration: 110 }).finished]);
          const swapped = { ...previous, board: [...previous.board] }; [swapped.board[action.a], swapped.board[action.b]] = [swapped.board[action.b], swapped.board[action.a]]; renderBoard(swapped);
        }
      }
      let animationScore = previous.score;
      document.getElementById('moves-number').textContent = result.state.moves;
      for (const f of result.frames) {
        if (f.kind === 'clear') {
          for (const i of f.hits) document.querySelector(`[data-cell="${i}"]`)?.classList.add('hit');
          if (f.combo > 1) { document.getElementById('combo-label').textContent = `Вдохновение ×${f.combo}`; }
          sound(f.combo > 2 ? 'build' : 'match');
          if (!reduced()) { window.CultureFX.wave(f, f.score - animationScore); await sleep(190); }
          animationScore = f.score;
          document.getElementById('score-number').textContent = f.score.toLocaleString('ru');
          document.getElementById('goals').innerHTML = goalsHTML({ ...result.state, ...f });
          renderBoard({ ...result.state, ...f });
        } else {
          renderBoard({ ...result.state, ...f });
          if (!reduced()) {
            if (f.kind === 'fall' && f.drops) window.CultureFX.falling(f.drops, result.state.n);
            await sleep(f.kind === 'shuffle' ? 180 : 310);
          }
        }
      }
    } finally { busy = false; }
    render();
    if (focusWasBoard) document.querySelector(`[data-cell="${keyboardIndex}"]`)?.focus({ preventScroll: true });
    announce(`Осталось ходов: ${profile.active.moves}. ${profile.active.targets.map(t => `${goalName(t)}: ${Math.min(t.amount, E.targetValue(profile.active, t))} из ${t.amount}`).join('. ')}`);
    if (profile.active.status !== 'playing') showResult(firstWin); else if (result.frames.some(f => f.kind === 'shuffle')) toast('Ходы закончились — поле перемешано бесплатно');
  }
  function showResult(firstWin = false) {
    const g = profile.active; if (!g) return;
    const win = g.status === 'won';
    if (win) sound('win');
    const remaining = nextLevel();
    const nextButton = win ? `<button class="primary-button" data-action="result-next">${remaining && Math.floor((remaining - 1) / 6) === Math.floor((g.levelId - 1) / 6) ? 'Следующий уровень' : 'Подготовить город'} ${I('arrow')}</button>` : `<button class="primary-button" data-action="retry">Попробовать ещё</button>`;
    showDialog(win ? 'Красиво сыграно!' : 'Почти получилось', `<p>${win ? 'Все цели выполнены. Ещё одна победа — ещё один вклад в культурную столицу.' : 'Ходы закончились, но история продолжается. Попробуй другую комбинацию или добавь пять ходов.'}</p>${win ? `<div class="reward-amount">${firstWin ? '+100' : '✓'} ${I('star')}<small>${firstWin ? 'очков культуры для твоей площадки' : 'уровень пройден · рекорд сохранён'}</small></div><div class="reward-detail">Вдохновение: ${g.score.toLocaleString('ru')} · Баланс: ${profile.culture} очков культуры${firstWin && g.levelId % 3 === 0 ? '<br>Новый усилитель добавлен в запас' : ''}</div>` : `<div class="intro-targets">${g.targets.map(t => `<div>${goalIcon(t)}<strong>${Math.max(0, t.amount - E.targetValue(g, t))}</strong></div>`).join('')}</div>${profile.boosters.moves ? `<button class="secondary-button" data-action="extra-moves">${I('plus')}5 ходов · в запасе ${profile.boosters.moves}</button>` : ''}`}<div class="modal-actions"><button class="secondary-button" data-action="go-world">В город</button>${nextButton}</div>`, 'reward');
    if (win && firstWin) celebrate();
  }
  function celebrate() {
    if (reduced()) return;
    const holder = document.getElementById('celebration'); holder.innerHTML = '';
    for (let i = 0; i < 60; i++) { const el = document.createElement('i'); el.className = 'confetti'; el.style.left = `${Math.random() * 100}%`; el.style.background = ['#83e1ef', '#c4a6fc', '#eaa3cc', '#ffda9c'][i % 4]; el.style.animationDelay = `${Math.random() * .45}s`; holder.appendChild(el); }
    setTimeout(() => holder.replaceChildren(), 3500);
  }
  function build(ch, choice) {
    const next = E.buildTask(profile, ch, choice); if (!next) return;
    const wasComplete = profile.tasks[ch] === 2;
    profile = next; persist(); chapter = ch; screen = 'world'; originalScene = false; closeDialog(); render(); sound('build'); celebrate();
    const task = D.chapters[ch].tasks[choice];
    showDialog(complete() ? 'Культурная столица начинается с тебя' : 'Ещё одно место стало особенным', `<div class="upgrade-preview-scene">${A.scene(D.chapters[ch].scene, profile.upgrades[ch], false, choice)}</div><p>${task.result}</p><div class="reward-detail">−200 очков культуры${wasComplete ? '<br>Площадка готова! Бонус: по одному усилителю каждого типа.' : ''}</div><div class="modal-actions"><button class="primary-button" data-action="after-build" data-id="${ch}">${wasComplete && ch<5?'В следующую главу':'Посмотреть на город'} ${I('arrow')}</button></div>`, 'reward upgrade-preview');
  }
  function settings() {
    showDialog('В твоём ритме', `<p>Небольшие настройки для комфортной игры.</p><label class="setting-row"><div>Звуки игры<span>Короткие ноты совпадений и наград</span></div><input type="checkbox" data-setting="sound" ${profile.settings.sound ? 'checked' : ''}></label><label class="setting-row"><div>Меньше анимации<span>Без движения фишек и конфетти</span></div><input type="checkbox" data-setting="reduced" ${profile.settings.reduced ? 'checked' : ''}></label><p>Прогресс хранится в этом браузере на этом устройстве. ${saveBlocked ? 'Запись сейчас недоступна.' : 'Сохранение работает автоматически.'}</p><button class="danger-button" data-action="reset-prompt">Начать всю историю заново</button>`);
  }
  async function handleCell(index) {
    if (busy || !profile.active || profile.active.status !== 'playing') return;
    keyboardIndex = index; clearTimeout(hintTimer);
    document.querySelectorAll('.hint').forEach(el => el.classList.remove('hint'));
    if (armed === 'brush') { await perform({ type: 'boost', key: 'brush', index }); return; }
    if (!profile.active.board[index]) { toast('Ящик убирается соседним совпадением или кистью'); return; }
    if (selected === index) selected = null;
    else if (selected !== null && Math.abs(selected % 8 - index % 8) + Math.abs(Math.floor(selected / 8) - Math.floor(index / 8)) === 1) { const first = selected; await perform({ type: 'swap', a: first, b: index }); return; }
    else selected = index;
    renderBoard(profile.active); document.querySelector(`[data-cell="${index}"]`)?.focus({ preventScroll: true }); scheduleHint();
  }
  async function dispatch(button) {
    const action = button.dataset.action, id = Number(button.dataset.id);
    if (busy && !['close'].includes(action)) return;
    if (action === 'nav') navigate(button.dataset.screen);
    else if (action === 'go-world') { chapter = profile.active ? Math.floor((profile.active.levelId - 1) / 6) : chapter; navigate('world'); }
    else if (action === 'close') closeDialog();
    else if (action === 'help') help();
    else if (action === 'tutorial-close') { profile.tutorialSeen = true; persist(); closeDialog(); scheduleHint(); }
    else if (action === 'settings') settings();
    else if (action === 'sound') { profile.settings.sound = !profile.settings.sound; persist(); header(); sound(); }
    else if (action === 'chapter') { chapter = id; originalScene = false; render(); }
    else if (action === 'event-venue') { chapter = id; originalScene = false; navigate('world'); }
    else if (action === 'scene-view') { originalScene = button.dataset.view === 'original'; world(); }
    else if (action === 'upgrade-preview') upgradePreview(id, Number(button.dataset.choice));
    else if (action === 'main-play') {
      if (profile.active?.status === 'playing') { screen = 'game'; selected = null; render(); }
      else if (nextLevel()) begin(nextLevel());
      else if (complete()) navigate('levels');
      else { chapter = E.unlockedChapter(profile); render(); document.getElementById('preparation').scrollIntoView({ behavior: reduced() ? 'instant' : 'smooth', block: 'center' }); }
    }
    else if (action === 'level-preview') preview(id);
    else if (action === 'start' || action === 'start-confirmed') begin(id, action === 'start-confirmed');
    else if (action === 'build') build(id, Number(button.dataset.choice));
    else if (action === 'after-build') { closeDialog(); chapter = profile.tasks[id] === 3 && id < E.unlockedChapter(profile) ? id + 1 : id; render(); }
    else if (action === 'boost') {
      const key = button.dataset.key;
      if (key === 'brush') { armed = armed ? null : 'brush'; selected = null; render(); }
      else if (key === 'shuffle') { showDialog('Свежий взгляд на поле', `<p>Перемешать фишки без расхода хода? Препятствия останутся на своих местах. В запасе: ${profile.boosters.shuffle}.</p><div class="modal-actions"><button class="secondary-button" data-action="close">Отмена</button><button class="primary-button" data-action="shuffle-confirm">Перемешать</button></div>`); }
      else await perform({ type: 'boost', key });
    }
    else if (action === 'shuffle-confirm') { closeDialog(); await perform({ type: 'boost', key: 'shuffle' }); }
    else if (action === 'cancel-boost') { armed = null; render(); }
    else if (action === 'extra-moves') { closeDialog(); await perform({ type: 'boost', key: 'moves' }); }
    else if (action === 'result') showResult();
    else if (action === 'result-next') { const next = nextLevel(); if (next && Math.floor((next - 1) / 6) === Math.floor((profile.active.levelId - 1) / 6)) begin(next); else navigate('world'); }
    else if (action === 'retry') begin(profile.active.levelId, true);
    else if (action === 'restart-prompt') showDialog('Начать попытку заново?', '<p>Поле и число ходов начнутся заново. Уже использованные в этой попытке усилители не возвращаются.</p><div class="modal-actions"><button class="secondary-button" data-action="close">Продолжить</button><button class="primary-button" data-action="retry">Заново</button></div>');
    else if (action === 'reset-prompt') showDialog('Начать всю историю заново?', '<p>Будут удалены пройденные уровни, очки культуры, улучшения и запас усилителей этой игры в этом браузере.</p><div class="modal-actions"><button class="secondary-button" data-action="close">Оставить прогресс</button><button class="primary-button" data-action="reset-confirm">Сбросить прогресс</button></div>');
    else if (action === 'reset-confirm') {
      try { localStorage.removeItem(KEY); saveBlocked = false; storageWarning = ''; }
      catch (error) { console.error('Could not reset saved progress:', error); toast('Браузер не разрешил удалить сохранение'); return; }
      profile = E.newProfile(); screen = 'world'; chapter = 0; persist(); closeDialog(); render();
    }
  }
  document.addEventListener('click', event => {
    const cell = event.target.closest('[data-cell]');
    if (cell && Date.now() >= ignoreClickUntil) { handleCell(Number(cell.dataset.cell)).catch(reportError); return; }
    const button = event.target.closest('[data-action]'); if (!button || button.disabled) return;
    dispatch(button).catch(reportError);
  });
  document.addEventListener('change', event => {
    const setting = event.target.dataset.setting; if (!['sound', 'reduced'].includes(setting)) return;
    profile.settings[setting] = event.target.checked; persist(); header(); if (setting === 'sound') sound();
  });
  app.addEventListener('pointerdown', e => {
    const cell = e.target.closest('[data-cell]'); if (!cell || busy) return;
    pointerStart = { index: Number(cell.dataset.cell), x: e.clientX, y: e.clientY, pointerId: e.pointerId };
    cell.setPointerCapture(e.pointerId);
  });
  app.addEventListener('pointerup', e => {
    if (!pointerStart || busy) return;
    const start = pointerStart; pointerStart = null;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18 || armed) return;
    ignoreClickUntil = Date.now() + 250;
    const horizontal = Math.abs(dx) > Math.abs(dy), dest = start.index + (horizontal ? Math.sign(dx) : Math.sign(dy) * 8);
    if (dest < 0 || dest >= 64 || horizontal && Math.floor(dest / 8) !== Math.floor(start.index / 8)) return;
    keyboardIndex = dest; perform({ type: 'swap', a: start.index, b: dest }).catch(reportError);
  });
  app.addEventListener('pointercancel', () => { pointerStart = null; });
  app.addEventListener('keydown', e => {
    const cell = e.target.closest('[data-cell]'); if (!cell || busy) return;
    const current = Number(cell.dataset.cell), offsets = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -8, ArrowDown: 8 };
    if (Object.hasOwn(offsets, e.key)) {
      e.preventDefault(); let next = current + offsets[e.key];
      if (next < 0 || next >= 64 || Math.abs(offsets[e.key]) === 1 && Math.floor(next / 8) !== Math.floor(current / 8)) next = current;
      keyboardIndex = next; document.querySelectorAll('[data-cell]').forEach(el => { el.tabIndex = Number(el.dataset.cell) === next ? 0 : -1; }); document.querySelector(`[data-cell="${next}"]`).focus();
    } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCell(current).catch(reportError); }
    else if (e.key === 'Escape') { selected = null; armed = null; render(); }
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearTimeout(hintTimer); else scheduleHint(); });
  document.body.insertAdjacentHTML('afterbegin', A.definitions());
  window.CultureApp = Object.freeze({ getProfile: () => JSON.parse(JSON.stringify(profile)), getScreen: () => screen, isBusy: () => busy });
  render();
})();
