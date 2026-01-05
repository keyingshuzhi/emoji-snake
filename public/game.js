// public/game.js
const canvas = document.getElementById("c");
const ctx = canvas.getContext("2d");

const scoreEl = document.getElementById("score");
const highEl = document.getElementById("high");
const spdEl = document.getElementById("spd");
const modeEl = document.getElementById("mode");
const buffEl = document.getElementById("buff");
const albumEl = document.getElementById("album");

const btnStart = document.getElementById("btnStart");
const btnRestart = document.getElementById("btnRestart");
const btnSound = document.getElementById("btnSound");
const btnPause = document.getElementById("btnPause");
const btnBoost = document.getElementById("btnBoost");
const btnSkill = [
  document.getElementById("btnSkill0"),
  document.getElementById("btnSkill1"),
  document.getElementById("btnSkill2"),
];
const joystick = document.getElementById("joystick");
const joystickStick = document.getElementById("joystickStick");

const slotUI = [
  { emoji: document.getElementById("slot0Emoji"), name: document.getElementById("slot0Name"), cd: document.getElementById("slot0Cd") },
  { emoji: document.getElementById("slot1Emoji"), name: document.getElementById("slot1Name"), cd: document.getElementById("slot1Cd") },
  { emoji: document.getElementById("slot2Emoji"), name: document.getElementById("slot2Name"), cd: document.getElementById("slot2Cd") },
];

// ✅ 更细腻像素格
const CELL = 12;
canvas.width = Math.floor(canvas.width / CELL) * CELL;
canvas.height = Math.floor(canvas.height / CELL) * CELL;

const COLS = Math.floor(canvas.width / CELL);
const ROWS = Math.floor(canvas.height / CELL);

// ---- 存档 ----
const STORAGE_HIGH = "emoji-snake:highscore";
const STORAGE_ALBUM = "emoji-snake:album";
const STORAGE_SOUND = "emoji-snake:sound";

// ---- 技能（一次性消耗）----
const SKILLS = {
  SHIELD: { emoji: "🛡️", name: "护体", duration: 3200 },
  DASH:   { emoji: "🏃", name: "冲鸭", duration: 2400 },
  MAGNET: { emoji: "🧲", name: "吸吸", duration: 4600 },
  BOMB:   { emoji: "💣", name: "炸裂", duration: 0 },
};
const SKILL_POOL = ["SHIELD", "DASH", "MAGNET", "BOMB"];

// ---- AI Persona ----
const AI_PERSONAS = [
  { key: "BRUTE", name: "猛冲", emoji: "😈", aggro: 0.78, greed: 0.25, coward: 0.1, fake: 0.08, hesitate: 0.08, dash: 0.55 },
  { key: "SCAV",  name: "拾荒", emoji: "🤑", aggro: 0.32, greed: 0.85, coward: 0.18, fake: 0.06, hesitate: 0.05, dash: 0.22 },
  { key: "TRICK", name: "戏精", emoji: "🤹", aggro: 0.48, greed: 0.45, coward: 0.12, fake: 0.22, hesitate: 0.16, dash: 0.26 },
  { key: "CAUT",  name: "谨慎", emoji: "😳", aggro: 0.18, greed: 0.35, coward: 0.72, fake: 0.12, hesitate: 0.28, dash: 0.10 },
  { key: "BULLY", name: "霸道", emoji: "😎", aggro: 0.62, greed: 0.30, coward: 0.05, fake: 0.10, hesitate: 0.06, dash: 0.40 },
];

function pickPersona() {
  return AI_PERSONAS[randInt(0, AI_PERSONAS.length - 1)];
}

// ---- 彩蛋表情（击杀掉落）----
const EGG_POOL = [
  { key: "EGG_STAR", emoji: "🌟" },
  { key: "EGG_BOOM", emoji: "🎉" },
  { key: "EGG_GEM",  emoji: "💎" },
  { key: "EGG_CAT",  emoji: "😺" },
  { key: "EGG_OK",   emoji: "👌" },
  { key: "EGG_DUCK", emoji: "🦆" },
  { key: "EGG_FIRE", emoji: "🔥" },
  { key: "EGG_EGG",  emoji: "🥚" },
];

// ---- 气泡地块（原创：表情区域带属性 + 区域事件）----
const BUBBLES = {
  HAHA: {
    key: "HAHA", emoji: "😂", name: "哈哈区",
    tint: "rgba(255,220,120,ALPHA)",
    // 属性
    speedMul: 0.92, wiggleMul: 1.10,
    scoreMul: 1.00,
    comboWindowMul: 1.55, comboDecayMul: 1.70, comboPerStepAdd: 0.02, comboCap: 2.0,
    giftCdMul: 1.00,
    shieldMul: 1.00, dashMul: 1.15, magnetMul: 1.00,
    autoChompJitterAdd: 0.00,
  },
  WUWU: {
    key: "WUWU", emoji: "😢", name: "呜呜区",
    tint: "rgba(120,210,255,ALPHA)",
    speedMul: 1.12, wiggleMul: 0.92,
    scoreMul: 0.85,
    comboWindowMul: 1.05, comboDecayMul: 1.15, comboPerStepAdd: 0.00, comboCap: 1.75,
    giftCdMul: 1.00,
    shieldMul: 1.60, dashMul: 1.00, magnetMul: 1.00,
    autoChompJitterAdd: 0.00,
  },
  QMARK: {
    key: "QMARK", emoji: "❓", name: "???区",
    tint: "rgba(200,160,255,ALPHA)",
    speedMul: 1.06, wiggleMul: 1.25,
    scoreMul: 1.00,
    comboWindowMul: 1.00, comboDecayMul: 1.00, comboPerStepAdd: 0.00, comboCap: 2.0,
    giftCdMul: 0.65,
    shieldMul: 1.00, dashMul: 1.00, magnetMul: 1.25,
    autoChompJitterAdd: 0.10,
  },
  RAGE: {
    key: "RAGE", emoji: "😡", name: "暴走区",
    tint: "rgba(255,120,120,ALPHA)",
    speedMul: 0.88, wiggleMul: 1.12,
    scoreMul: 0.95,
    comboWindowMul: 0.85, comboDecayMul: 0.90, comboPerStepAdd: 0.00, comboCap: 1.90,
    giftCdMul: 0.95,
    shieldMul: 0.95, dashMul: 1.20, magnetMul: 0.90,
    autoChompJitterAdd: 0.12,
  },
  SLEEP: {
    key: "SLEEP", emoji: "😴", name: "犯困区",
    tint: "rgba(180,200,255,ALPHA)",
    speedMul: 1.22, wiggleMul: 0.90,
    scoreMul: 1.05,
    comboWindowMul: 1.35, comboDecayMul: 1.50, comboPerStepAdd: 0.01, comboCap: 2.0,
    giftCdMul: 1.10,
    shieldMul: 1.10, dashMul: 0.95, magnetMul: 1.05,
    autoChompJitterAdd: 0.00,
  },
};

const BUBBLE_KEYS = Object.keys(BUBBLES);

function zoneProps(type) {
  if (!type) return null;
  return BUBBLES[type] || null;
}

// 允许“临时出生 Buff”覆盖 zoneType（给 AI 用）
function effectiveZoneType(snake) {
  const now = Date.now();
  if (snake.tempZoneType && snake.tempZoneUntil && now < snake.tempZoneUntil) return snake.tempZoneType;
  return snake.zoneType;
}

// ---- Audio (no external files) ----
let audioCtx = null;
const audioState = {
  soundOn: true,
  userActivated: false,
  masterGain: null,
  sfxGain: null,
  musicGain: null,
  musicTimer: null,
  musicStep: 0,
  musicNextTime: 0,
  lastSfxAt: Object.create(null),
};

const MUSIC_GAIN_BASE = 0.45;

const SFX = {
  pellet: { cooldown: 90, pattern: [{ freq: 860, dur: 0.035, type: "square", gain: 0.012 }] },
  bubble: { cooldown: 320, pattern: [{ freq: 260, dur: 0.06, type: "sine", gain: 0.012 }] },
  gift: {
    cooldown: 700,
    pattern: [
      { freq: 520, dur: 0.07, type: "triangle", gain: 0.02, offset: 0 },
      { freq: 780, dur: 0.08, type: "triangle", gain: 0.016, offset: 0.08 },
    ]
  },
  boom: {
    cooldown: 220,
    pattern: [
      { freq: 160, dur: 0.18, type: "sawtooth", gain: 0.03, offset: 0 },
      { freq: 90, dur: 0.22, type: "sawtooth", gain: 0.02, offset: 0.06 },
    ]
  },
  egg: {
    cooldown: 420,
    pattern: [
      { freq: 640, dur: 0.07, type: "triangle", gain: 0.018, offset: 0 },
      { freq: 840, dur: 0.05, type: "triangle", gain: 0.014, offset: 0.07 },
    ]
  },
};

const MUSIC = {
  bpm: 112,
  root: 57,
  stepBeats: 0.5,
  melody: [0, 3, 5, 7, 5, 3, 0, null, 0, 3, 5, 10, 12, 10, 7, 5],
  bass: [0, 0, -5, -7, 0, 0, -5, -7],
};

function loadSoundPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_SOUND);
    if (!raw) return;
    const obj = JSON.parse(raw);
    if (obj && typeof obj.soundOn === "boolean") audioState.soundOn = obj.soundOn;
  } catch (_) {}
}

function saveSoundPrefs() {
  localStorage.setItem(STORAGE_SOUND, JSON.stringify({ soundOn: audioState.soundOn }));
}

function updateSoundButton() {
  if (!btnSound) return;
  btnSound.textContent = audioState.soundOn ? "🔊 声音：开" : "🔇 声音：关";
}

function ensureAudio() {
  if (audioCtx) return true;
  try {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    audioState.masterGain = audioCtx.createGain();
    audioState.masterGain.gain.value = 0.9;

    audioState.sfxGain = audioCtx.createGain();
    audioState.sfxGain.gain.value = 1.0;

    audioState.musicGain = audioCtx.createGain();
    audioState.musicGain.gain.value = MUSIC_GAIN_BASE;

    audioState.sfxGain.connect(audioState.masterGain);
    audioState.musicGain.connect(audioState.masterGain);
    audioState.masterGain.connect(audioCtx.destination);
    return true;
  } catch (_) {
    return false;
  }
}

function resumeAudio() {
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}

function unlockAudio() {
  audioState.userActivated = true;
  if (!ensureAudio()) return;
  resumeAudio();
  syncMusicState();
}

function noteToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function playToneAt(freq, start, dur, type, gain, targetGain) {
  if (!audioCtx) return;
  const o = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, start);

  const attack = Math.min(0.02, dur * 0.3);
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(gain, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);

  o.connect(g);
  g.connect(targetGain || audioCtx.destination);
  o.start(start);
  o.stop(start + dur + 0.03);
}

function beep(freq = 440, ms = 70, type = "square", gain = 0.02) {
  if (!audioState.soundOn || !audioState.userActivated) return;
  if (!ensureAudio()) return;
  playToneAt(freq, audioCtx.currentTime, ms / 1000, type, gain, audioState.sfxGain);
}

function playSfx(key) {
  const def = SFX[key];
  if (!def || !audioState.soundOn || !audioState.userActivated) return;
  if (!ensureAudio()) return;
  const now = performance.now();
  const last = audioState.lastSfxAt[key] || 0;
  if (def.cooldown && now - last < def.cooldown) return;
  audioState.lastSfxAt[key] = now;

  const base = audioCtx.currentTime;
  for (const note of def.pattern) {
    playToneAt(note.freq, base + (note.offset || 0), note.dur, note.type, note.gain, audioState.sfxGain);
  }
}

function setMusicIntensity(level) {
  if (!audioState.musicGain || !audioCtx) return;
  const now = audioCtx.currentTime;
  const target = MUSIC_GAIN_BASE * level;
  audioState.musicGain.gain.cancelScheduledValues(now);
  audioState.musicGain.gain.setTargetAtTime(target, now, 0.12);
}

