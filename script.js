const SAVE_KEY = "collectorSaveV1";

const upgradeDefinitions = {
  betterCollector: {
    name: "Better Collector",
    description: "+1 base Energy per click per level.",
    baseCost: 15,
    costScale: 1.45,
  },
  autoCollector: {
    name: "Auto Collector",
    description: "+1 base Energy per second per level.",
    baseCost: 50,
    costScale: 1.5,
  },
  energyCore: {
    name: "Energy Core",
    description: "+10% to all click and automatic production per level.",
    baseCost: 120,
    costScale: 1.7,
  },
  luckySpark: {
    name: "Lucky Spark",
    description: "+5% chance per level for a 5x click bonus.",
    baseCost: 80,
    costScale: 1.62,
  },
};

const achievements = [
  {
    id: "firstClick",
    name: "First Click",
    description: "Collect Energy for the first time.",
    isUnlocked: (state) => state.clicks > 0,
  },
  {
    id: "energy100",
    name: "100 Energy",
    description: "Earn 100 total Energy.",
    isUnlocked: (state) => state.totalEnergy >= 100,
  },
  {
    id: "energy1000",
    name: "1,000 Energy",
    description: "Earn 1,000 total Energy.",
    isUnlocked: (state) => state.totalEnergy >= 1000,
  },
  {
    id: "firstUpgrade",
    name: "First Upgrade",
    description: "Buy any upgrade.",
    isUnlocked: (state) => totalUpgradeLevels(state) >= 1,
  },
  {
    id: "tenUpgrades",
    name: "10 Upgrades",
    description: "Buy 10 upgrade levels in total.",
    isUnlocked: (state) => totalUpgradeLevels(state) >= 10,
  },
];

const defaultState = {
  energy: 0,
  totalEnergy: 0,
  clicks: 0,
  muted: false,
  upgrades: {
    betterCollector: 0,
    autoCollector: 0,
    energyCore: 0,
    luckySpark: 0,
  },
  achievements: {},
};

let state = loadGame();
let audioContext;

const elements = {
  energyAmount: document.querySelector("#energyAmount"),
  perClickAmount: document.querySelector("#perClickAmount"),
  energyPerSecond: document.querySelector("#energyPerSecond"),
  totalEnergy: document.querySelector("#totalEnergy"),
  upgradesBought: document.querySelector("#upgradesBought"),
  bonusChance: document.querySelector("#bonusChance"),
  collectorButton: document.querySelector("#collectorButton"),
  floatLayer: document.querySelector("#floatLayer"),
  upgradesList: document.querySelector("#upgradesList"),
  achievementsList: document.querySelector("#achievementsList"),
  toastLayer: document.querySelector("#toastLayer"),
  resetButton: document.querySelector("#resetButton"),
  muteButton: document.querySelector("#muteButton"),
};

function totalUpgradeLevels(currentState = state) {
  return Object.values(currentState.upgrades).reduce((sum, level) => sum + level, 0);
}

function productionMultiplier() {
  return 1 + state.upgrades.energyCore * 0.1;
}

function energyPerClick() {
  return (1 + state.upgrades.betterCollector) * productionMultiplier();
}

function energyPerSecond() {
  return state.upgrades.autoCollector * productionMultiplier();
}

function luckyChance() {
  return Math.min(0.75, state.upgrades.luckySpark * 0.05);
}

function upgradeCost(id) {
  const upgrade = upgradeDefinitions[id];
  return Math.floor(upgrade.baseCost * upgrade.costScale ** state.upgrades[id]);
}

function addEnergy(amount) {
  state.energy += amount;
  state.totalEnergy += amount;
  checkAchievements();
  render();
  saveGame();
}

function collectEnergy(event) {
  state.clicks += 1;
  const baseAmount = energyPerClick();
  const luckyHit = Math.random() < luckyChance();
  const amount = luckyHit ? baseAmount * 5 : baseAmount;
  addEnergy(amount);
  showFloatingText(event, `+${formatNumber(amount)}${luckyHit ? " Lucky!" : ""}`);
  playSound(luckyHit ? "achievement" : "click");

  elements.collectorButton.classList.remove("pop");
  void elements.collectorButton.offsetWidth;
  elements.collectorButton.classList.add("pop");
  setTimeout(() => elements.collectorButton.classList.remove("pop"), 160);
}

function buyUpgrade(id) {
  const cost = upgradeCost(id);
  if (state.energy < cost) {
    return;
  }

  state.energy -= cost;
  state.upgrades[id] += 1;
  playSound("upgrade");
  checkAchievements();
  render();
  saveGame();
}

function render() {
  elements.energyAmount.textContent = formatNumber(state.energy);
  elements.perClickAmount.textContent = formatNumber(energyPerClick());
  elements.energyPerSecond.textContent = formatNumber(energyPerSecond());
  elements.totalEnergy.textContent = formatNumber(state.totalEnergy);
  elements.upgradesBought.textContent = formatNumber(totalUpgradeLevels());
  elements.bonusChance.textContent = `${Math.round(luckyChance() * 100)}%`;
  elements.muteButton.textContent = state.muted ? "🔇 Muted" : "🔊 Sound";
  elements.muteButton.setAttribute("aria-pressed", String(state.muted));

  renderUpgrades();
  renderAchievements();
}

