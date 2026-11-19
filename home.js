'use strict';

const gameHome = (() => {
  const byId = id => document.getElementById(id);
  const saveKey = 'xiaying-jianghu-mobile:save';
  const audioKey = 'xiaying-jianghu-mobile:audio';
  const home = byId('home');
  const creator = byId('creator');
  const continueButton = byId('homeContinue');
  const dialog = byId('homeDialog');
  const volume = byId('homeVolume');
  const sound = byId('homeSound');
  const game = window.jianghuGame;
  let audioContext;
  let playing = false;
  let storedSave;
  let action;

  function read(key) {
    try { return localStorage.getItem(key); }
    catch { return undefined; }
  }

  function parse(raw) {
    try { return JSON.parse(raw); }
    catch { return null; }
  }

  function decodeSave(raw) {
    const data = parse(raw);
    const progress = data?.progress;
    if (data?.version !== 1 || !progress || typeof progress.playerName !== 'string' ||
        !['劍俠', '遊俠', '武者'].includes(progress.playerJob) ||
        ![1, 2].includes(progress.mapId) ||
        !['x', 'y', 'hp', 'max', 'face'].every(key => Number.isFinite(progress.player?.[key])) ||
        !Array.isArray(progress.inventory) || !Array.isArray(progress.enemies) ||
        !['stats', 'swordPath', 'bowPath', 'spearPath', 'lightPath', 'martialGrowth'].every(
          key => progress[key] && typeof progress[key] === 'object'
        ) ||
        !['level', 'exp', 'statPoints', 'martialPoints', 'wave', 'score'].every(
          key => Number.isFinite(progress[key])
        )) return null;
    return progress;
  }

  function warn(message) {
    const label = byId('saveWarning');
    label.textContent = message;
    label.hidden = !message;
  }

  function persist() {
    const current = read(saveKey);
    if (current === undefined || current !== storedSave) {
      warn(current === undefined ? '瀏覽器無法使用本機存檔。' : '存檔已在另一個分頁變更。請重新整理後再繼續。');
      return false;
    }
    try {
      const next = JSON.stringify({version: 1, progress: game.snapshot()});
      if (next !== storedSave) {
        localStorage.setItem(saveKey, next);
        storedSave = next;
      }
      warn('');
      return true;
    } catch {
      warn('存檔寫入失敗，請確認瀏覽器儲存空間。');
      return false;
    }
  }

  function refreshHome() {
    const raw = read(saveKey);
    continueButton.disabled = !decodeSave(raw);
    warn(raw === undefined ? '瀏覽器無法使用本機存檔。' :
      raw && continueButton.disabled ? '目前的存檔無法讀取。' : '');
  }

  function openDialog(title, {message = '', confirm = '', callback, settings = false} = {}) {
    action = callback;
    byId('dialogTitle').textContent = title;
    byId('dialogMessage').textContent = message;
    byId('dialogMessage').hidden = !message;
    byId('audioSettings').hidden = !settings;
    byId('dialogConfirm').hidden = !confirm;
    byId('dialogConfirm').textContent = confirm;
    dialog.returnValue = '';
    dialog.showModal();
  }

  dialog.addEventListener('close', () => {
    const callback = action;
    action = undefined;
    if (dialog.returnValue === 'confirm') callback?.();
  });

  const audio = parse(read(audioKey));
  volume.value = Number.isFinite(audio?.volume) ? audio.volume : 50;
  sound.checked = audio?.enabled !== false;

  function updateAudio() {
    byId('volumeLabel').textContent = volume.value + '%';
    try {
      localStorage.setItem(audioKey, JSON.stringify({volume: volume.valueAsNumber, enabled: sound.checked}));
    } catch { warn('瀏覽器無法儲存音效設定。'); }
  }

  byId('volumeLabel').textContent = volume.value + '%';
  volume.addEventListener('input', updateAudio);
  sound.addEventListener('change', updateAudio);

  async function playMenuSound() {
    const Audio = window.AudioContext || window.webkitAudioContext;
    if (!Audio || !sound.checked || !volume.valueAsNumber) return;
    try {
      audioContext ||= new Audio();
      if (audioContext.state === 'suspended') await audioContext.resume();
      const now = audioContext.currentTime;
      const tone = audioContext.createOscillator();
      const gain = audioContext.createGain();
      tone.type = 'sine';
      tone.frequency.setValueAtTime(620, now);
      tone.frequency.exponentialRampToValueAtTime(440, now + .09);
      gain.gain.setValueAtTime(volume.valueAsNumber * .0007, now);
      gain.gain.exponentialRampToValueAtTime(.0001, now + .12);
      tone.connect(gain);
      gain.connect(audioContext.destination);
      tone.start(now);
      tone.stop(now + .13);
    } catch { /* Browsers may block audio in some contexts. */ }
  }

  function enterGame() {
    home.hidden = true;
    creator.hidden = true;
    byId('wrap').hidden = false;
    playing = true;
  }

  continueButton.onclick = () => {
    storedSave = read(saveKey);
    const progress = decodeSave(storedSave);
    if (!progress) return refreshHome();
    game.restore(progress);
    enterGame();
    persist();
  };

  byId('homeNew').onclick = () => {
    const raw = read(saveKey);
    const create = () => {
      storedSave = raw;
      home.hidden = true;
      creator.hidden = false;
      byId('nameInput').focus({preventScroll: true});
    };
    if (raw) {
      openDialog('初入江湖', {
        message: '建立角色並踏入江湖後，將覆蓋目前的存檔。',
        confirm: '繼續創角', callback: create
      });
    } else create();
  };

  byId('cancelCreator').onclick = () => {
    creator.hidden = true;
    home.hidden = false;
    refreshHome();
    byId('homeNew').focus();
  };
  byId('homeSettings').onclick = () => openDialog('遊戲設定', {settings: true});
  byId('previewSound').onclick = playMenuSound;
  home.querySelector('.home-menu').addEventListener('click', event => {
    if (event.target.closest('button')) playMenuSound();
  });
  byId('homeExit').onclick = () => {
    if (window.opener) {
      window.close();
      if (window.closed) return;
    }
    if (history.length > 1) {
      openDialog('離開遊戲', {message: '返回上一頁？', confirm: '返回上一頁', callback: () => history.back()});
    } else {
      openDialog('離開遊戲', {message: '可關閉此分頁離開遊戲。'});
    }
  };

  setInterval(() => { if (playing && !document.hidden) persist(); }, 2000);
  addEventListener('pagehide', () => { if (playing) persist(); });
  document.addEventListener('visibilitychange', () => {
    if (playing && document.hidden) persist();
  });
  addEventListener('storage', event => {
    if (!playing && !home.hidden && (event.key === saveKey || event.key === null)) refreshHome();
  });
  refreshHome();

  return {
    get playing() { return playing; },
    startNew() {
      if (playing || creator.hidden) return;
      const saved = persist();
      if (!saved && typeof storedSave === 'string') return;
      enterGame();
    }
  };
})();