function scheduleMusic() {
  if (!audioState.soundOn || !audioState.userActivated || !audioCtx) return;
  const stepDur = (60 / MUSIC.bpm) * MUSIC.stepBeats;
  const lookAhead = 0.25;

  while (audioState.musicNextTime < audioCtx.currentTime + lookAhead) {
    const step = audioState.musicStep % MUSIC.melody.length;
    const note = MUSIC.melody[step];
    if (note !== null && note !== undefined) {
      playToneAt(
        noteToFreq(MUSIC.root + note),
        audioState.musicNextTime,
        stepDur * 0.92,
        "triangle",
        0.03,
        audioState.musicGain
      );
    }

    if (step % 2 === 0) {
      const bass = MUSIC.bass[(step / 2) % MUSIC.bass.length];
      if (bass !== null && bass !== undefined) {
        playToneAt(
          noteToFreq(MUSIC.root - 12 + bass),
          audioState.musicNextTime,
          stepDur * 1.8,
          "sine",
          0.04,
          audioState.musicGain
        );
      }
    }

    audioState.musicNextTime += stepDur;
    audioState.musicStep += 1;
  }
}

function startMusic() {
  if (!audioState.soundOn || !audioState.userActivated) return;
  if (!ensureAudio()) return;
  if (audioState.musicTimer) return;
  audioState.musicStep = 0;
  audioState.musicNextTime = audioCtx.currentTime + 0.05;
  audioState.musicTimer = setInterval(scheduleMusic, 100);
}

function stopMusic() {
  if (!audioState.musicTimer) return;
  clearInterval(audioState.musicTimer);
  audioState.musicTimer = null;
}

function syncMusicState() {
  if (!audioState.soundOn || !audioState.userActivated || !state.running) {
    stopMusic();
    return;
  }
  startMusic();
  setMusicIntensity(state.paused || state.awaitingReplace ? 0.35 : 1);
}

function setSoundEnabled(on) {
  audioState.soundOn = on;
  updateSoundButton();
  saveSoundPrefs();
  if (!on) {
    stopMusic();
    return;
  }
  unlockAudio();
}

function toggleSound() {
  setSoundEnabled(!audioState.soundOn);
}

loadSoundPrefs();
updateSoundButton();

// ---- 工具 ----
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }
function clampWrap(v, max) { return v < 0 ? max - 1 : (v >= max ? 0 : v); }
function keyOf(x, y) { return `${x},${y}`; }
function manhattan(ax, ay, bx, by) { return Math.abs(ax - bx) + Math.abs(ay - by); }
function dist2(ax, ay, bx, by) { const dx = ax - bx, dy = ay - by; return dx*dx + dy*dy; }

const DIR_QUEUE_MAX = 2;
const SKILL_PREVIEW_MS = 140;
const ASSIST_DEFAULT = false;
const DASH_ENERGY_MAX = 100;
const DASH_DRAIN_PER_SEC = 55;
const DASH_REGEN_PER_SEC = 28;
const BOOST_SPEED_MUL = 0.78;
const BOMB_RADIUS = 5;
const BOMB_LEN_RATIO = 0.35;
const MAGNET_PULL_RANGE = 7;
const CHAIN_WINDOW_MS = 900;
const AUTO_CHOMP_ENABLED = false;
const ASSIST_ENABLED = false;
const ZONE_STEER_ENABLED = false;

function loadHigh() {
  const v = Number(localStorage.getItem(STORAGE_HIGH) || "0");
  return Number.isFinite(v) ? v : 0;
}
function saveHigh(v) { localStorage.setItem(STORAGE_HIGH, String(v)); }

function loadAlbum() {
  try {
    const raw = localStorage.getItem(STORAGE_ALBUM);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return obj && typeof obj === "object" ? obj : {};
  } catch { return {}; }
}
function saveAlbum(obj) { localStorage.setItem(STORAGE_ALBUM, JSON.stringify(obj)); }

// ---- 特效 ----
function pushFx(emoji, x, y, opt = {}) {
  const now = performance.now();
  state.fx.push({
    emoji,
    x, y,
    born: now,
    life: opt.life ?? 650,
    kind: opt.kind ?? "float",
    vx: opt.vx ?? (Math.random() * 0.6 - 0.3),
    vy: opt.vy ?? (-0.8 - Math.random() * 0.6),
    scale: opt.scale ?? 1.0
  });
}

function triggerShake(power = 6) {
  state.shake.power = Math.min(16, state.shake.power + power);
}

function triggerSlowmo(scale = 0.55, ms = 220) {
  const until = performance.now() + ms;
  state.slowmo.until = Math.max(state.slowmo.until, until);
  state.slowmo.scale = Math.min(state.slowmo.scale || 1, scale);
}

function pushChain(emoji) {
  if (!state.player) return;
  const now = Date.now();
  if (now - state.chain.lastAt > CHAIN_WINDOW_MS) state.chain.list = [];
  state.chain.lastAt = now;
  state.chain.list.push(emoji);
  if (state.chain.list.length > 8) state.chain.list.shift();

  const h = snakeHead(state.player);
  const len = state.chain.list.length;
  if (len === 3) {
    pushFx("✨", h.x, h.y, { kind: "pop", life: 620, scale: 1.2 });
    addScore(2);
  } else if (len === 5) {
    pushFx("🔥", h.x, h.y, { kind: "pop", life: 720, scale: 1.25 });
    addScore(4);
    triggerShake(5);
  } else if (len === 8) {
    pushFx("💥", h.x, h.y, { kind: "pop", life: 820, scale: 1.35 });
    addScore(8);
    triggerShake(10);
    triggerSlowmo(0.5, 260);
  }
}

// ---- 原创：连击/情绪倍率 ----
function moodEmoji(streak) {
  if (streak >= 14) return "🤯";
  if (streak >= 9)  return "🤪";
  if (streak >= 5)  return "😆";
  if (streak >= 2)  return "😋";
  return "🙂";
}

const BASE_COMBO = { windowMs: 1800, decayMs: 2200, perStep: 0.08, cap: 2.0 };

function effectiveComboParams() {
  const z = zoneProps(state.playerZoneType);
  const base = { ...BASE_COMBO };
  if (!z) return base;
  return {
    windowMs: Math.floor(base.windowMs * z.comboWindowMul),
    decayMs: Math.floor(base.decayMs * z.comboDecayMul),
    perStep: base.perStep + z.comboPerStepAdd,
    cap: z.comboCap
  };
}

function bumpCombo() {
  const p = effectiveComboParams();
  const now = Date.now();
  const gap = now - state.combo.lastAt;
  if (gap <= p.windowMs) state.combo.streak += 1;
  else state.combo.streak = 1;
  state.combo.lastAt = now;

  const mult = 1 + Math.min(p.cap - 1, state.combo.streak * p.perStep);
  state.combo.mult = Math.min(p.cap, mult);
}

function comboDecay() {
  const p = effectiveComboParams();
  const now = Date.now();
  if (state.combo.streak <= 0) return;
  if (now - state.combo.lastAt > p.decayMs) {
    state.combo.streak = Math.max(0, state.combo.streak - 1);
    state.combo.lastAt = now;
    const mult = 1 + Math.min(p.cap - 1, state.combo.streak * p.perStep);
    state.combo.mult = Math.min(p.cap, mult);
  }
}

function addScore(base) {
  const z = zoneProps(state.playerZoneType);
  const zoneMul = z ? z.scoreMul : 1.0;
  const gain = Math.max(1, Math.round(base * state.combo.mult * zoneMul));
  state.score += gain;
  return gain;
}

// ---- 游戏状态 ----
const state = {
  running: false,
  paused: false,
  wrap: true,
  assistOn: ASSIST_ENABLED && ASSIST_DEFAULT,
  assistCd: 0,

  logicStepMs: 50,
  acc: 0,
  lastT: 0,

  score: 0,
  high: loadHigh(),
  album: loadAlbum(),

  combo: { streak: 0, mult: 1, lastAt: 0 },
  chain: { list: [], lastAt: 0 },

  player: null,
  playerZoneType: null,
  dirQueue: [],
  awaitingReplace: null,
  skillHold: [
    { down: false, startedAt: 0 },
    { down: false, startedAt: 0 },
    { down: false, startedAt: 0 },
  ],

  pellets: [],
  pelletCount: 85,

  gift: null,
  giftCooldownMs: 0,

  rocks: [],
  rockSet: new Set(),

  meatChains: [], // {id, points:[{x,y}], ttl}
  meatTTL: 10000,
  meatChainIdSeq: 1,

  autoChompDurationMs: 600,
  autoChompMaxMs: 1200,
  autoChompExtendMs: 200,
  autoChompSearchMax: 50,
  autoChompGreedBias: 0.18,

  eggs: [], // {x,y,emoji,key,ttl}
  eggTTL: 12000,

  bubbles: [], // {x,y,r,type,ttl,eventCd}
  bubbleTTL: 16000,
  bubbleSpawnCd: 0,
  bubbleTarget: 4,

  // ✅ 区域事件物体
  zoneShots: [], // 😂弹幕等：{x,y,dx,dy,ttl,moveCd,emoji,type}
  zoneDrops: [], // 💧🎲💢💤：{x,y,ttl,emoji,type}

  aiSnakes: [],
  aiIdSeq: 1,

  fx: [],

  camera: { x: 0, y: 0 },
  shake: { power: 0 },
  slowmo: { until: 0, scale: 1 },
};

// ---- Snake ----
function makeSnake({ isPlayer, x, y, dir, len, nameEmoji }) {
  const persona = isPlayer ? null : pickPersona();
  const body = [];
  for (let i = 0; i < len; i++) {
    const bx = state.wrap ? clampWrap(x - dir.x * i, COLS) : (x - dir.x * i);
    const by = state.wrap ? clampWrap(y - dir.y * i, ROWS) : (y - dir.y * i);
    body.push({ x: bx, y: by });
  }
  return {
    id: isPlayer ? "P" : `A${state.aiIdSeq++}`,
    isPlayer,
    persona,
    nameEmoji: nameEmoji ?? (isPlayer ? "🙂" : (persona ? persona.emoji : "🤖")),
    baseLen: len,
    body,
    dir: { ...dir },
    nextDir: { ...dir },
    grow: 0,
    alive: true,

    shieldUntil: 0,
    dashBurstUntil: 0,
    dashEnergy: 0,
    dashEnergyMax: 0,
    dashHeld: false,
    boostHeld: false,
    magnetUntil: 0,

    // 一次性技能槽
    skillSlots: [null, null, null],

    moveCd: 0,
    aiSkillThinkCd: 0,
    aiFakeUntil: 0,
    aiFakeDir: null,
    aiHesitateUntil: 0,
    aiDashHoldUntil: 0,

    autoChompUntil: 0,
    autoChompChainId: null,

    // 区域/临时区域
    zoneType: null,
    tempZoneType: null,
    tempZoneUntil: 0,

    // 😂弹幕等导致的短暂强制转向
    steeredUntil: 0,
    steeredDir: null,
  };
}

function snakeLen(s) { return s.body.length; }
function snakeHead(s) { return s.body[0]; }

function minSnakeLen(s) {
  return Math.max(3, s.baseLen || 3);
}

function isDashActive(snake, now = Date.now()) {
  if (snake.dashHeld && snake.dashEnergy > 0) return true;
  return now < snake.dashBurstUntil;
}

function isBoostActive(snake) {
  return snake.isPlayer && snake.boostHeld && snakeLen(snake) > snake.baseLen;
}

function shortenSnake(snake, ratio, minLen) {
  const curLen = snakeLen(snake);
  const floorLen = minLen ?? minSnakeLen(snake);
  if (curLen <= floorLen) return false;
  const cut = Math.max(1, Math.floor(curLen * ratio));
  const targetLen = Math.max(floorLen, curLen - cut);
  if (targetLen >= curLen) return false;
  snake.body.length = targetLen;
  snake.grow = Math.max(0, snake.grow - (curLen - targetLen));
  return true;
}