function renderUpgrades() {
  elements.upgradesList.innerHTML = "";

  Object.entries(upgradeDefinitions).forEach(([id, upgrade]) => {
    const level = state.upgrades[id];
    const cost = upgradeCost(id);
    const card = document.createElement("article");
    card.className = "upgrade-card";
    card.innerHTML = `
      <div class="upgrade-top">
        <div>
          <div class="upgrade-name">${upgrade.name}</div>
          <p class="upgrade-description">${upgrade.description}</p>
        </div>
        <span class="level-pill">Level ${level}</span>
      </div>
      <div class="buy-row">
        <span class="cost">Cost: ${formatNumber(cost)} Energy</span>
        <button class="buy-button" type="button" ${state.energy < cost ? "disabled" : ""}>Buy</button>
      </div>
    `;
    card.querySelector("button").addEventListener("click", () => buyUpgrade(id));
    elements.upgradesList.append(card);
  });
}

function renderAchievements() {
  elements.achievementsList.innerHTML = "";

  achievements.forEach((achievement) => {
    const unlocked = Boolean(state.achievements[achievement.id]);
    const card = document.createElement("article");
    card.className = `achievement-card ${unlocked ? "unlocked" : "locked"}`;
    card.innerHTML = `
      <div>
        <div class="achievement-name">${achievement.name}</div>
        <p class="achievement-description">${achievement.description}</p>
      </div>
      <span class="achievement-status" aria-label="${unlocked ? "Unlocked" : "Locked"}">${unlocked ? "✓" : "?"}</span>
    `;
    elements.achievementsList.append(card);
  });
}

function checkAchievements() {
  achievements.forEach((achievement) => {
    if (!state.achievements[achievement.id] && achievement.isUnlocked(state)) {
      state.achievements[achievement.id] = true;
      showToast("Achievement unlocked!", achievement.name);
      playSound("achievement");
    }
  });
}

function showFloatingText(event, text) {
  const floatText = document.createElement("span");
  const bounds = elements.floatLayer.getBoundingClientRect();
  const x = event.clientX ? event.clientX - bounds.left : bounds.width / 2;
  const y = event.clientY ? event.clientY - bounds.top : bounds.height / 2;
  floatText.className = "float-text";
  floatText.textContent = text;
  floatText.style.left = `${x}px`;
  floatText.style.top = `${y}px`;
  floatText.style.setProperty("--drift", `${Math.round(Math.random() * 80 - 40)}px`);
  elements.floatLayer.append(floatText);
  setTimeout(() => floatText.remove(), 950);
}

function showToast(title, message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = `<strong>${title}</strong><span>${message}</span>`;
  elements.toastLayer.append(toast);
  setTimeout(() => toast.remove(), 3300);
}

function formatNumber(value) {
  if (value < 1000) {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  const units = ["", "K", "M", "B", "T", "Qa", "Qi"];
  const tier = Math.min(Math.floor(Math.log10(value) / 3), units.length - 1);
  const scaled = value / 1000 ** tier;
  return `${scaled >= 100 ? scaled.toFixed(0) : scaled >= 10 ? scaled.toFixed(1) : scaled.toFixed(2)}${units[tier]}`;
}

function saveGame() {
  localStorage.setItem(SAVE_KEY, JSON.stringify(state));
}

function createDefaultState() {
  return JSON.parse(JSON.stringify(defaultState));
}

function loadGame() {
  const saved = localStorage.getItem(SAVE_KEY);
  if (!saved) {
    return createDefaultState();
  }

  try {
    const parsed = JSON.parse(saved);
    return {
      ...createDefaultState(),
      ...parsed,
      upgrades: { ...defaultState.upgrades, ...parsed.upgrades },
      achievements: { ...defaultState.achievements, ...parsed.achievements },
    };
  } catch {
    return createDefaultState();
  }
}

function resetProgress() {
  const confirmed = confirm("Reset all Collector progress? This cannot be undone.");
  if (!confirmed) {
    return;
  }

  state = createDefaultState();
  localStorage.removeItem(SAVE_KEY);
  showToast("Progress reset", "A fresh Collector run is ready.");
  render();
}

function getAudioContext() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

function playSound(type) {
  if (state.muted) {
    return;
  }

  const context = getAudioContext();
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  const now = context.currentTime;
  const settings = {
    click: { start: 520, end: 760, duration: 0.08, volume: 0.045, wave: "sine" },
    upgrade: { start: 420, end: 980, duration: 0.16, volume: 0.065, wave: "triangle" },
    achievement: { start: 740, end: 1320, duration: 0.22, volume: 0.075, wave: "sine" },
  }[type];

  oscillator.type = settings.wave;
  oscillator.frequency.setValueAtTime(settings.start, now);
  oscillator.frequency.exponentialRampToValueAtTime(settings.end, now + settings.duration);
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(settings.volume, now + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + settings.duration);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start(now);
  oscillator.stop(now + settings.duration + 0.02);
}

function toggleMute() {
  state.muted = !state.muted;
  render();
  saveGame();
}

elements.collectorButton.addEventListener("click", collectEnergy);
elements.resetButton.addEventListener("click", resetProgress);
elements.muteButton.addEventListener("click", toggleMute);

setInterval(() => {
  const income = energyPerSecond();
  if (income > 0) {
    addEnergy(income);
  }
}, 1000);

setInterval(saveGame, 5000);

checkAchievements();
render();