function snakeInRadius(snake, cx, cy, r2) {
  for (const p of snake.body) {
    if (dist2(p.x, p.y, cx, cy) <= r2) return true;
  }
  return false;
}

function updateDashEnergy(snake) {
  if (snake.dashEnergyMax <= 0) return;
  const now = Date.now();
  const zone = zoneProps(effectiveZoneType(snake));
  const drainMul = zone ? (1 / zone.dashMul) : 1.0;
  const dt = state.logicStepMs / 1000;

  if (!snake.isPlayer && snake.aiDashHoldUntil && now < snake.aiDashHoldUntil) {
    snake.dashHeld = true;
  } else if (!snake.isPlayer) {
    snake.dashHeld = false;
  }

  if (snake.dashHeld) {
    snake.dashEnergy = Math.max(0, snake.dashEnergy - DASH_DRAIN_PER_SEC * drainMul * dt);
  } else {
    snake.dashEnergy = Math.min(snake.dashEnergyMax, snake.dashEnergy + DASH_REGEN_PER_SEC * dt);
  }
}

// 体型更明显
function snakeScale(s) {
  return Math.min(3.2, 1.0 + snakeLen(s) / 15);
}

// ✅ 长度影响速度更明显 + 区域影响速度
function snakeMovePeriodMs(s) {
  const now = Date.now();
  const len = snakeLen(s);

  const base = s.isPlayer ? 210 : 230;

  let factor = 1.0;
  if (len < 10) factor = 0.85;
  else if (len < 20) factor = 1.00;
  else if (len < 40) factor = 1.25;
  else if (len < 70) factor = 1.60;
  else factor = 2.00;

  const dash = isDashActive(s, now);
  const dashFactor = dash ? 0.70 : 1.0;
  const boostFactor = isBoostActive(s) ? BOOST_SPEED_MUL : 1.0;

  const diff = Math.min(14, Math.floor(state.score / 18) * 2);

  const z = zoneProps(effectiveZoneType(s));
  const zoneMul = z ? z.speedMul : 1.0;

  const hesitateMul = (!s.isPlayer && now < s.aiHesitateUntil) ? 1.25 : 1.0;
  const period = Math.max(95, (base * factor - diff) * dashFactor * boostFactor * zoneMul * hesitateMul);
  return Math.min(420, period);
}

// ---- 占用/刷点 ----
function buildOccupySet() {
  const occ = new Set();
  for (const p of state.player.body) occ.add(keyOf(p.x, p.y));
  for (const a of state.aiSnakes) {
    if (!a.alive) continue;
    for (const p of a.body) occ.add(keyOf(p.x, p.y));
  }
  for (const r of state.rocks) occ.add(keyOf(r.x, r.y));
  for (const ch of state.meatChains) for (const p of ch.points) occ.add(keyOf(p.x, p.y));
  for (const e of state.eggs) occ.add(keyOf(e.x, e.y));
  for (const b of state.bubbles) occ.add(keyOf(b.x, b.y));
  for (const d of state.zoneDrops) occ.add(keyOf(d.x, d.y));
  for (const s of state.zoneShots) occ.add(keyOf(s.x, s.y));
  if (state.gift) occ.add(keyOf(state.gift.x, state.gift.y));
  return occ;
}

function randomEmptyCell(avoidNear) {
  const occ = buildOccupySet();
  for (let t = 0; t < 9000; t++) {
    const x = randInt(0, COLS - 1);
    const y = randInt(0, ROWS - 1);
    if (occ.has(keyOf(x, y))) continue;
    if (state.pellets.some(p => p.x === x && p.y === y)) continue;

    if (avoidNear) {
      const h = snakeHead(state.player);
      if (manhattan(x, y, h.x, h.y) < avoidNear) continue;
    }
    return { x, y };
  }
  return { x: 1, y: 1 };
}

// ---- 地图 ----
function refillPellets() {
  while (state.pellets.length < state.pelletCount) state.pellets.push(randomEmptyCell());
}

function spawnGift(force = false) {
  if (state.gift && !force) return;
  const p = randomEmptyCell(4);
  const skillKey = SKILL_POOL[randInt(0, SKILL_POOL.length - 1)];
  state.gift = { x: p.x, y: p.y, skillKey, skillEmoji: SKILLS[skillKey].emoji };
  playSfx("gift");
}

function updateGiftCooldown() {
  if (state.gift) return;

  const z = zoneProps(state.playerZoneType);
  const mul = z ? z.giftCdMul : 1.0;

  state.giftCooldownMs -= (state.logicStepMs / mul); // mul 越小刷新越快
  if (state.giftCooldownMs <= 0) spawnGift(true);
}

function syncRocks() {
  const targetRocks = Math.min(10, Math.floor(state.score / 12));
  while (state.rocks.length < targetRocks) {
    const p = randomEmptyCell(5);
    state.rocks.push(p);
    state.rockSet.add(keyOf(p.x, p.y));
    pushFx("🪨", p.x, p.y, { kind: "pop", life: 700 });
  }
}

// ✅ 永远保持 AI 存在 + 低谷时出生 Buff（😂/冲鸭）
function syncAISnakes() {
  state.aiSnakes = state.aiSnakes.filter(s => s.alive);

  const minAlive = 6;
  const extra = Math.min(10, Math.floor(state.score / 7));
  const targetAlive = Math.min(16, Math.max(minAlive, 5 + extra));

  const aliveNow = state.aiSnakes.length;

  while (state.aiSnakes.length < targetAlive) {
    const p = randomEmptyCell(12);
    const dir = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}][randInt(0,3)];
    const len = randInt(4, 8);

    const ai = makeSnake({ isPlayer: false, x: p.x, y: p.y, dir, len });
    ai.moveCd = randInt(0, 320);
    ai.skillSlots[0] = SKILL_POOL[randInt(0, SKILL_POOL.length - 1)];
    if (ai.skillSlots[0] === "DASH") {
      ai.dashEnergyMax = DASH_ENERGY_MAX;
      ai.dashEnergy = ai.dashEnergyMax;
    }

    if (aliveNow < minAlive + 2) {
      const now = Date.now();
      if (Math.random() < 0.5) {
        ai.tempZoneType = "HAHA";
        ai.tempZoneUntil = now + 2600;
        pushFx("😂", p.x, p.y, { kind: "pop", life: 900, scale: 1.15 });
      } else {
        ai.dashBurstUntil = now + 1600;
        pushFx("🏃", p.x, p.y, { kind: "pop", life: 900, scale: 1.15 });
      }
    }

    state.aiSnakes.push(ai);
    pushFx(ai.nameEmoji || "🤖", p.x, p.y, { kind: "pop", life: 800, scale: 1.1 });
  }
}

// ---- 气泡地块：生成/判定 ----
function spawnBubble() {
  const p = randomEmptyCell(9);
  const type = BUBBLE_KEYS[randInt(0, BUBBLE_KEYS.length - 1)];
  const r = randInt(2, 4);
  state.bubbles.push({ x: p.x, y: p.y, r, type, ttl: state.bubbleTTL, eventCd: randInt(250, 900) });
  pushFx(BUBBLES[type].emoji, p.x, p.y, { kind: "pop", life: 800, scale: 1.15 });
  playSfx("bubble");
}

function syncBubbles() {
  for (const b of state.bubbles) b.ttl -= state.logicStepMs;
  state.bubbles = state.bubbles.filter(b => b.ttl > 0);

  state.bubbleSpawnCd -= state.logicStepMs;
  if (state.bubbleSpawnCd <= 0 && state.bubbles.length < state.bubbleTarget) {
    spawnBubble();
    state.bubbleSpawnCd = 1500 + randInt(0, 1300);
  }
}

// 返回所在气泡区（优先最近一个）
function zoneTypeAt(x, y) {
  let best = null;
  let bestD = 1e9;
  for (const b of state.bubbles) {
    const d = dist2(x, y, b.x, b.y);
    if (d <= b.r * b.r && d < bestD) { best = b; bestD = d; }
  }
  return best ? best.type : null;
}

// ---- 区域事件：生成/移动/拾取/触发 ----
function spawnZoneShotFromBubble(bubble) {
  // 😂哈哈弹幕：从区中心附近喷出
  const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}];
  const d = dirs[randInt(0, dirs.length - 1)];
  const jitterX = randInt(-bubble.r, bubble.r);
  const jitterY = randInt(-bubble.r, bubble.r);
  let x = bubble.x + jitterX;
  let y = bubble.y + jitterY;
  if (state.wrap) { x = clampWrap(x, COLS); y = clampWrap(y, ROWS); }
  else {
    if (x < 0 || x >= COLS || y < 0 || y >= ROWS) { x = bubble.x; y = bubble.y; }
  }
  state.zoneShots.push({
    x, y, dx: d.x, dy: d.y,
    ttl: 2200,
    moveCd: 100,
    emoji: "😂",
    type: "HAHA_SHOT"
  });
}

function spawnZoneDrop(type, bubble) {
  const p = randomPointInBubble(bubble);
  if (!p) return;

  if (type === "WUWU_DROP") {
    state.zoneDrops.push({ x: p.x, y: p.y, ttl: 1800, emoji: "💧", type });
    return;
  }
  if (type === "QMARK_DROP") {
    state.zoneDrops.push({ x: p.x, y: p.y, ttl: 2000, emoji: "🎲", type });
    return;
  }
  if (type === "RAGE_DROP") {
    state.zoneDrops.push({ x: p.x, y: p.y, ttl: 1700, emoji: "💢", type });
    return;
  }
  if (type === "SLEEP_DROP") {
    state.zoneDrops.push({ x: p.x, y: p.y, ttl: 2200, emoji: "💤", type });
    return;
  }
}

function randomPointInBubble(b) {
  for (let t = 0; t < 120; t++) {
    const x = b.x + randInt(-b.r, b.r);
    const y = b.y + randInt(-b.r, b.r);
    const d = dist2(x, y, b.x, b.y);
    if (d > b.r * b.r) continue;
    let xx = x, yy = y;
    if (state.wrap) { xx = clampWrap(xx, COLS); yy = clampWrap(yy, ROWS); }
    else {
      if (xx < 0 || xx >= COLS || yy < 0 || yy >= ROWS) continue;
    }
    const k = keyOf(xx, yy);
    if (state.rockSet.has(k)) continue;
    if (state.player.body.some(p => p.x === xx && p.y === yy)) continue;
    if (state.aiSnakes.some(s => s.alive && s.body.some(p => p.x === xx && p.y === yy))) continue;
    if (state.zoneDrops.some(d2 => d2.x === xx && d2.y === yy)) continue;
    return { x: xx, y: yy };
  }
  return null;
}

function syncZoneEvents() {
  // TTL 减少
  for (const s of state.zoneShots) s.ttl -= state.logicStepMs;
  state.zoneShots = state.zoneShots.filter(s => s.ttl > 0);

  for (const d of state.zoneDrops) d.ttl -= state.logicStepMs;
  state.zoneDrops = state.zoneDrops.filter(d => d.ttl > 0);

  // 各区域生成事件
  for (const b of state.bubbles) {
    b.eventCd -= state.logicStepMs;
    if (b.eventCd > 0) continue;

    if (b.type === "HAHA") {
      // 😂：喷弹幕
      spawnZoneShotFromBubble(b);
      b.eventCd = 280 + randInt(0, 320);
    } else if (b.type === "WUWU") {
      // 😢：掉泪滴
      spawnZoneDrop("WUWU_DROP", b);
      b.eventCd = 1500 + randInt(0, 900);
    } else if (b.type === "QMARK") {
      // ❓：掉骰子
      spawnZoneDrop("QMARK_DROP", b);
      b.eventCd = 1700 + randInt(0, 900);
    } else if (b.type === "RAGE") {
      // 😡：火花
      spawnZoneDrop("RAGE_DROP", b);
      b.eventCd = 1200 + randInt(0, 700);
    } else if (b.type === "SLEEP") {
      // 😴：睡泡
      spawnZoneDrop("SLEEP_DROP", b);
      b.eventCd = 1600 + randInt(0, 900);
    } else {
      b.eventCd = 1200 + randInt(0, 900);
    }
  }

  // 弹幕移动
  for (const shot of state.zoneShots) {
    shot.moveCd -= state.logicStepMs;
    if (shot.moveCd > 0) continue;
    shot.moveCd = 100;

    let nx = shot.x + shot.dx;
    let ny = shot.y + shot.dy;

    if (state.wrap) {
      nx = clampWrap(nx, COLS);
      ny = clampWrap(ny, ROWS);
    } else {
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) { shot.ttl = 0; continue; }
    }

    // 撞石头就消失
    if (state.rockSet.has(keyOf(nx, ny))) { shot.ttl = 0; continue; }

    shot.x = nx;
    shot.y = ny;
  }
}

function applyZoneShotHit(snake, shot) {
  // 😂弹幕：强制摆头 0.2s
  if (!ZONE_STEER_ENABLED) {
    snake.steeredDir = null;
    snake.steeredUntil = 0;
    pushFx("😂", snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 520, scale: 1.1 });
    if (snake.isPlayer) beep(760, 45, "square", 0.02);
    return;
  }
  const now = Date.now();
  const cur = snake.dir;

  const left = { x: -cur.y, y: cur.x };
  const right = { x: cur.y, y: -cur.x };
  const pick = Math.random() < 0.5 ? left : right;

  snake.steeredDir = pick;
  snake.steeredUntil = now + 200;

  pushFx("😂", snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 520, scale: 1.1 });
  if (snake.isPlayer) beep(760, 45, "square", 0.02);
}

function applyZoneDropHit(snake, drop) {
  const now = Date.now();

  if (drop.type === "WUWU_DROP") {
    // 💧：短护盾
    snake.shieldUntil = Math.max(snake.shieldUntil, now + 700);
    pushFx("🛡️", snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 650, scale: 1.15 });
    if (snake.isPlayer) { bumpCombo(); addScore(1); pushChain("💧"); }
    beep(520, 60, "triangle", 0.018);
    return;
  }

  if (drop.type === "QMARK_DROP") {
    // 🎲：随机补一个技能 + 小飘一下
    const key = SKILL_POOL[randInt(0, SKILL_POOL.length - 1)];
    addSkillToSnake(snake, key);
    snake.steeredDir = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}][randInt(0,3)];
    snake.steeredUntil = now + 150;
    pushFx("🎲", snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 650, scale: 1.15 });
    if (snake.isPlayer) { bumpCombo(); addScore(1); pushChain("🎲"); }
    beep(820, 55, "square", 0.02);
    return;
  }

  if (drop.type === "RAGE_DROP") {
    // 💢：短冲刺 + 随机丢一个技能
    snake.dashBurstUntil = Math.max(snake.dashBurstUntil, now + 600);

    // 丢一个随机技能（如果有）
    const filled = [];
    for (let i = 0; i < 3; i++) if (snake.skillSlots[i]) filled.push(i);
    if (filled.length) {
      const idx = filled[randInt(0, filled.length - 1)];
      snake.skillSlots[idx] = null;
      pushFx("🗑️", snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 520, scale: 1.05 });
    }

    pushFx("💢", snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 650, scale: 1.15 });
    if (snake.isPlayer) { bumpCombo(); addScore(1); pushChain("💢"); }
    beep(240, 70, "sawtooth", 0.02);
    return;
  }

  if (drop.type === "SLEEP_DROP") {
    // 💤：全场肉链“保鲜”更耐久（加时间，封顶）
    for (const ch of state.meatChains) {
      ch.ttl = Math.min(state.meatTTL * 2.2, ch.ttl + 1500);
    }
    pushFx("💤", snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 700, scale: 1.2 });
    if (snake.isPlayer) { bumpCombo(); addScore(1); pushChain("💤"); }
    beep(420, 80, "sine", 0.018);
    return;
  }
}

// ---- 收集册 ----
function albumCount() { return Object.keys(state.album).length; }
function unlockAlbum(key) {
  if (!state.album[key]) {
    state.album[key] = { firstAt: Date.now() };
    saveAlbum(state.album);
  }
}
function saveAlbumIfPlayer(snake, key) { if (snake.isPlayer) unlockAlbum(key); }

// ---- 技能槽：丢弃/替换 ----
function dropSkill(snake, slotIndex) {
  const key = snake.skillSlots[slotIndex];
  if (!key) { beep(220, 40, "square", 0.01); return; }
  snake.skillSlots[slotIndex] = null;
  if (key === "DASH" && !snake.skillSlots.includes("DASH")) {
    snake.dashEnergy = 0;
    snake.dashEnergyMax = 0;
    snake.dashHeld = false;
  }
  const h = snakeHead(snake);
  pushFx("🗑️", h.x, h.y, { kind: "pop", life: 650, scale: 1.15 });
  beep(300, 60, "triangle", 0.015);
}

function beginSkillReplace(skillKey) {
  const def = SKILLS[skillKey];
  state.awaitingReplace = { skillKey, skillEmoji: def.emoji };
  state.acc = 0;
  pushFx(def.emoji, snakeHead(state.player).x, snakeHead(state.player).y, { kind: "pop", life: 700, scale: 1.15 });
  beep(640, 60, "square", 0.02);
  syncMusicState();
}

function resolveSkillReplace(slotIndex) {
  if (!state.awaitingReplace) return;
  const key = state.awaitingReplace.skillKey;
  const def = SKILLS[key];
  const hadDash = state.player.skillSlots.includes("DASH");

  state.player.skillSlots[slotIndex] = key;
  if (state.player.isPlayer) unlockAlbum(`SK_${key}`);
  if (key === "DASH") {
    state.player.dashEnergyMax = DASH_ENERGY_MAX;
    state.player.dashEnergy = state.player.dashEnergyMax;
  }
  if (hadDash && !state.player.skillSlots.includes("DASH")) {
    state.player.dashEnergy = 0;
    state.player.dashEnergyMax = 0;
    state.player.dashHeld = false;
  }

  pushFx(def.emoji, snakeHead(state.player).x, snakeHead(state.player).y, { kind: "pop", life: 700, scale: 1.15 });
  beep(640, 60, "square", 0.02);
  pushChain(def.emoji);

  state.awaitingReplace = null;
  syncMusicState();
  ui();
}

function addSkillToSnake(snake, skillKey, opt = {}) {
  const def = SKILLS[skillKey];
  if (snake.isPlayer) unlockAlbum(`SK_${skillKey}`);

  const slots = snake.skillSlots;
  const emptyIdx = slots.findIndex(s => s === null);
  if (emptyIdx !== -1) {
    slots[emptyIdx] = skillKey;
  } else if (snake.isPlayer && opt.askReplace) {
    beginSkillReplace(skillKey);
    return false;
  } else {
    slots.shift();
    slots.push(skillKey);
    if (snake.isPlayer) pushFx("🔁", snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 520, scale: 1.05 });
  }

  if (skillKey === "DASH") {
    snake.dashEnergyMax = DASH_ENERGY_MAX;
    snake.dashEnergy = snake.dashEnergyMax;
  }

  pushFx(def.emoji, snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 700, scale: 1.15 });
  beep(640, 60, "square", 0.02);
  if (snake.isPlayer) pushChain(def.emoji);
  return true;
}

// ✅ 一次性：用完就空 + 区域增益
function useSkill(snake, slotIndex) {
  const key = snake.skillSlots[slotIndex];
  if (!key) return false;
  if (key === "DASH") return false;

  snake.skillSlots[slotIndex] = null;

  const def = SKILLS[key];
  const now = Date.now();
  const z = zoneProps(effectiveZoneType(snake));

  if (key === "SHIELD") {
    const mul = z ? z.shieldMul : 1.0;
    snake.shieldUntil = now + Math.floor(def.duration * mul);
  }
  if (key === "MAGNET") {
    const mul = z ? z.magnetMul : 1.0;
    snake.magnetUntil = now + Math.floor(def.duration * mul);
  }
  if (key === "BOMB") explodeFromSnake(snake);

  pushFx(def.emoji, snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 800, scale: 1.25 });
  beep(snake.isPlayer ? 160 : 200, 120, "sine", 0.03);
  if (snake.isPlayer) pushChain(def.emoji);
  return true;
}

// ---- 炸裂：击杀/反杀 + 彩蛋 ----
function dropEggAt(x, y) {
  const egg = EGG_POOL[randInt(0, EGG_POOL.length - 1)];
  state.eggs.push({ x, y, emoji: egg.emoji, key: egg.key, ttl: state.eggTTL });
  pushFx(egg.emoji, x, y, { kind: "pop", life: 700, scale: 1.2 });
  playSfx("egg");
}

function explodeFromSnake(srcSnake) {
  const h = snakeHead(srcSnake);
  const radius = srcSnake.isPlayer ? BOMB_RADIUS : Math.max(3, BOMB_RADIUS - 1);
  const r2 = radius * radius;
  playSfx("boom");
  if (srcSnake.isPlayer) triggerShake(8);

  // rocks
  const keptR = [];
  state.rockSet.clear();
  for (const r of state.rocks) {
    if (dist2(r.x, r.y, h.x, h.y) <= r2) {
      pushFx("💥", r.x, r.y, { kind: "pop", life: 600, scale: 1.25 });
      continue;
    }
    keptR.push(r);
    state.rockSet.add(keyOf(r.x, r.y));
  }
  state.rocks = keptR;

  const victims = [state.player, ...state.aiSnakes].filter(s => s && s.alive);
  const now = Date.now();
  for (const v of victims) {
    if (!snakeInRadius(v, h.x, h.y, r2)) continue;
    if (now < v.shieldUntil) {
      v.shieldUntil = 0;
      pushFx("🛡️", snakeHead(v).x, snakeHead(v).y, { kind: "pop", life: 650, scale: 1.1 });
      continue;
    }
    const cut = shortenSnake(v, BOMB_LEN_RATIO, 2);
    if (cut) {
      pushFx("💥", snakeHead(v).x, snakeHead(v).y, { kind: "pop", life: 650, scale: 1.2 });
    }
  }
}

// ---- 肉链 + autoChomp ----
function leaveMeatChainFromSnake(snake) {
  const points = snake.body.map(p => ({ x: p.x, y: p.y }));
  const z = zoneProps(effectiveZoneType(snake));
  const mul = (z && z.key === "SLEEP") ? 1.7 : 1.0; // 😴区：肉链更耐久（本条更耐久）
  state.meatChains.push({ id: state.meatChainIdSeq++, points, ttl: Math.floor(state.meatTTL * mul) });
}

function findChainById(id) {
  return state.meatChains.find(ch => ch.id === id) || null;
}

function findMeatAt(x, y) {
  for (let ci = 0; ci < state.meatChains.length; ci++) {
    const ch = state.meatChains[ci];
    for (let pi = 0; pi < ch.points.length; pi++) {
      const p = ch.points[pi];
      if (p.x === x && p.y === y) return { ci, pi };
    }
  }
  return null;
}

function eatMeatPointAndKickAuto(snake, ci, pi) {
  const ch = state.meatChains[ci];
  if (!ch) return 0;

  let eaten = 0;

  const eatOneAtIndex = (idx) => {
    const p = ch.points[idx];
    if (!p) return false;
    ch.points.splice(idx, 1);
    eaten++;
    snake.grow += 1;
    if (snake.isPlayer) { bumpCombo(); addScore(1); }
    pushFx("🍖", p.x, p.y, { kind: "pop", life: 420, scale: 1.05 });
    return true;
  };

  eatOneAtIndex(pi);
  eatOneAtIndex(pi);

  if (ch.points.length === 0) state.meatChains.splice(ci, 1);

  if (AUTO_CHOMP_ENABLED) {
    const now = Date.now();
    snake.autoChompUntil = Math.max(snake.autoChompUntil, now + state.autoChompDurationMs);
    snake.autoChompUntil = Math.min(snake.autoChompUntil, now + state.autoChompMaxMs);
    snake.autoChompChainId = ch.id;
  } else {
    snake.autoChompUntil = 0;
    snake.autoChompChainId = null;
  }

  if (snake.isPlayer) {
    pushChain("🍖");
    if (AUTO_CHOMP_ENABLED) {
      pushFx("😵‍💫", snakeHead(snake).x, snakeHead(snake).y, { kind: "pop", life: 520, scale: 1.05 });
      beep(690, 60, "square", 0.02);
    }
  }
  return eaten;
}

function computeAutoChompDir(snake) {
  if (!AUTO_CHOMP_ENABLED) return null;
  const now = Date.now();
  if (now >= snake.autoChompUntil) return null;
  if (!snake.autoChompChainId) return null;

  const ch = findChainById(snake.autoChompChainId);
  if (!ch || !ch.points.length) return null;

  const h = snakeHead(snake);

  let best = null;
  let bestD = 1e9;
  for (const p of ch.points) {
    const d = manhattan(h.x, h.y, p.x, p.y);
    if (d < bestD) { bestD = d; best = p; }
  }
  if (!best || bestD > state.autoChompSearchMax) return null;

  const cur = snake.dir;
  const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
    .filter(d => !(d.x === -cur.x && d.y === -cur.y));

  const z = zoneProps(effectiveZoneType(snake));
  const extra = z ? z.autoChompJitterAdd : 0;
  const bias = Math.min(0.5, state.autoChompGreedBias + extra);

  const scoreDir = (d) => {
    let nx = h.x + d.x, ny = h.y + d.y;
    if (state.wrap) { nx = clampWrap(nx, COLS); ny = clampWrap(ny, ROWS); }
    const dd = manhattan(nx, ny, best.x, best.y);
    const rockPenalty = state.rockSet.has(keyOf(nx, ny)) ? 6 : 0;
    const jitter = Math.random() < bias ? randInt(0, 2) : 0;
    return dd + rockPenalty + jitter;
  };

  dirs.sort((a, b) => scoreDir(a) - scoreDir(b));
  return dirs[0] || null;
}

function cancelAutoChomp(snake) {
  snake.autoChompUntil = 0;
  snake.autoChompChainId = null;
}

function enqueueDir(dx, dy) {
  const p = state.player;
  if (!p) return;
  if (AUTO_CHOMP_ENABLED && Date.now() < p.autoChompUntil && dx === -p.dir.x && dy === -p.dir.y) {
    cancelAutoChomp(p);
    return;
  }
  if (dx === -p.dir.x && dy === -p.dir.y) return;

  const last = state.dirQueue.length ? state.dirQueue[state.dirQueue.length - 1] : p.nextDir;
  if (dx === last.x && dy === last.y) return;
  if (dx === -last.x && dy === -last.y) return;

  const cand = { x: dx, y: dy };
  p.nextDir = cand;
  state.dirQueue.length = 0;
  state.dirQueue.push(cand);
}

function nextCellFrom(h, dir) {
  let nx = h.x + dir.x;
  let ny = h.y + dir.y;
  const out = (!state.wrap && (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS));
  if (state.wrap) {
    nx = clampWrap(nx, COLS);
    ny = clampWrap(ny, ROWS);
  }
  return { x: nx, y: ny, out };
}

function isBlockedCell(nx, ny, bodyMap) {
  if (!state.wrap && (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS)) return true;
  if (state.rockSet.has(keyOf(nx, ny))) return true;
  if (bodyMap && bodyMap.has(keyOf(nx, ny))) return true;
  return false;
}

function maybeAssistDir(snake, dir, bodyMap) {
  if (!ASSIST_ENABLED) return dir;
  if (!snake.isPlayer || !state.assistOn) return dir;
  if (state.assistCd > 0) return dir;

  const h = snakeHead(snake);
  const next = nextCellFrom(h, dir);
  if (!isBlockedCell(next.x, next.y, bodyMap) && !next.out) return dir;

  const left = { x: -dir.y, y: dir.x };
  const right = { x: dir.y, y: -dir.x };
  const leftCell = nextCellFrom(h, left);
  if (!isBlockedCell(leftCell.x, leftCell.y, bodyMap) && !leftCell.out) {
    state.assistCd = 500;
    pushFx("🛟", h.x, h.y, { kind: "pop", life: 420, scale: 1.05 });
    return left;
  }
  const rightCell = nextCellFrom(h, right);
  if (!isBlockedCell(rightCell.x, rightCell.y, bodyMap) && !rightCell.out) {
    state.assistCd = 500;
    pushFx("🛟", h.x, h.y, { kind: "pop", life: 420, scale: 1.05 });
    return right;
  }
  return dir;
}

// ---- 死亡 ----
function killSnake(snake, opt = {}) {
  if (!snake.alive) return;
  snake.alive = false;

  const h = snakeHead(snake);
  pushFx("💀", h.x, h.y, { kind: "pop", life: 900, scale: 1.3 });
  beep(120, 160, "sine", 0.025);
  if (snake.isPlayer) {
    triggerShake(12);
    triggerSlowmo(0.5, 260);
  } else if (opt.killer && opt.killer.isPlayer) {
    triggerShake(10);
    triggerSlowmo(0.55, 240);
    pushChain("💀");
  }

  leaveMeatChainFromSnake(snake);
  if (opt.egg) dropEggAt(h.x, h.y);
  if (snake.isPlayer) gameOver();
}

// ---- AI 决策 ----
function chooseAIDir(ai) {
  const head = snakeHead(ai);
  const persona = ai.persona || AI_PERSONAS[0];
  const now = Date.now();

  const cur = ai.dir;
  const dirs = [{x:1,y:0},{x:-1,y:0},{x:0,y:1},{x:0,y:-1}]
    .filter(d => !(d.x === -cur.x && d.y === -cur.y));

  const occupied = (nx, ny) => {
    for (const p of state.player.body) if (p.x === nx && p.y === ny) return true;
    for (const a of state.aiSnakes) {
      if (!a.alive) continue;
      for (const p of a.body) if (p.x === nx && p.y === ny) return true;
    }
    return false;
  };

  const blocked = (nx, ny) => {
    if (!state.wrap) {
      if (nx < 0 || nx >= COLS || ny < 0 || ny >= ROWS) return true;
    } else {
      nx = clampWrap(nx, COLS); ny = clampWrap(ny, ROWS);
    }
    return state.rockSet.has(keyOf(nx, ny));
  };

  const blockedCount = dirs.reduce((acc, d) => {
    const nx = head.x + d.x;
    const ny = head.y + d.y;
    const tx = state.wrap ? clampWrap(nx, COLS) : nx;
    const ty = state.wrap ? clampWrap(ny, ROWS) : ny;
    if (blocked(nx, ny) || occupied(tx, ty)) return acc + 1;
    return acc;
  }, 0);

  if (now > ai.aiHesitateUntil && Math.random() < persona.hesitate) {
    const edgeBias = blockedCount >= 2 ? 0.7 : 0.25;
    if (Math.random() < edgeBias) ai.aiHesitateUntil = now + randInt(140, 260);
  }

  if (ai.aiFakeUntil > now && ai.aiFakeDir) {
    const fx = head.x + ai.aiFakeDir.x;
    const fy = head.y + ai.aiFakeDir.y;
    if (!blocked(fx, fy)) return ai.aiFakeDir;
    ai.aiFakeUntil = 0;
    ai.aiFakeDir = null;
  } else if (Math.random() < persona.fake) {
    const left = { x: -cur.y, y: cur.x };
    const right = { x: cur.y, y: -cur.x };
    const fakePick = Math.random() < 0.5 ? left : right;
    const fx = head.x + fakePick.x;
    const fy = head.y + fakePick.y;
    if (!blocked(fx, fy)) {
      ai.aiFakeUntil = now + randInt(140, 240);
      ai.aiFakeDir = fakePick;
      return fakePick;
    }
  }

  const candidates = [];
  if (state.gift) candidates.push({ x: state.gift.x, y: state.gift.y, w: 0.9 + persona.greed });
  if (state.zoneDrops.length) candidates.push({ x: state.zoneDrops[0].x, y: state.zoneDrops[0].y, w: 0.6 + persona.greed * 0.6 });
  if (state.eggs.length) candidates.push({ x: state.eggs[0].x, y: state.eggs[0].y, w: 0.7 + persona.greed * 0.5 });
  if (state.meatChains.length && state.meatChains[0].points.length) {
    const p = state.meatChains[0].points[0];
    candidates.push({ x: p.x, y: p.y, w: 0.5 + persona.greed * 0.4 });
  }
  if (state.pellets.length) candidates.push({ x: state.pellets[0].x, y: state.pellets[0].y, w: 0.35 + persona.greed * 0.3 });

  const ph = snakeHead(state.player);
  const dP = manhattan(head.x, head.y, ph.x, ph.y);
  const playerWeight = Math.max(0.05, 0.5 + persona.aggro - persona.coward - (dP <= 6 ? persona.coward : 0));
  candidates.push({ x: ph.x, y: ph.y, w: playerWeight });

  let target = { x: ph.x, y: ph.y };
  let bestScore = -1;
  for (const c of candidates) {
    const d = manhattan(head.x, head.y, c.x, c.y);
    const score = c.w / Math.max(1, d + Math.random() * 1.4);
    if (score > bestScore) { bestScore = score; target = c; }
  }

  dirs.sort((a,b) => {
    const ax = state.wrap ? clampWrap(head.x + a.x, COLS) : head.x + a.x;
    const ay = state.wrap ? clampWrap(head.y + a.y, ROWS) : head.y + a.y;
    const bx = state.wrap ? clampWrap(head.x + b.x, COLS) : head.x + b.x;
    const by = state.wrap ? clampWrap(head.y + b.y, ROWS) : head.y + b.y;
    return manhattan(ax, ay, target.x, target.y) - manhattan(bx, by, target.x, target.y);
  });

  for (const d of dirs) {
    const nx = head.x + d.x;
    const ny = head.y + d.y;
    const tx = state.wrap ? clampWrap(nx, COLS) : nx;
    const ty = state.wrap ? clampWrap(ny, ROWS) : ny;
    if (!blocked(nx, ny) && !occupied(tx, ty)) return d;
  }
  return dirs[0] || cur;
}

// 😡暴走区：AI 更爱放 💣（区域事件的一部分“行为层”）
function aiMaybeUseSkill(ai) {
  ai.aiSkillThinkCd -= state.logicStepMs;
  if (ai.aiSkillThinkCd > 0) return;
  ai.aiSkillThinkCd = 420 + randInt(0, 520);

  const persona = ai.persona || AI_PERSONAS[0];
  const readyIdx = [];
  for (let i = 0; i < 3; i++) if (ai.skillSlots[i]) readyIdx.push(i);
  if (!readyIdx.length) return;

  const z = effectiveZoneType(ai);
  const rage = (z === "RAGE");

  // 如果在暴走区且有炸弹，优先用炸弹
  if (rage) {
    for (const i of readyIdx) {
      if (ai.skillSlots[i] === "BOMB" && Math.random() < 0.38) {
        useSkill(ai, i);
        return;
      }
    }
  }

  // 常规：靠近玩家更可能放
  const ph = snakeHead(state.player);
  const ah = snakeHead(ai);
  const d = manhattan(ph.x, ph.y, ah.x, ah.y);
  const prob = d <= 8 ? (rage ? 0.34 : 0.24 + persona.aggro * 0.12) : (rage ? 0.18 : 0.08 + persona.aggro * 0.12);

  const dashIdx = readyIdx.filter(i => ai.skillSlots[i] === "DASH");
  if (dashIdx.length && Math.random() < (persona.dash + (rage ? 0.15 : 0))) {
    ai.aiDashHoldUntil = Date.now() + randInt(320, 680);
    ai.dashEnergy = Math.max(ai.dashEnergy, ai.dashEnergyMax * 0.6);
    return;
  }

  if (Math.random() < prob) {
    const pick = readyIdx[randInt(0, readyIdx.length - 1)];
    if (ai.skillSlots[pick] === "DASH") return;
    useSkill(ai, pick);
  }
}

// ---- 下一步（含：弹幕强制摆头 / autoChomp 接管）----
function predictNextHead(snake, bodyMap) {
  const h = snakeHead(snake);
  const now = Date.now();

  // ① 😂弹幕等短强制摆头
  const steered = (snake.steeredDir && now < snake.steeredUntil) ? snake.steeredDir : null;

  // ② 吃肉链后的 autoChomp 接管
  const forcedChomp = computeAutoChompDir(snake);

  let dx, dy;
  if (steered) {
    dx = steered.x; dy = steered.y;
  } else if (forcedChomp) {
    dx = forcedChomp.x; dy = forcedChomp.y;
  } else if (snake.isPlayer) {
    const cur = snake.dir;
    while (state.dirQueue.length) {
      const cand = state.dirQueue[state.dirQueue.length - 1];
      if (cand.x === -cur.x && cand.y === -cur.y) {
        state.dirQueue.pop();
        continue;
      }
      snake.nextDir = state.dirQueue.pop();
      break;
    }
    dx = snake.nextDir.x;
    dy = snake.nextDir.y;
  } else {
    dx = snake.dir.x;
    dy = snake.dir.y;
  }

  const cur = snake.dir;
  if (dx === -cur.x && dy === -cur.y) { dx = cur.x; dy = cur.y; }

  if (snake.isPlayer && !steered && !forcedChomp) {
    const assisted = maybeAssistDir(snake, { x: dx, y: dy }, bodyMap);
    dx = assisted.x; dy = assisted.y;
  }

  snake.dir = { x: dx, y: dy };

  const next = nextCellFrom(h, { x: dx, y: dy });
  return { x: next.x, y: next.y, out: next.out };
}

function buildBodyMap() {
  const map = new Map();
  const put = (snake, p, isHead) => {
    const k = keyOf(p.x, p.y);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push({ snakeId: snake.id, isHead });
  };

  if (state.player.alive) for (let i = 0; i < state.player.body.length; i++) put(state.player, state.player.body[i], i === 0);
  for (const a of state.aiSnakes) {
    if (!a.alive) continue;
    for (let i = 0; i < a.body.length; i++) put(a, a.body[i], i === 0);
  }
  return map;
}

// ---- 吃 ----
function snakeEatAt(snake, x, y) {
  // 先吃“区域掉落”
  for (let i = 0; i < state.zoneDrops.length; i++) {
    const d = state.zoneDrops[i];
    if (d.x === x && d.y === y) {
      state.zoneDrops.splice(i, 1);
      applyZoneDropHit(snake, d);
      return true;
    }
  }

  // 彩蛋
  for (let i = 0; i < state.eggs.length; i++) {
    const e = state.eggs[i];
    if (e.x === x && e.y === y) {
      if (snake.isPlayer) { bumpCombo(); addScore(3); unlockAlbum(e.key); }
      snake.grow += 2;
      pushFx(e.emoji, x, y, { kind: "pop", life: 700, scale: 1.2 });
      if (snake.isPlayer) pushChain(e.emoji);
      state.eggs.splice(i, 1);
      beep(720, 70, "square", 0.02);
      return true;
    }
  }

  // 肉链
  const hit = findMeatAt(x, y);
  if (hit) {
    const eaten = eatMeatPointAndKickAuto(snake, hit.ci, hit.pi);
    if (eaten > 0) {
      if (AUTO_CHOMP_ENABLED) {
        const now = Date.now();
        snake.autoChompUntil = Math.min(now + state.autoChompMaxMs, snake.autoChompUntil + state.autoChompExtendMs);
      }
      return true;
    }
  }

  // 🎁 技能补给（一次性补槽）
  if (state.gift && state.gift.x === x && state.gift.y === y) {
    addSkillToSnake(snake, state.gift.skillKey, { askReplace: snake.isPlayer });
    state.gift = null;
    state.giftCooldownMs = 900 + randInt(0, 900);

    snake.grow += 1;
    if (snake.isPlayer) { bumpCombo(); addScore(1); }
    if (snake.isPlayer) pushChain("🎁");
    return true;
  }

  // 小球
  for (let i = 0; i < state.pellets.length; i++) {
    const p = state.pellets[i];
    if (p.x === x && p.y === y) {
      state.pellets.splice(i, 1);
      snake.grow += 1;
      if (snake.isPlayer) { bumpCombo(); addScore(1); }
      pushFx("•", x, y, { kind: "float", life: 420, scale: 1.0 });
      if (snake.isPlayer) playSfx("pellet");
      if (snake.isPlayer) pushChain("✨");
      return true;
    }
  }

  return false;
}

// ---- 逻辑帧 ----
function logicTick() {
  if (!state.running || state.paused) return;
  if (state.awaitingReplace) { ui(); return; }
  if (!state.player.alive) return;

  syncBubbles();
  syncZoneEvents();

  updateGiftCooldown();
  refillPellets();
  syncRocks();
  syncAISnakes();

  comboDecay();
  state.assistCd = Math.max(0, state.assistCd - state.logicStepMs);

  // TTL
  for (const ch of state.meatChains) ch.ttl -= state.logicStepMs;
  state.meatChains = state.meatChains.filter(ch => ch.ttl > 0 && ch.points.length > 0);

  for (const e of state.eggs) e.ttl -= state.logicStepMs;
  state.eggs = state.eggs.filter(e => e.ttl > 0);

  const snakes = [state.player, ...state.aiSnakes.filter(s => s.alive)];

  for (const s of snakes) {
    s.moveCd -= state.logicStepMs;
    const hh = snakeHead(s);
    s.zoneType = zoneTypeAt(hh.x, hh.y);
    updateDashEnergy(s);
  }
  state.playerZoneType = state.player.zoneType;

  for (const s of snakes) {
    if (!s.isPlayer) {
      if (s.moveCd <= state.logicStepMs) s.dir = chooseAIDir(s);
      aiMaybeUseSkill(s);
    }
  }

  const movers = snakes.filter(s => s.alive && s.moveCd <= 0);
  if (!movers.length) { ui(); return; }

  const bodyMapNow = buildBodyMap();
  const nextMap = new Map();
  for (const s of movers) nextMap.set(s.id, predictNextHead(s, bodyMapNow));

  // 撞墙/石头（护体挡一次）
  for (const s of movers) {
    if (!s.alive) continue;
    const nh = nextMap.get(s.id);

    if (!state.wrap && nh.out) {
      const now = Date.now();
      if (now < s.shieldUntil) {
        s.shieldUntil = 0;
        s.moveCd = Math.max(80, snakeMovePeriodMs(s) * 0.78);
        pushFx("🛡️", snakeHead(s).x, snakeHead(s).y, { kind: "pop", life: 600 });
        continue;
      }
      killSnake(s, { killer: null, egg: false });
      continue;
    }

    if (state.rockSet.has(keyOf(nh.x, nh.y))) {
      const now = Date.now();
      if (now < s.shieldUntil) {
        s.shieldUntil = 0;
        s.moveCd = Math.max(80, snakeMovePeriodMs(s) * 0.78);
        pushFx("🛡️", snakeHead(s).x, snakeHead(s).y, { kind: "pop", life: 600 });
        continue;
      }
      killSnake(s, { killer: null, egg: false });
      continue;
    }
  }

  // 移动 + 吃
  for (const s of movers) {
    if (!s.alive) continue;

    const nh = nextMap.get(s.id);
    s.body.unshift({ x: nh.x, y: nh.y });

    // 移动后 zone
    s.zoneType = zoneTypeAt(nh.x, nh.y);
    if (s.isPlayer) state.playerZoneType = s.zoneType;

    // magnet：只吸 🎁 / 彩蛋 / 区域掉落（更有趣）
    const now = Date.now();
    if (now < s.magnetUntil) {
      const hh = snakeHead(s);

      if (state.gift) {
        const d = manhattan(hh.x, hh.y, state.gift.x, state.gift.y);
        if (d <= 9) {
          if (Math.abs(hh.x - state.gift.x) > Math.abs(hh.y - state.gift.y)) state.gift.x += Math.sign(hh.x - state.gift.x);
          else state.gift.y += Math.sign(hh.y - state.gift.y);
          if (state.wrap) { state.gift.x = clampWrap(state.gift.x, COLS); state.gift.y = clampWrap(state.gift.y, ROWS); }
        }
      }

      for (const e of state.eggs) {
        const d = manhattan(hh.x, hh.y, e.x, e.y);
        if (d <= 7) {
          if (Math.abs(hh.x - e.x) > Math.abs(hh.y - e.y)) e.x += Math.sign(hh.x - e.x);
          else e.y += Math.sign(hh.y - e.y);
          if (state.wrap) { e.x = clampWrap(e.x, COLS); e.y = clampWrap(e.y, ROWS); }
          break;
        }
      }

      for (const d of state.zoneDrops) {
        const dd = manhattan(hh.x, hh.y, d.x, d.y);
        if (dd <= 6) {
          if (Math.abs(hh.x - d.x) > Math.abs(hh.y - d.y)) d.x += Math.sign(hh.x - d.x);
          else d.y += Math.sign(hh.y - d.y);
          if (state.wrap) { d.x = clampWrap(d.x, COLS); d.y = clampWrap(d.y, ROWS); }
          break;
        }
      }

      const pelletSet = new Set(state.pellets.map(p => keyOf(p.x, p.y)));
      for (const p of state.pellets) {
        const d = manhattan(hh.x, hh.y, p.x, p.y);
        if (d > MAGNET_PULL_RANGE) continue;
        const nx = p.x + Math.sign(hh.x - p.x);
        const ny = p.y + Math.sign(hh.y - p.y);
        let tx = nx, ty = ny;
        if (state.wrap) { tx = clampWrap(tx, COLS); ty = clampWrap(ty, ROWS); }
        if (state.rockSet.has(keyOf(tx, ty))) continue;
        const nk = keyOf(tx, ty);
        if (pelletSet.has(nk)) continue;
        pelletSet.delete(keyOf(p.x, p.y));
        p.x = tx; p.y = ty;
        pelletSet.add(nk);
      }
    }

    // 先检查弹幕命中（头进入弹幕格）
    for (let i = 0; i < state.zoneShots.length; i++) {
      const sh = state.zoneShots[i];
      if (sh.x === nh.x && sh.y === nh.y) {
        state.zoneShots.splice(i, 1);
        applyZoneShotHit(s, sh);
        break;
      }
    }

    snakeEatAt(s, nh.x, nh.y);

    if (s.grow > 0) s.grow -= 1;
    else s.body.pop();

    if (isBoostActive(s) && snakeLen(s) > s.baseLen) {
      s.body.pop();
    }

    s.moveCd = snakeMovePeriodMs(s);
  }

  // 碰撞：头撞障碍/其他蛇=死（护体挡一次）
  const bodyMap = buildBodyMap();
  const toDie = new Set();

  for (const s of [state.player, ...state.aiSnakes]) {
    if (!s.alive) continue;

    const now = Date.now();
    const h = snakeHead(s);
    const arr = bodyMap.get(keyOf(h.x, h.y)) || [];

    const others = arr.filter(it => it.snakeId !== s.id);
    if (others.length) {
      if (now < s.shieldUntil) {
        s.shieldUntil = 0;
        if (s.body.length > 8) s.body.splice(Math.floor(s.body.length / 2));
        pushFx("🛡️", h.x, h.y, { kind: "pop", life: 650 });
        continue;
      }
      toDie.add(s.id);
    }
  }

  for (const id of toDie) {
    const victim = id === "P" ? state.player : state.aiSnakes.find(s => s.id === id);
    if (victim && victim.alive) killSnake(victim, { killer: null, egg: false });
  }

  ui();
}

// ---- UI ----
function ui() {
  scoreEl.textContent = String(state.score);
  highEl.textContent = String(state.high);
  modeEl.textContent = state.wrap ? "穿墙" : "撞墙";

  const p = state.player;
  const now = Date.now();
  const shield = now < p.shieldUntil;
  const dash = isDashActive(p, now);
  const magnet = now < p.magnetUntil;

  let buff = "无";
  if (shield) buff = "🛡️ 护体";
  else if (dash) {
    buff = p.dashEnergyMax > 0 ? `🏃 冲刺 ${Math.round(p.dashEnergy)}%` : "🏃 冲刺";
  } else if (magnet) buff = "🧲 吸吸";

  const boostText = isBoostActive(p) ? " | ⚡ 加速" : "";

  const streak = state.combo.streak;
  const me = moodEmoji(streak);
  const mult = state.combo.mult.toFixed(2);
  const comboText = streak > 0 ? ` | 连击x${streak} ${me}（${mult}x）` : "";
  const chompText = (AUTO_CHOMP_ENABLED && now < p.autoChompUntil) ? " | 😵‍💫 上头中" : "";
  const steerText = (ZONE_STEER_ENABLED && now < p.steeredUntil) ? " | 😂 被带跑了" : "";

  let zoneText = "";
  if (state.playerZoneType) {
    const z = BUBBLES[state.playerZoneType];
    zoneText = ` | ${z.emoji} ${z.name}`;
  }

  const assistText = (ASSIST_ENABLED && state.assistOn) ? " | 🛟 辅助驾驶" : "";
  buffEl.textContent = `${buff}${comboText}${chompText}${steerText}${zoneText}${assistText}${boostText}`;

  const base = 210;
  const spd = (base / snakeMovePeriodMs(p)).toFixed(2);
  spdEl.textContent = `${spd}x`;

  albumEl.textContent = `${albumCount()}/${(Object.keys(SKILLS).length + EGG_POOL.length)}`;

  for (let i = 0; i < 3; i++) {
    const key = p.skillSlots[i];
    if (!key) {
      slotUI[i].emoji.textContent = "—";
      slotUI[i].name.textContent = "空";
      slotUI[i].cd.style.width = "0%";
      if (btnSkill[i]) {
        btnSkill[i].textContent = "—";
        btnSkill[i].disabled = true;
      }
      continue;
    }
    const def = SKILLS[key];
    slotUI[i].emoji.textContent = def.emoji;
    slotUI[i].name.textContent = def.name;
    if (key === "DASH") {
      slotUI[i].cd.style.width = `${Math.round(p.dashEnergy)}%`;
    } else {
      slotUI[i].cd.style.width = "0%";
    }
    if (btnSkill[i]) {
      btnSkill[i].textContent = def.emoji;
      btnSkill[i].disabled = false;
    }
  }

  if (btnPause) btnPause.textContent = state.paused ? "继续" : "暂停";
  if (btnBoost) btnBoost.disabled = snakeLen(p) <= p.baseLen;
}

// ---- GameOver ----
function gameOver() {
  state.running = false;
  state.awaitingReplace = null;
  if (state.score > state.high) {
    state.high = state.score;
    saveHigh(state.high);
  }
  const h = snakeHead(state.player);
  pushFx("💀", h.x, h.y, { kind: "pop", life: 900, scale: 1.3 });
  beep(120, 220, "sine", 0.03);
  syncMusicState();
  ui();
}

// ---- 渲染（圆润 + S 摆尾）----
function drawGridBackground() {
  const pad = Math.max(
    CELL * 2,
    Math.abs(state.camera.x) + Math.abs(state.camera.y) + state.shake.power + 24
  );
  const extraCols = Math.ceil(pad / CELL);
  const extraRows = Math.ceil(pad / CELL);

  ctx.fillStyle = "#111a2f";
  ctx.fillRect(-pad, -pad, canvas.width + pad * 2, canvas.height + pad * 2);

  ctx.globalAlpha = 0.10;
  ctx.strokeStyle = "#7db2ff";
  for (let x = -extraCols; x <= COLS + extraCols; x++) {
    ctx.beginPath();
    ctx.moveTo(x * CELL + 0.5, 0);
    ctx.lineTo(x * CELL + 0.5, canvas.height);
    ctx.stroke();
  }
  for (let y = -extraRows; y <= ROWS + extraRows; y++) {
    ctx.beginPath();
    ctx.moveTo(0, y * CELL + 0.5);
    ctx.lineTo(canvas.width, y * CELL + 0.5);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawEmoji(emoji, x, y, scale = 1) {
  ctx.save();
  ctx.font = `${Math.floor(CELL * scale)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(emoji, x * CELL + CELL / 2, y * CELL + CELL / 2 + 1);
  ctx.restore();
}

function drawBallCell(x, y, r, alpha = 1) {
  const cx = x * CELL + CELL / 2;
  const cy = y * CELL + CELL / 2;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function snakeRadius(snake) {
  const scale = snakeScale(snake);
  return Math.max(2.2, CELL * 0.24 * scale);
}

function drawBubbles(nowT) {
  for (const b of state.bubbles) {
    const alpha = Math.max(0.15, Math.min(0.55, b.ttl / state.bubbleTTL));
    const cx = b.x * CELL + CELL / 2;
    const cy = b.y * CELL + CELL / 2;
    const rr = b.r * CELL + CELL * 0.35;

    ctx.save();
    const tint = (BUBBLES[b.type]?.tint || "rgba(255,255,255,ALPHA)").replace("ALPHA", String(alpha));
    ctx.fillStyle = tint;

    ctx.beginPath();
    ctx.arc(cx, cy, rr, 0, Math.PI * 2);
    ctx.fill();

    ctx.globalAlpha = Math.min(0.9, alpha + 0.25);
    ctx.font = `${Math.floor(CELL * 1.1)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(BUBBLES[b.type].emoji, cx, cy);

    const pulse = 1 + Math.sin(nowT * 0.002 + b.x * 0.3) * 0.03;
    ctx.globalAlpha = alpha * 0.55;
    ctx.strokeStyle = "rgba(255,255,255,0.6)";
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy, rr * pulse, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}

function drawSnake(snake, nowT) {
  if (!snake.alive) return;

  const now = Date.now();
  const shield = now < snake.shieldUntil;
  const mood = snake.isPlayer ? moodEmoji(state.combo.streak) : snake.nameEmoji;
  const r = snakeRadius(snake);

  const pts = [];

  for (let i = 0; i < snake.body.length; i++) {
    const b = snake.body[i];
    const cx = b.x * CELL + CELL / 2;
    const cy = b.y * CELL + CELL / 2;
    pts.push({ x: cx, y: cy });
  }

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) {
    const prev = snake.body[i - 1];
    const cur = snake.body[i];
    const gap = Math.abs(prev.x - cur.x) + Math.abs(prev.y - cur.y) > 1;
    if (gap) ctx.moveTo(pts[i].x, pts[i].y);
    else ctx.lineTo(pts[i].x, pts[i].y);
  }

  ctx.lineWidth = r * 2;
  ctx.strokeStyle = snake.isPlayer ? "rgba(90,167,255,0.88)" : "rgba(255,160,210,0.85)";
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(pts[0].x, pts[0].y, r * 1.18, 0, Math.PI * 2);
  ctx.fillStyle = snake.isPlayer ? "rgba(102,240,163,0.95)" : "rgba(255,120,190,0.92)";
  ctx.fill();

  if (shield) {
    ctx.beginPath();
    ctx.arc(pts[0].x, pts[0].y, r * 1.65, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(160,255,210,0.85)";
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  ctx.restore();

  const hx = snake.body[0].x;
  const hy = snake.body[0].y;
  drawEmoji(mood, hx, hy, 0.95);

  if (AUTO_CHOMP_ENABLED && now < snake.autoChompUntil) drawEmoji("😵‍💫", hx, hy, 0.75);
  if (ZONE_STEER_ENABLED && now < snake.steeredUntil) drawEmoji("😂", hx, hy, 0.70);
  if (shield) drawEmoji("🛡️", hx, hy, 0.70);
}

function renderFx(nowT) {
  const out = [];
  for (const f of state.fx) {
    const age = nowT - f.born;
    if (age >= f.life) continue;

    const t = age / f.life;
    const px = f.x * CELL + CELL / 2 + f.vx * age * 0.08;
    const py = f.y * CELL + CELL / 2 + f.vy * age * 0.10;

    let scale = f.scale;
    if (f.kind === "pop") {
      scale *= (t < 0.25 ? (1 + t * 1.4) : (1.35 - (t - 0.25) * 0.5));
    } else {
      scale *= (1.0 + Math.sin(t * Math.PI) * 0.15);
    }

    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.font = `${Math.floor(CELL * 1.2 * scale)}px system-ui`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(f.emoji, px, py);
    ctx.restore();

    out.push(f);
  }
  state.fx = out;
}

function updateCamera() {
  if (!state.player) return;
  const h = snakeHead(state.player);
  const hx = h.x * CELL + CELL / 2;
  const hy = h.y * CELL + CELL / 2;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const wrapDelta = (a, b, size) => {
    let d = a - b;
    if (d > size / 2) d -= size;
    if (d < -size / 2) d += size;
    return d;
  };
  const dx = state.wrap ? wrapDelta(hx, cx, canvas.width) : (hx - cx);
  const dy = state.wrap ? wrapDelta(hy, cy, canvas.height) : (hy - cy);
  const targetX = -dx * 0.12;
  const targetY = -dy * 0.12;
  const maxOffset = Math.min(140, canvas.width * 0.18);
  const tx = clamp(targetX, -maxOffset, maxOffset);
  const ty = clamp(targetY, -maxOffset, maxOffset);

  state.camera.x += (tx - state.camera.x) * 0.08;
  state.camera.y += (ty - state.camera.y) * 0.08;
}

function getShakeOffset() {
  if (state.shake.power <= 0.01) return { x: 0, y: 0 };
  const angle = Math.random() * Math.PI * 2;
  const amp = state.shake.power;
  state.shake.power *= 0.86;
  return { x: Math.cos(angle) * amp, y: Math.sin(angle) * amp };
}

function drawChain() {
  if (!state.player) return;
  if (!state.chain.list.length) return;
  if (Date.now() - state.chain.lastAt > CHAIN_WINDOW_MS) return;
  const h = snakeHead(state.player);
  const text = state.chain.list.join("");
  ctx.save();
  ctx.font = `${Math.floor(CELL * 1.1)}px system-ui`;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.fillText(text, h.x * CELL + CELL / 2, h.y * CELL - CELL * 0.2);
  ctx.restore();
}

function drawPreviewCircle(cx, cy, rCells, color) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.setLineDash([6, 6]);
  ctx.beginPath();
  ctx.arc(cx, cy, rCells * CELL, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawSkillPreview() {
  if (!state.player) return;
  const h = snakeHead(state.player);
  const cx = h.x * CELL + CELL / 2;
  const cy = h.y * CELL + CELL / 2;

  for (let i = 0; i < 3; i++) {
    if (!isSkillPreviewActive(i)) continue;
    const key = state.player.skillSlots[i];
    if (!key) continue;
    if (key === "BOMB") {
      drawPreviewCircle(cx, cy, BOMB_RADIUS, "rgba(255,160,160,0.85)");
    } else if (key === "MAGNET") {
      drawPreviewCircle(cx, cy, MAGNET_PULL_RANGE, "rgba(120,220,255,0.8)");
    } else if (key === "SHIELD") {
      drawPreviewCircle(cx, cy, 2, "rgba(160,255,210,0.9)");
    } else if (key === "DASH") {
      drawPreviewCircle(cx, cy, 3, "rgba(255,220,120,0.8)");
    }
  }
}

function render() {
  const nowT = performance.now();
  updateCamera();
  const shake = getShakeOffset();

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(state.camera.x + shake.x, state.camera.y + shake.y);
  drawGridBackground();

  drawBubbles(nowT);

  for (const r of state.rocks) drawEmoji("🪨", r.x, r.y, 1.0);

  // pellets
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  for (const p of state.pellets) drawBallCell(p.x, p.y, 1.9);

  // meat chains
  ctx.fillStyle = "rgba(255,170,210,0.95)";
  for (const ch of state.meatChains) {
    const alpha = Math.max(0.28, Math.min(1, ch.ttl / state.meatTTL));
    for (const p of ch.points) drawBallCell(p.x, p.y, 2.5, alpha);
  }

  // gift
  if (state.gift) {
    drawEmoji("🎁", state.gift.x, state.gift.y, 1.0);
    drawEmoji(state.gift.skillEmoji, state.gift.x, state.gift.y, 0.75);
  }

  // drops
  for (const d of state.zoneDrops) drawEmoji(d.emoji, d.x, d.y, 1.0);

  // shots
  for (const s of state.zoneShots) drawEmoji("😂", s.x, s.y, 0.95);

  // eggs
  for (const e of state.eggs) drawEmoji(e.emoji, e.x, e.y, 1.0);

  drawSnake(state.player, nowT);
  for (const a of state.aiSnakes) drawSnake(a, nowT);

  drawSkillPreview();
  drawChain();
  renderFx(nowT);
  ctx.restore();

  if (state.paused && state.running) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "28px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Paused", canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = "14px system-ui";
    ctx.fillText("按 Space 继续", canvas.width / 2, canvas.height / 2 + 18);
  }

  if (!state.running && state.score > 0) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "30px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "14px system-ui";
    ctx.fillText("按 R 重开 / 点击“重开”", canvas.width / 2, canvas.height / 2 + 12);
  }
  if (state.awaitingReplace && state.running) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#fff";
    ctx.font = "24px system-ui";
    ctx.textAlign = "center";
    ctx.fillText(`拾到 ${state.awaitingReplace.skillEmoji}，替换哪个？`, canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = "14px system-ui";
    ctx.fillText("[1] [2] [3] 选择替换槽位", canvas.width / 2, canvas.height / 2 + 10);
  }
}

// ---- 主循环 ----
function loop(t) {
  if (!state.running) { render(); return; }
  const dt = t - state.lastT;
  state.lastT = t;

  const scale = (t < state.slowmo.until) ? state.slowmo.scale : 1;
  if (t >= state.slowmo.until && state.slowmo.scale !== 1) state.slowmo.scale = 1;
  state.acc += dt * scale;
  let steps = 0;
  while (state.acc >= state.logicStepMs && steps < 10) {
    logicTick();
    state.acc -= state.logicStepMs;
    steps++;
    if (!state.running) break;
  }

  render();
  requestAnimationFrame(loop);
}

// ---- 控制 ----
function setBoostHeld(on) {
  if (!state.player) return;
  if (state.awaitingReplace || state.paused) return;
  if (on && snakeLen(state.player) <= state.player.baseLen) return;
  state.player.boostHeld = on;
}

function bindHoldButton(el, onDown, onUp) {
  if (!el) return;
  const up = () => { if (onUp) onUp(); };
  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    unlockAudio();
    if (onDown) onDown();
    try { el.setPointerCapture(e.pointerId); } catch (_) {}
  });
  el.addEventListener("pointerup", (e) => { e.preventDefault(); up(); });
  el.addEventListener("pointercancel", (e) => { e.preventDefault(); up(); });
  el.addEventListener("lostpointercapture", () => { up(); });
}

function startSkillHold(slotIndex) {
  const hold = state.skillHold[slotIndex];
  if (!hold || hold.down) return;
  if (state.awaitingReplace || state.paused) return;
  if (!state.player) return;
  const key = state.player.skillSlots[slotIndex];
  if (!key) { beep(220, 40, "square", 0.01); return; }
  hold.down = true;
  hold.startedAt = performance.now();
  if (key === "DASH") state.player.dashHeld = true;
}

function releaseSkillHold(slotIndex) {
  const hold = state.skillHold[slotIndex];
  if (!hold || !hold.down) return;
  hold.down = false;
  if (state.awaitingReplace || state.paused) return;
  if (!state.player) return;
  const key = state.player.skillSlots[slotIndex];
  if (!key) return;
  if (key === "DASH") {
    state.player.dashHeld = false;
    return;
  }
  useSkill(state.player, slotIndex);
}

function isSkillPreviewActive(slotIndex) {
  const hold = state.skillHold[slotIndex];
  if (!hold || !hold.down) return false;
  return (performance.now() - hold.startedAt) >= SKILL_PREVIEW_MS;
}

function togglePause() {
  if (!state.running || state.awaitingReplace) return;
  state.paused = !state.paused;
  beep(380, 50, "square", 0.015);
  syncMusicState();
  ui();
}

function toggleMode() {
  state.wrap = !state.wrap;
  beep(520, 60, "triangle", 0.015);
  ui();
}

const joystickState = {
  active: false,
  pointerId: null,
  originX: 0,
  originY: 0,
  max: 40,
  lastDir: null,
};
const JOYSTICK_DEADZONE = 10;

function joystickDirFromVector(dx, dy) {
  const dist = Math.hypot(dx, dy);
  if (dist < JOYSTICK_DEADZONE) return null;
  if (Math.abs(dx) > Math.abs(dy)) return { x: dx > 0 ? 1 : -1, y: 0 };
  return { x: 0, y: dy > 0 ? 1 : -1 };
}

function updateJoystick(dx, dy) {
  if (!joystickStick) return;
  const dist = Math.hypot(dx, dy);
  const max = joystickState.max;
  const scale = dist > max ? max / dist : 1;
  const rx = dx * scale;
  const ry = dy * scale;
  joystickStick.style.transform = `translate(-50%, -50%) translate(${rx}px, ${ry}px)`;

  const dir = joystickDirFromVector(dx, dy);
  if (!dir) {
    joystickState.lastDir = null;
    return;
  }
  const last = joystickState.lastDir;
  if (!last || dir.x !== last.x || dir.y !== last.y) {
    enqueueDir(dir.x, dir.y);
    joystickState.lastDir = dir;
  }
}

function resetJoystick() {
  joystickState.active = false;
  joystickState.pointerId = null;
  joystickState.lastDir = null;
  if (joystickStick) joystickStick.style.transform = "translate(-50%, -50%) translate(0px, 0px)";
}

window.addEventListener("keydown", (e) => {
  const k = e.key;
  unlockAudio();
  if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," "].includes(k)) e.preventDefault();

  if (state.awaitingReplace && ["1","2","3"].includes(k)) {
    resolveSkillReplace(Number(k) - 1);
    return;
  }

  if (k === "ArrowUp" || k === "w" || k === "W") enqueueDir(0, -1);
  if (k === "ArrowDown" || k === "s" || k === "S") enqueueDir(0, 1);
  if (k === "ArrowLeft" || k === "a" || k === "A") enqueueDir(-1, 0);
  if (k === "ArrowRight" || k === "d" || k === "D") enqueueDir(1, 0);

  if (k === " ") {
    if (AUTO_CHOMP_ENABLED && Date.now() < state.player.autoChompUntil) cancelAutoChomp(state.player);
    else togglePause();
  }
  if (k === "m" || k === "M") toggleMode();
  if (k === "r" || k === "R") { resetGame(); startGame(); }
  if (k === "v" || k === "V") toggleSound();
  if (ASSIST_ENABLED && (k === "h" || k === "H")) { state.assistOn = !state.assistOn; beep(420, 60, "square", 0.015); ui(); }
  if (k === "e" || k === "E") setBoostHeld(true);

  if (e.shiftKey && k === "1") dropSkill(state.player, 0);
  else if (e.shiftKey && k === "2") dropSkill(state.player, 1);
  else if (e.shiftKey && k === "3") dropSkill(state.player, 2);
  else if (k === "1") startSkillHold(0);
  else if (k === "2") startSkillHold(1);
  else if (k === "3") startSkillHold(2);

  if (k === "z" || k === "Z") dropSkill(state.player, 0);
  if (k === "x" || k === "X") dropSkill(state.player, 1);
  if (k === "c" || k === "C") dropSkill(state.player, 2);
});

window.addEventListener("keyup", (e) => {
  const k = e.key;
  if (k === "1") releaseSkillHold(0);
  if (k === "2") releaseSkillHold(1);
  if (k === "3") releaseSkillHold(2);
  if (k === "e" || k === "E") setBoostHeld(false);
});

// ---- 开局/重置 ----
function resetGame() {
  state.running = false;
  state.paused = false;
  state.awaitingReplace = null;
  state.dirQueue = [];
  for (const h of state.skillHold) { h.down = false; h.startedAt = 0; }

  state.score = 0;
  state.acc = 0;
  state.lastT = 0;

  state.combo.streak = 0;
  state.combo.mult = 1;
  state.combo.lastAt = 0;
  state.chain.list = [];
  state.chain.lastAt = 0;
  state.assistCd = 0;
  state.shake.power = 0;
  state.slowmo.until = 0;
  state.slowmo.scale = 1;
  state.camera.x = 0;
  state.camera.y = 0;

  state.pellets = [];
  state.rocks = [];
  state.rockSet.clear();
  state.meatChains = [];
  state.meatChainIdSeq = 1;
  state.eggs = [];

  state.bubbles = [];
  state.bubbleSpawnCd = 400;

  state.zoneShots = [];
  state.zoneDrops = [];

  const sx = Math.floor(COLS / 4);
  const sy = Math.floor(ROWS / 2);
  state.player = makeSnake({ isPlayer: true, x: sx, y: sy, dir: {x:1,y:0}, len: 8, nameEmoji: "🙂" });
  state.player.moveCd = 0;

  state.aiSnakes = [];
  state.aiIdSeq = 1;

  state.gift = null;
  state.giftCooldownMs = 700;

  refillPellets();
  spawnGift(true);
  syncAISnakes();

  syncMusicState();
  ui();
  render();
}

function startGame() {
  if (state.running) {
    if (state.paused) {
      togglePause();
    }
    return;
  }
  if (!state.player || !state.player.alive) {
    resetGame();
  }
  state.running = true;
  state.paused = false;
  state.lastT = performance.now();
  syncMusicState();
  requestAnimationFrame(loop);
  ui();
}

btnStart.addEventListener("click", () => {
  unlockAudio();
  beep(440, 50, "square", 0.02);
  startGame();
});
btnRestart.addEventListener("click", () => {
  unlockAudio();
  beep(440, 50, "square", 0.02);
  resetGame();
  startGame();
});
if (btnSound) {
  btnSound.addEventListener("click", () => {
    unlockAudio();
    toggleSound();
  });
}

if (btnPause) {
  btnPause.addEventListener("click", () => {
    unlockAudio();
    togglePause();
  });
}
if (btnBoost) {
  bindHoldButton(btnBoost, () => setBoostHeld(true), () => setBoostHeld(false));
}
for (let i = 0; i < btnSkill.length; i++) {
  const el = btnSkill[i];
  if (!el) continue;
  bindHoldButton(
    el,
    () => {
      if (state.awaitingReplace) { resolveSkillReplace(i); return; }
      startSkillHold(i);
    },
    () => {
      if (state.awaitingReplace) return;
      releaseSkillHold(i);
    }
  );
}

if (joystick && joystickStick) {
  const end = () => resetJoystick();
  joystick.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    unlockAudio();
    joystickState.active = true;
    joystickState.pointerId = e.pointerId;
    const rect = joystick.getBoundingClientRect();
    joystickState.originX = rect.left + rect.width / 2;
    joystickState.originY = rect.top + rect.height / 2;
    joystickState.max = Math.max(28, Math.min(rect.width, rect.height) * 0.38);
    try { joystick.setPointerCapture(e.pointerId); } catch (_) {}
    updateJoystick(e.clientX - joystickState.originX, e.clientY - joystickState.originY);
  });
  joystick.addEventListener("pointermove", (e) => {
    if (!joystickState.active || e.pointerId !== joystickState.pointerId) return;
    e.preventDefault();
    updateJoystick(e.clientX - joystickState.originX, e.clientY - joystickState.originY);
  });
  joystick.addEventListener("pointerup", end);
  joystick.addEventListener("pointercancel", end);
  joystick.addEventListener("lostpointercapture", end);
}

highEl.textContent = String(state.high);
resetGame();
ui();
render();
